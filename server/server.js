/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// "use strict";

const babelRegister = require("@babel/register");
babelRegister({
  ignore: [/[\\\/](build|server\/server|node_modules)[\\\/]/],
  presets: [["react-app", { runtime: "automatic" }]],
  plugins: ["@babel/transform-modules-commonjs"],
});

const express = require("express");
const render = require("./render");
const { JS_BUNDLE_DELAY, API_DELAY } = require("./delays");
const { fakeData } = require("../src/data");
const PORT = process.env.PORT || 8081;
const app = express();

app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    // Artificially delay serving JS
    // to demonstrate streaming HTML.
    setTimeout(next, JS_BUNDLE_DELAY);
  } else {
    next();
  }
});

// app.use(compress());

// 导出 一个 API 接口, 供 前端 CSR 时 调用 API 获取数据
app.post("/api/search", (req, res) => {
  console.log("请求打进来");
  setTimeout(() => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(fakeData));
  }, API_DELAY);
});
app.get(
  "/",
  handleErrors(async function(req, res) {
    console.log("handler request:", req.url);
    render(req, res);
  })
);
app.use(express.static("build"));
app.use(express.static("public"));

app
  .listen(PORT, () => {
    console.log(`Listening at ${PORT}...`);
  })
  .on("error", function(error) {
    if (error.syscall !== "listen") {
      throw error;
    }
    const isPipe = (portOrPipe) => Number.isNaN(portOrPipe);
    const bind = isPipe(PORT) ? "Pipe " + PORT : "Port " + PORT;
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

function handleErrors(fn) {
  return async function(req, res, next) {
    try {
      return await fn(req, res);
    } catch (x) {
      next(x);
    }
  };
}

// async function waitForWebpack() {
//   while (true) {
//     try {
//       readFileSync(path.resolve(__dirname, "../build/main.js"));
//       return;
//     } catch (err) {
//       console.log(
//         "Could not find webpack build output. Will retry in a second..."
//       );
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//   }
// }
