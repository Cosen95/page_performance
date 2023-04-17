/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Html from "./Html";
import Spinner from "./Spinner";
import Layout from "./Layout";
import NavBar from "./NavBar";

import SidebarWithoutLazy from "./Sidebar";
import PostWithoutLazy from "./Post";

import CommentsWithSSR from "./CommentsWithSSR";

const CommentsWithCSR = lazy(() =>
  import("./CommentsWithCSR" /* webpackPrefetch: true */)
);
const Comments = lazy(() => import("./Comments" /* webpackPrefetch: true */));
const Sidebar = lazy(() => import("./Sidebar" /* webpackPrefetch: true */));
const Post = lazy(() => import("./Post" /* webpackPrefetch: true */));

export default function App({ assets, comments, csr }) {
  // full server side rendering or client side rendering 时 不使用 Suspense
  if (comments) {
    return (
      <Html assets={assets} title="Hello SSR">
        <ErrorBoundary FallbackComponent={Error}>
          <ContentWithoutSuspense comments={comments} />
        </ErrorBoundary>
      </Html>
    );
  }

  if (csr) {
    console.log("csr渲染mode");
    return <ContentWithoutSuspense />;
  }
  return (
    <Html assets={assets} title="Hello Streaming">
      <Suspense fallback={<Spinner />}>
        <ErrorBoundary FallbackComponent={Error}>
          <Content />
        </ErrorBoundary>
      </Suspense>
    </Html>
  );
}

function ContentWithoutSuspense({ comments }) {
  return (
    <Layout>
      <NavBar />
      <aside className="sidebar">
        <SidebarWithoutLazy />
      </aside>
      <article className="post">
        <PostWithoutLazy />
        <section className="comments">
          <h2>Comments</h2>
          {comments ? (
            <CommentsWithSSR comments={comments} />
          ) : (
            <CommentsWithCSR />
          )}
        </section>
        <h2>Thanks for reading!</h2>
      </article>
    </Layout>
  );
}

function Content() {
  return (
    <Layout>
      <NavBar />
      <aside className="sidebar">
        <Suspense fallback={<Spinner />}>
          <Sidebar />
        </Suspense>
      </aside>
      <article className="post">
        <Suspense fallback={<Spinner />}>
          <Post />
        </Suspense>
        <section className="comments">
          <h2>Comments</h2>
          <Suspense fallback={<Spinner />}>
            <Comments />
          </Suspense>
        </section>
        <h2>Thanks for reading!</h2>
      </article>
    </Layout>
  );
}

function Error({ error }) {
  return (
    <div>
      <h1>Application Error</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{error.stack}</pre>
    </div>
  );
}
