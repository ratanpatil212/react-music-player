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

//
//

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: "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",
});

const uploadFile = async (
  filePath,
  repository,
  branch,
  commitMessage,
  originalname
) => {
  try {
    const fileContent = fs.readFileSync(filePath);

    const { data: refData } = await octokit.git.getRef({
      owner: repository.owner,
      repo: repository.repo,
      ref: `heads/${branch}`,
    });

    const { data: treeData } = await octokit.git.createTree({
      owner: repository.owner,
      repo: repository.repo,
      base_tree: refData.object.sha,
      tree: [
        {
          path: originalname,
          mode: "100644", // File mode (regular file)
          type: "blob",
          content: fileContent.toString("base64"),
        },
      ],
    });

    const { data: commitData } = await octokit.git.createCommit({
      owner: repository.owner,
      repo: repository.repo,
      message: commitMessage,
      tree: treeData.sha,
      parents: [refData.object.sha],
    });

    await octokit.git.updateRef({
      owner: repository.owner,
      repo: repository.repo,
      ref: `heads/${branch}`,
      sha: commitData.sha,
    });

    const fileLink = `https://github.com/${repository.owner}/${repository.repo}/raw/${branch}/${filePath}?raw=true`;
    console.log("File uploaded successfully.");
    console.log("File link:", fileLink);
  } catch (error) {
    console.error("Error uploading file:", error.message);
  }
};

//
//
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  let { originalname, filename } = req.file;
  console.log("🚀 ~ file: server.js:25 ~ app.post ~ filename:", filename);
  console.log(
    "🚀 ~ file: server.js:25 ~ app.post ~ originalname:",
    originalname
  );
  const filePath = path.join(__dirname, "uploads", filename);

  // Do something with the uploaded file
  const repository = {
    owner: "ratanpatil212",
    repo: "its-not-hehe-its-hihi",
  };
  const branch = "master";
  const commitMessage = "here is your brand new .mp3 file";

  // update the file name to remove spaces and unwanted characters
  originalname = originalname.replace(/[^a-zA-Z0-9.]/g, "");

  uploadFile(filePath, repository, branch, commitMessage, originalname);

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
