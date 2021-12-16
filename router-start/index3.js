//Router - Add MatchUrl method for exact match
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

  matchUrl = (path, method) => {
    let match = this.routes[method.toLocaleLowerCase()].find(
      (r) => r.path == path
    );

    return match;
  };

  listen = (port, callback) => {
    let server = http.createServer((req, res) => {
      console.log("req", req.url, req.method);
      res.writeHead(200, { "Content-Type": "text-plain" });
      // res.write("HI  All");
      // let match = this.routes[req.method.toLocaleLowerCase()].find(
      //   (r) => r.path == req.url
      // );
      let match = this.matchUrl(req.url, req.method);
      if (match) {
        match.callback(req, res);
      } else {
        console.log("No route matched");
        res.end();
      }
      // res.end();
    });

    server.listen.apply(server, [port, callback]);

    // server.listen(port, () => {
    //   console.log(`server is running at ${port}`);
    // });
  };
}

module.exports = Router;
