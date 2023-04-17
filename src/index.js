/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App";
console.log("window.assetManifest ---->", window.assetManifest);

const root = document.querySelector("#root");
console.log("root", root);
if (root) {
  createRoot(root).render(<App assets={window.assetManifest} csr="1" />);
} else {
  let comments;
  if (window.__init_state__) {
    comments = window.__init_state__.comments;
  }
  hydrateRoot(
    document,
    <App assets={window.assetManifest} comments={comments} />
  );
}
