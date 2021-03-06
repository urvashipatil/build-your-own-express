//Moved Listen method from router to app
//Move  use method from router to app - Add render and set method

//Add support to set view engine
const http = require("http");
const static = require("serve-static");
const { METHODS } = require("http");
const Router = require("../router");
let Response = require("../response");
let cons = require("consolidate"); //Template engine consolidation library.
//NOTE: you must still install the engines you wish to use, add them to your package.json dependencies.

class App {
  constructor() {
    this.router = new Router();
    this.settings = {};

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

  set(name, value) {
    this.settings[name] = value;
  }

  //To support view engine
  render(file, locals, callback) {
    let engineName = this.settings["view engine"],
      engine = cons[engineName],
      path = this.settings["views"] + "/" + file + "." + engineName; // Optimization required

    engine(path, locals, function (err, html) {
      if (err) throw err;
      callback(html);
    });
  }

  listen = (port, callback) => {
    let server = http.createServer((req, res) => {
      // this.router.handle(req, res);
      res.__proto__ = Response.prototype;
      res.app = this;
      this.router.handleRequest(req, res);
    });

    // server.listen.apply(server, [port, callback]);
    server.listen(port, callback);
  };
}

App.static = static;

module.exports = App;
