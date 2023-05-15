const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config");
const multer = require("multer");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "upload.html"));
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  const { originalname, filename } = req.file;
  console.log("🚀 ~ file: server.js:25 ~ app.post ~ filename:", filename)
  console.log("🚀 ~ file: server.js:25 ~ app.post ~ originalname:", originalname)
  const filePath = path.join(__dirname, "uploads", filename);

  // Do something with the uploaded file
  // For example, move it to a specific directory or process it further

  // Delete the temporary file after processing
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    }
  });

  res.send("File uploaded successfully.");
});

app.listen(3001, "localhost", (err) => {
  if (err) {
    console.log(err);
  }

  console.log("Express server listening at localhost:3001");
});

const compiler = webpack(config);
const devServerOptions = {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  quiet: false,
  noInfo: false,
  stats: {
    assets: false,
    colors: true,
    version: false,
    hash: false,
    timings: false,
    chunks: false,
    chunkModules: false,
  },
};
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(3000, "localhost", (err) => {
  if (err) {
    console.log(err);
  }

  console.log("WebpackDevServer listening at localhost:3000");
});
