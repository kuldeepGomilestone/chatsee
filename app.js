

// Get the port number from the command line's -p argument
let argv = require('minimist')(process.argv.slice(2));
let port = argv.p || 0;
if (port == 0) {
    console.log("Port number is not specified");
    process.exit(1);
}

const { spawn } = require("child_process");
const path = require("path");

// Paths to React and Node.js apps
const nodeAppPath = path.resolve(__dirname, "");

// Function to start a process
const startProcess = (command, args, options, name) => {
  const process = spawn(command, args, options);

  // Log the output
  process.stdout.on("data", (data) => {
    console.log(`[${name}]: ${data}`);
  });

  process.stderr.on("data", (data) => {
    console.error(`[${name} Error]: ${data}`);
  });

  process.on("close", (code) => {
    console.log(`[${name}]: Process exited with code ${code}`);
  });

  return process;
};

// Start React app with the port
console.log("Starting React app...");
startProcess(
  "npm",
  ["run", "start"],
  { cwd: nodeAppPath, shell: true, env: { ...process.env, PORT: port } },
  "NODEJS"
);

