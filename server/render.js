/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from "react";
// import {renderToString} from 'react-dom/server';
import { renderToString, renderToPipeableStream } from "react-dom/server";
import App from "../src/App";
import { DataProvider, fakeData } from "../src/data";
import { API_DELAY, ABORT_DELAY } from "./delays";

// In a real setup, you'd read it from webpack build stats.
let assets = {
  "main.js": "/main.js",
  "main.css": "/main.css",
};

module.exports = function render({ url, query }, res) {
  // This is how you would wire it up previously:
  //
  // res.send(
  //   '<!DOCTYPE html>' +
  //   renderToString(
  //     <DataProvider data={data}>
  //       <App assets={assets} />
  //     </DataProvider>,
  //   )
  // );
  console.log("query ----------->", query);
  const { ssr, csr, shell } = query;

  if (csr === "1") {
    // CSR
    res.statusCode = 200;
    res.setHeader("Content-type", "text/html");

    if (shell === "1") {
      // + AppShell
      return res.end(`<html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="favicon.ico" />
        <link rel="stylesheet" href="${assets["main.css"]}" />
        <title>Hello CSR + AppShell</title>
      </head>
      <body>
        <noscript><b>Enable JavaScript to run this app.</b></noscript>
        <div id="root">
          <main>
              <nav>
                  <a href="/">Home</a>
              </nav>
              <aside class="sidebar">
                  <div class="spinner spinner--active" role="progressbar" aria-busy="true"></div>
              </aside>
              <article class="post">
                  <div class="spinner spinner--active" role="progressbar" aria-busy="true"></div>
                  <section class="comments">
                      <h2>Comments</h2>
                      <div class="spinner spinner--active" role="progressbar" aria-busy="true"></div>
                  </section>
                  <h2>Thanks for reading!</h2>
              </article>
          </main>
        </div>
        <script>
            assetManifest = ${JSON.stringify(assets)}
        </script>
        <script async="" src="${assets["main.js"]}"></script>
      </body>
    </html>`);
    }
    return res.end(`<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="favicon.ico" />
    <link rel="stylesheet" href="${assets["main.css"]}" />
    <title>Hello CSR</title>
  </head>
  <body>
    <noscript><b>Enable JavaScript to run this app.</b></noscript>
    <div id="root"></div>
    <script>
        assetManifest = ${JSON.stringify(assets)}
    </script>
    <script async="" src="${assets["main.js"]}"></script>
  </body>
</html>`);
  }

  if (ssr === "1") {
    // SSR
    // 传统 SSR, 在服务端 请求后台数据, 拿到后 渲染为 HTML 返回给浏览器
    new Promise((resolve) => {
      // 模拟请求后台接口耗时
      setTimeout(() => {
        resolve();
      }, API_DELAY);
    }).then(() => {
      res.statusCode = 200;
      res.setHeader("Content-type", "text/html");

      res.end(
        "<!DOCTYPE html>" +
          renderToString(
            <App assets={assets} ssr={"1"} comments={fakeData} />
          ) +
          `<script>__init_state__=${JSON.stringify({
            comments: fakeData,
          })}</script>` +
          `<script async="" src="${assets["main.js"]}"></script>`
      );
    });

    return;
  }

  // The new wiring is a bit more involved.
  res.socket.on("error", (error) => {
    console.error("Fatal", error);
  });

  // streaming SSR
  let didError = false;
  const data = createServerData();
  const stream = renderToPipeableStream(
    <DataProvider data={data}>
      <App assets={assets} />
    </DataProvider>,
    {
      bootstrapScripts: [assets["main.js"]],
      onShellReady() {
        // If something errored before we started streaming, we set the error code appropriately.
        res.statusCode = didError ? 500 : 200;
        res.setHeader("Content-type", "text/html");
        stream.pipe(res);
      },
      onError(x) {
        didError = true;
        console.error(x);
      },
    }
  );
  // Abandon and switch to client rendering if enough time passes.
  // Try lowering this to see the client recover.
  setTimeout(() => stream.abort(), ABORT_DELAY);
};

// Simulate a delay caused by data fetching.
// We fake this because the streaming HTML renderer
// is not yet integrated with real data fetching strategies.
function createServerData() {
  let done = false;
  let promise = null;
  return {
    read() {
      if (done) {
        return;
      }
      if (promise) {
        throw promise;
      }
      promise = new Promise((resolve) => {
        setTimeout(() => {
          done = true;
          promise = null;
          resolve();
        }, API_DELAY);
      });
      throw promise;
    },
  };
}
