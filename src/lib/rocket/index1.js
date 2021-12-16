//Moved Listen method from router to app
//Move  use method from router to app
const http = require("http");
const { METHODS } = require("http");
const Router = require("../../router");

class App {
  constructor() {
    this.router = new Router();
    this.middlewares = [];
    this.middlewareIndex = 0;

    //to allow app.get() , app.post()
    METHODS.map((verb) => {
      this[verb.toLocaleLowerCase()] = [];

      this[verb.toLocaleLowerCase()] = (path, callback) => {
        console.log("path", path);
        this.router.addRoute(verb, path, callback);
        // this.router[verb.toLocaleLowerCase()].push({
        //   verb,
        //   path,
        //   callback,
        // });
      };
    });
  }

  use = function (callback) {
    console.log("middleware added");
    //check if middleware is function of any router path pp.use("/profile",router)
    if (typeof callback == "function") {
      this.router.middlewares.push(callback);
    } else {
      let fn = arguments[1]; // router (fn)
      fn.scope = arguments[0]; //"/profile"
      this.router.middlewares.push(fn);
    }
    return this;
  };

  listen = (port, callback) => {
    let server = http.createServer((req, res) => {
      this.router.handle(req, res);
    });

    server.listen.apply(server, [port, callback]);
  };
}

module.exports = App;
