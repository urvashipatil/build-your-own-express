//Router - Improve POst request and  read post data even if it is JSON

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

    console.log("params", params);
    // if (matchedRouteObject) return matchedRouteObject;
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

  listen = (port, callback) => {
    let server = http.createServer((req, res) => {
      console.log("req", req.url, req.method);
      let method = req.method.toLocaleLowerCase();
      res.writeHead(200, { "Content-Type": "text-plain" });
      let match = this.matchUrl(req.url, method);
      if (match) {
        if (match?.params) {
          req.params = match.params;
        }
        if (method == "post") {
          //read the posted data
          this._postData(req, res, (req, res) => {
            console.log("postdata callback");
            match.callback(req, res);
          });
        } else {
          match.callback(req, res);
        }
      } else {
        res.write("No Route matched!");
        res.end();
      }
    });

    server.listen.apply(server, [port, callback]);
  };
}

module.exports = Router;
