// comments 数据的获取在上层中已经模拟延时获取了.
export default function CommentsWithSSR({ comments }) {
  const clickHandler = function(event) {
    alert("[SSR] Hello " + event.target.innerHTML);
  };

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
