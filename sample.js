//After creating app separately

//Set up template engine

const rocket = require("./src/lib/rocket"); //Chnaged from router to rocket
var multer = require("multer");
const appRoutes = require("./sample-routes");
const app = new rocket();
const port = 3000;

// app.use(rocket.static("public"));
app.use(rocket.static(path.join(__dirname, "public")));

//set up templete engine
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use("/api", appRoutes);

app.use(function (req, res, next) {
  console.log("Time:", Date.now());
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

// app.use(function (req, res, next) {
//   console.log("another middleware log");
//   next();
// });

// app.use(function (req, res, next) {
//   console.log("middleware2");
//   next();
// });

app.post("/upload", upload.single("myfile"), function (req, res, next) {
  console.log("body: ", req.body);
  console.log("file: ", req.filename);
  res.end("File is uploaded successfully!");
});

const testmiddleware = () => {
  console.log("testmiddleware");
};

app.get("/hi", testmiddleware, (req, res) => {
  // res.write("New Hi to all");
  res.send("New Hi to all");
  // res.end();
});

app.get("/check/:mydata", (req, res) => {
  res.write(`New Hi to all ${req.params?.mydata}`);
  res.end();
});

app.get("/json", (req, res) => {
  // res.writeHead(200, { contentType: "application/json" });
  // let body = JSON.stringify({ test: "asas", name: "aaa" });
  res.json({ test: "asas", name: "aaa" });
  // res.end(body);
});

app.get("/todos", function (req, res) {
  res.render("todo", { todos: [{ id: 1, name: "todo 1" }] });
});

// app.post("/data", (req, res) => {
//   console.log("body", req.body); //req.body.input
//   res.write("data url hit");
//   res.end();
// });

app.listen(port, () => {
  console.log(`server is running at ${port}`);
});
