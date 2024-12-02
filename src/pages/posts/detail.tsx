import Loader from 'components/loader/Loader';
import PostBox from 'components/posts/PostBox';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostHeader from 'components/posts/PostHeader';
import CommentForm from 'components/comments/CommentForm';
import CommentBox, { CommentProps } from 'components/comments/CommentBox';

export default function PostDetail() {
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);
  const navigate = useNavigate();

  const getPost = useCallback(async () => {
    if (params.id) {
      const docRef = doc(db, 'posts', params.id);
      onSnapshot(docRef, (doc) => {
        setPost({ ...(doc?.data() as PostProps), id: doc?.id });
      });
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) getPost();
  }, [getPost, params.id]);

  return (
    <div className="post">
      <PostHeader />
      {post ? (
        <>
          <PostBox post={post} />
          <CommentForm post={post} />
          {post?.comments && post.comments?.length > 0 ? (
            [...post.comments]
              .reverse()
              .map((comment: CommentProps) => (
                <CommentBox
                  key={comment.createdAt.toString()}
                  data={comment}
                  post={post}
                />
              ))
          ) : (
            <p>No comments yet</p>
          )}
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}
