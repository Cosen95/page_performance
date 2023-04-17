/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect } from "react";
import Spinner from "./Spinner";

export default function CommentsWithCSR({ csr }) {
  const [comments, setComments] = useState([]);
  const clickHandler = function(event) {
    alert("[CSR] Hello " + event.target.innerHTML);
  };

  useEffect(() => {
    console.log("CommentsWithCSR component");
    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    })
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
      });
  }, []);

  if (comments.length < 1) {
    return <Spinner />;
  }

  return (
    <>
      {comments.map((comment, i) => (
        <p className="comment" key={i} onClick={clickHandler}>
          {comment}
        </p>
      ))}
    </>
  );
}
