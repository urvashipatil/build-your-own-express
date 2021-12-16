//Router - Improve Match for parsig URL parameters
const http = require("http");
const { METHODS } = require("http");
const { url } = require("inspector");
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

    console.log("params", params); //add params in req
    // if (matchedRouteObject) return matchedRouteObject;

    if (matchedRouteObject) {
      return {
        ...matchedRouteObject,
        params: params,
      };
    }

    return null;
  };

  listen = (port, callback) => {
    let server = http.createServer((req, res) => {
      console.log("req", req.url, req.method);
      res.writeHead(200, { "Content-Type": "text-plain" });
      let match = this.matchUrl(req.url, req.method);
      if (match?.params) {
        req.params = match.params;
      }
      if (match) {
        match.callback(req, res);
      } else {
        res.write("No Route matched!");
        res.end();
      }
    });

    server.listen.apply(server, [port, callback]);
  };
}

module.exports = Router;
