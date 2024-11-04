import { AuthContext } from 'components/context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from 'firebaseApp';
import { ChangeEvent, useContext, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface Props {}
export default function PostForm({}: Props) {
  const [content, setContent] = useState<string>('');
  const { user } = useContext(AuthContext);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // if (post && post.id) {
      //   // 만약 post 데이터가 있다면, firestore로 데이터 수정
      //   const postRef = doc(db, 'posts', post?.id);
      //   await updateDoc(postRef, {
      //     title: title,
      //     summary: summary,
      //     content: content,
      //     updatedAt: new Date().toLocaleDateString('ko', {
      //       hour: '2-digit',
      //       minute: '2-digit',
      //       second: '2-digit',
      //     }),
      //     category: category,
      //   });

      //   toast?.success('게시글을 수정했습니다.');
      //   navigate(`/posts/${post.id}`);
      // } else {
      //firestore로 데이터 생성
      await addDoc(collection(db, 'posts'), {
        content: content,
        createdAt: new Date().toLocaleDateString('ko', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        email: user?.email,
        uid: user?.uid,
      });
      setContent('');
      toast?.success('게시글을 생성했습니다.');

      // }
    } catch (e: any) {
      console.log(e);
      toast?.error(e?.code);
    }
  };

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'content') {
      setContent(value);
    }
  };

  return (
    <form className="post-form" onSubmit={onSubmit}>
      <textarea
        className="post-form__textarea"
        required
        name="content"
        id="content"
        value={content}
        onChange={onChange}
        placeholder="What is happening?"
      />
      <div className="post-form__submit-area">
        <label htmlFor="file-input" className="post-form__file">
          <FiImage className="post-form__file-icon" />
        </label>
        <input
          type="file"
          name="file-input"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input type="submit" value="Tweet" className="post-form__submit-btn" />
      </div>
    </form>
  );
}
