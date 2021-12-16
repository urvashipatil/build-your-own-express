//Create a class for Router and add listen method
//and provison for adding routes

const http = require("http");
const { METHODS } = require("http");
const port = 3000;

class Router {
  constructor() {
    this.routes = {};
    METHODS.map((verb) => {
      this.routes[verb.toLocaleLowerCase()] = [];

      this[verb.toLocaleLowerCase()] = (path, callback) => {
        console.log("path", path);
        this.routes[verb.toLocaleLowerCase()].push({
          path,
          callback,
        });
      };
    });
  }

  listen = (port, callback) => {
    let server = http.createServer((req, res) => {
      console.log("req", req.url, req.method);
      res.writeHead(200, { "Content-Type": "text-plain" });
      res.write("HI  All");
      res.end();
    });

    server.listen.apply(server, [port, callback]);
  };
}

module.exports = Router;
