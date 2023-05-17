const { spawn } = require("child_process");

process.on("message", (ipAddr) => {
  const nuclei_cmd = spawn("nuclei", ["-u", ipAddr]);

  nuclei_cmd.stdout.on("data", function (data) {
    process.send(`${data}`);
    //.log("From child:" + data);
  });

  nuclei_cmd.stderr.on("data", function (data) {
    process.send(`${data}`);
    //console.log("From child:" + data);
  });

  nuclei_cmd.on("close", function (code) {
    process.send(`child process exited with code ${code}`);
  });
});
