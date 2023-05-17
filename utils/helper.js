const { getIPRange } = require("get-ip-range");
const { isIP, isRange } = require("range_check");
var fs = require("fs");

const validateIp = (ipAddress) => {
  const target = ipAddress;
  let targetType = false;
  targetType = isIP(target) ? "ip" : false;
  if (!targetType) {
    targetType = isRange(target) ? "range" : false;
  }
  if (targetType) {
    if (targetType === "ip") {
      return target;
    }
    if (targetType === "range") {
      // CHANGE IP RANGE TO A LIST OF IPS
      const ipRange = getIPRange(target);
      return ipRange;
    }
  }
  return false;
};

const logData = (ip, scanData, pathToDb) => {
  // Get current data from logs
  fs.readFile(pathToDb, "utf8", function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      const obj = JSON.parse(data); //now it an object
      obj.logs.push({
        dateTime: new Date().toLocaleString(),
        ip: ip,
        scanLogs: scanData,
      }); //add some data
      json = JSON.stringify(obj); //convert it back to json
      fs.writeFile(pathToDb, json, "utf8", function (err) {
        if (err) throw err;
        console.log("complete");
      }); // write it back
    }
  });
};

const cleanMessage = (message) => {
  return message.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
};

const getLogs = () => {
  const data = fs.readFileSync("../logs/logs.json", {
    encoding: "utf8",
    flag: "r",
  });
  const obj = JSON.parse(data);
  //console.log(obj);
  const logs = obj["logs"];
  //console.log(logs);
  const filtered = obj.logs.filter((scan) => scan.ip === "10.115.4.2");
  return filtered[0].scanLogs;
};

const makeTable = (logs) => {
  const final = logs.map((line) => {
    const chunks = line.split(" ");
    const details = chunks.slice(3).toString();
    return {
      vulnarability: chunks[0],
      protocol: chunks[1],
      severity: chunks[2],
      details: details,
    };
  });
  return final;
};

// console.log(makeTable(getLogs()));

module.exports = {
  validateIp,
  logData,
  cleanMessage,
};
