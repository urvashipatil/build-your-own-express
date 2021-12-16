//Show how http server runs
const http = require("http");
const port = 3000;

let server = http.createServer((req, res) => {
  console.log("req", req.url, req.method);
  res.writeHead(200, { "Content-Type": "text-plain" });
  res.write("HI  All");
  res.end();
});

server.listen(port, () => {
  console.log(`server is running at ${port}`);
});
