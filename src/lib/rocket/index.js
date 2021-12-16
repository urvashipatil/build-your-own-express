//Moved Listen method from router to app
//Move  use method from router to app
const http = require("http");
const static = require("serve-static");
const { METHODS } = require("http");
const Router = require("../router");

class App {
  constructor() {
    this.router = new Router();
    // this.middlewares = [];
    // this.middlewareIndex = 0;

    //to allow app.get() , app.post()
    METHODS.map((verb) => {
      this[verb.toLocaleLowerCase()] = [];

      this[verb.toLocaleLowerCase()] = (path, ...callback) => {
        console.log("path", path);

        // if (callback.length == 2) {
        //   this.router.middlewares.push(callback[0]);
        // }

        this.router.addRoute(
          verb,
          path,
          callback[callback.length - 1],
          callback.length == 2 ? callback[0] : null
        );
        // this.router[verb.toLocaleLowerCase()].push({
        //   verb,
        //   path,
        //   callback,
        // });
      };
    });
  }

  static = function (rootPath) {};

  use = function (callback) {
    console.log("middleware added");
    //check if middleware is function of any router path pp.use("/profile",router)
    if (typeof callback == "function") {
      this.router.middlewares.push(callback);
    } else {
      console.log("prefix..............");
      let routerObj = arguments[1]; // router (fn)
      // debugger;
      // console.log("fn", fn.routes);
      let routePrefix = arguments[0]; //"/profile"
      // this.router.middlewares.push(fn);
      METHODS.map((verb) => {
        routerObj.routes[verb.toLocaleLowerCase()].map((r) => {
          this.router.addRoute(verb, routePrefix + r.path, r.callback);
        });
      });
    }
    return this;
  };

  listen = (port, callback) => {
    let server = http.createServer((req, res) => {
      // this.router.handle(req, res);
      this.router.handleRequest(req, res);
    });

    // server.listen.apply(server, [port, callback]);
    server.listen(port, callback);
  };
}

App.static = static;

module.exports = App;
