import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Props {}
export default function PostEditForm({}: Props) {
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);
  const [content, setContent] = useState<string>('');
  const [hashTag, setHashTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const getPost = useCallback(async () => {
    if (params.id) {
      const defRef = doc(db, 'posts', params.id);
      const docSnap = await getDoc(defRef);
      setPost({ ...(docSnap?.data() as PostProps), id: docSnap.id });
      setContent(docSnap?.data()?.content);
      setTags(docSnap?.data()?.hashTags);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) getPost();
  }, [getPost, params.id]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (post && post.id) {
        // 만약 post 데이터가 있다면, firestore로 데이터 수정
        const postRef = doc(db, 'posts', post?.id);
        await updateDoc(postRef, {
          content: content,
          hashTags: tags,
          updatedAt: new Date().toLocaleDateString('ko', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        });

        toast?.success('게시글을 수정했습니다.');
        navigate(`/posts/${post.id}`);
      }
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
        <input type="submit" value="수정" className="post-form__submit-btn" />
      </div>
    </form>
  );
}
