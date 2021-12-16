const rocket = require("./router/index");
const app = new rocket();
const port = 3000;

app.use("/api",)

// app.use(function (req, res, next) {
//   console.log("Time:", Date.now());
//   next();
// });

// app.use(function (req, res, next) {
//   console.log("middleware2");
//   next();
// });

app.get("/hi/:mydata", (req, res) => {
  res.write("New Hi to all");
  res.end();
});

app.post("/data", (req, res) => {
  console.log("body", req.body); //req.body.input
  res.write("data url hit");
  res.end();
});

app.listen(port, () => {
  console.log(`server is running at ${port}`);
});
