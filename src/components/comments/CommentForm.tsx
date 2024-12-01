import { AuthContext } from 'components/context/AuthContext';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

export interface CommentFormProps {
  post: PostProps | null;
}
export default function CommentForm({ post }: CommentFormProps) {
  const { user } = useContext(AuthContext);
  const [comment, setComment] = useState<string>('');

  const tuncate = (str: string) => {
    return str?.length >= 10 ? str?.substring(0, 10) + '...' : str;
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    if (post) {
      try {
        const postRef = doc(db, 'posts', post.id);

        const commetObj = {
          comment: comment,
          uid: user?.uid,
          email: user?.email,
          createdAt: new Date()?.toLocaleDateString('ko', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };

        await updateDoc(postRef, {
          comments: arrayUnion(commetObj),
        });

        //알림 생성
        if (user?.uid !== post?.uid) {
          await addDoc(collection(db, 'notification'), {
            createdAt: new Date()?.toLocaleDateString('ko', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            uid: post?.uid,
            isRead: false,
            url: `/posts/${post?.id}`,
            content: `"${tuncate(post?.content)}" 글에 댓글이 달렸습니다.`,
          });
        }

        toast.success('댓글을 생성했습니다.');
        setComment('');
      } catch (error) {
        console.log(error);
      }
    }
  };
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === 'comment') {
      setComment(value);
    }
  };
  return (
    <form className="post-form" onSubmit={onSubmit}>
      <textarea
        className="post-form__textarea"
        name="comment"
        id="comment"
        value={comment}
        required
        placeholder="What is happening?"
        onChange={onChange}
      />
      <div className="post-form__submit-area">
        <div />
        <input
          type="submit"
          className="post-form__submit-btn"
          value={'Comment'}
          disabled={!comment}
        />
      </div>
    </form>
  );
}
