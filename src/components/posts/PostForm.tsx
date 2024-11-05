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
  const [hashTag, setHashTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'posts'), {
        content: content,
        createdAt: new Date().toLocaleDateString('ko', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        email: user?.email,
        uid: user?.uid,
        hashTags: tags,
      });
      setTags([]);
      setHashTag('');
      setContent('');
      toast?.success('게시글을 생성했습니다.');
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

  const handleKeyUp = (e: any) => {
    if (e.keyCode === 32 && e.target.value.trim() !== '') {
      if (tags?.includes(e.target.value?.trim())) {
        toast.error('같은 태그가 있습니다.');
      } else {
        setTags([...tags, hashTag]);
        setHashTag('');
      }
      // 만약 같은 태그가 있다면 에러를 띄운다.
      // 아니라면 해시태그 생성
    }
  };

  const onChangeHashTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHashTag(e?.target?.value?.trim());
  };

  const removeHash = (tag: string) => {
    setTags([...tags].filter((x) => x !== tag));
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
      <div className="post-form__hashtags">
        <div className="post-form__hashtags-outputs">
          {tags?.map((tag, index) => (
            <span
              className="post-form__hashtags-tag"
              key={index}
              onClick={() => removeHash(tag)}
            >
              #{tag}
            </span>
          ))}
        </div>
        <input
          className="post-form__input"
          name="hashtag"
          id="hashtag"
          placeholder="해시태그 + 스페이스바 입력"
          onChange={onChangeHashTag}
          onKeyUp={handleKeyUp}
          value={hashTag}
        />
      </div>
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
