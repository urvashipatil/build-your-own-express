//Router - created routers separate than app
//Remove server related code
//Rename listen --> handle --> add req and res parameter
//Comment older handle code of middleware. We need to move at app level as it
//is middleware at app level
//Comment use() . It will move at app level

//Correcting code where middleware should run irrespective of route matched or not.
// added handleRequest and modified route() method

// const http = require("http");
const fileSystem = require("fs");
path = require("path");
var contentDisposition = require("content-disposition");
const { METHODS } = require("http");
const { url } = require("inspector");
// const port = 3000;

class Router {
  constructor() {
    this.routes = {};
    this.middlewares = [];
    this.middlewareIndex = 0;
    METHODS.map((verb) => {
      this.routes[verb.toLocaleLowerCase()] = [];

      this[verb.toLocaleLowerCase()] = (path, callback) => {
        console.log("path", path);
        // this.routes[verb.toLocaleLowerCase()].push({
        //   path,
        //   callback,
        // });
        this.addRoute(verb, path, callback);
      };
    });
  }

  addRoute = (verb, path, callback) => {
    this.routes[verb.toLocaleLowerCase()].push({
      path,
      callback,
    });
  };

  // use = (callback) => {
  //   console.log("middleware added");
  //   //check if middleware is function of any router path pp.use("/profile",router)
  //   if (typeof callback == "function") {
  //     this.middlewares.push(callback);
  //   } else {
  //     let fn = arguments[1]; // router (fn)
  //     fn.scope = arguments[0]; //"/profile"
  //     this.middlewares.push(fn);
  //   }
  //   return this;
  // };

  matchUrl = (path, method) => {
    let urlParts = path.split("/").filter(Boolean);
    let methodRoutes = this.routes[method.toLocaleLowerCase()] || [];
    let matchedRouteObject = null;
    let matchedTokens = null;

    for (let m in methodRoutes) {
      let methodRoute = methodRoutes[m];
      let tokens = methodRoute.path.split("/").filter(Boolean);
      let found = true;
      if (tokens.length == urlParts.length) {
        // let match = methodRoutes.find((r) => r.path == path);
        // return match;
        for (let j = 0; j < tokens.length; j++) {
          if (!tokens[j].startsWith(":")) {
            if (tokens[j] != urlParts[j]) {
              found = false;
            }
          }
        }
      } else {
        //Not matched
        // console.log("No route matched");
        found = false;
        // return null;
      }
      if (found) {
        matchedRouteObject = methodRoute;
        matchedTokens = tokens;
        break;
      }
    }

    if (!matchedRouteObject) return null;

    //Matched
    //Search for request params

    let params = matchedTokens.reduce((paramObj, item, index) => {
      if (item.startsWith(":")) {
        paramObj[item.replace(":", "")] = urlParts[index];
      }
      return paramObj;
    }, {});

    console.log("params", params);

    // if (matchedRouteObject) {
    //   return matchedRouteObject;
    // }

    if (matchedRouteObject) {
      return {
        ...matchedRouteObject,
        params: params,
      };
    }

    return null;
  };

  _postData = (req, res, onComplete) => {
    let postedData = "";

    req.on("data", (chunk) => {
      postedData += chunk;
    });

    req.on("end", () => {
      req.rawBody = postedData;

      req.body = postedData;
      if (postedData.indexOf("{") > -1) {
        //json
        try {
          req.body = JSON.parse(postedData);
        } catch (e) {
          console.log("POST PARSE ERROR: ==>", e);
        }
      }
      onComplete(req, res);
    });

    return postedData;
  };

  //previous handle
  // handle = (match, req, res) => {
  //    match.callback(req, res);
  // };

  handleRequest = (req, res) => {
    var that = this;
    this.middlewareIndex = 0;
    let next = () => {
      let nextMiddleWare = this.middlewares[that.middlewareIndex++];
      if (nextMiddleWare) {
        nextMiddleWare(req, res, next);
      } else {
        // match.callback(req, res);
        this.handle(req, res);
      }
    };

    next();
  };

  //Improved version of handle
  route = (match, req, res) => {
    // var that = this;
    // let next = () => {
    //   let nextMiddleWare = this.middlewares[that.middlewareIndex++];
    //   if (nextMiddleWare) {
    //     nextMiddleWare(req, res, next);
    //   } else {
    //     match.callback(req, res);
    //   }
    // };

    // next();
    match.callback(req, res);
  };

  // listen = (port, callback) => {
  handle = (req, res) => {
    // let server = http.createServer((req, res) => {
    console.log("req", req.url, req.method);
    let method = req.method.toLocaleLowerCase();
    res.writeHead(200, { "Content-Type": "text-plain" });

    let match = this.matchUrl(req.url, method);
    if (match) {
      // this.middlewareIndex = 0;
      if (match?.params) {
        req.params = match.params;
      }
      if (method == "post") {
        //read the posted data
        this._postData(req, res, (req, res) => {
          console.log("postdata callback");
          // match.callback(req, res);

          this.route(match, req, res);
        });
      } else {
        // match.callback(req, res);
        this.route(match, req, res);
      }
    } else {
      // res.write("No Route matched!");
      return res.end();
    }
    // });

    // server.listen.apply(server, [port, callback]);
  };
}

module.exports = Router;

// if (middleware) {
//   if (middleware.handle) {  // Check if the middleware is router
//     console.log("REQ:", req.url);
//     console.log("MW:", middleware.scope);
//     // Trim the scope and send it to the middleware
//     if (req.url.startsWith(middleware.scope)) {
//       middleware.handle(req, res);
//     } else {
//       next();
//     }
//   } else {
//     middleware(req, res, next);
//   }
// } else {
//   this.router.handle(req, res);
// }
