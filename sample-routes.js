const Router = require("./src/lib/router");

let router = new Router();

router.get("/manas", function (req, res) {
  res.write("manas");
  res.end();
});

console.log(router.routes.length);
module.exports = router;
