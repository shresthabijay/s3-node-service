const http = require("http");
require("dotenv").config();

const server = http.createServer(require("./app"));

server.listen(process.env.PORT, () =>
  console.log("Server started at port " + process.env.PORT)
);
