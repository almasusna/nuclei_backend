const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { validateIp, cleanMessage, logData } = require("./utils/helper");
const { fork } = require("child_process");

app = express();
app.use(cors());
app.use(express.json());

const pathToLogs = "./logs/logs.json";

app.get("/api/logs", (req, res) => {
  const logs = JSON.parse(fs.readFileSync(pathToLogs, "utf8"));
  res.send(logs);
});

app.get("/api/logs/:id", (req, res) => {
  const { logs } = JSON.parse(fs.readFileSync(pathToLogs, "utf8"));
  const scan = logs.find((element) => element.ip === req.params.id);
  res.send(scan);
});

app.post("/api/scan", (req, res) => {
  if (validateIp(req.body.ipAddr)) {
    const childProcess = fork("./utils/scanner.js");
    childProcess.send(req.body.ipAddr);
    let scanData = [];

    childProcess.on("message", function (message) {
      const filtered = cleanMessage(message);
      console.log(message);
      if (
        !(
          filtered.includes("[INF]") ||
          filtered.includes("projectdiscovery") ||
          filtered.includes("child process") ||
          filtered.length < 5
        )
      ) {
        const trimmed = filtered.trim();
        const splitted = trimmed.split("\n");
        console.log(splitted);
        scanData.push(...splitted);
      }

      if (message.includes("child process exited")) {
        console.log(scanData);
        logData(req.body.ipAddr, scanData, pathToLogs);
        childProcess.kill("SIGINT");
      }
    });
  } else {
    console.log("IP is Invalid");
  }
});

const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Listening on port ${port}`));
