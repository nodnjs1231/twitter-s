import { AuthContext } from 'components/context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { db, storage } from 'firebaseApp';
import useTranslation from 'hooks/useTranslation';
import { ChangeEvent, useContext, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

interface Props {}
export default function PostForm({}: Props) {
  const [content, setContent] = useState<string>('');
  const { user } = useContext(AuthContext);
  const [hashTag, setHashTag] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const t = useTranslation();

  const handleFileUpload = (e: any) => {
    e.preventDefault();
    const {
      target: { files },
    } = e;

    const file = files?.[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onloadend = (e: any) => {
      const { result } = e?.currentTarget;
      setImageFile(result);
    };
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const key = `${user?.uid}/${uuidv4()}`;
    // 참조 생성
    const storageRef = ref(storage, key);

    try {
      // 이미지 먼저 업로드
      let imageUrl = '';
      if (imageFile) {
        const data = await uploadString(storageRef, imageFile, 'data_url');
        imageUrl = await getDownloadURL(data?.ref);
      }

      // 업로드된 이미지 download URL 업데이트
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
        imageUrl: imageUrl,
      });
      setTags([]);
      setHashTag('');
      setContent('');
      setImageFile(null);
      toast?.success('게시글을 생성했습니다.');
    } catch (e: any) {
      console.log(e);
      toast?.error(e?.code);
    } finally {
      setIsSubmitting(false);
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

  const handleDeleteImage = () => {
    setImageFile(null);
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
        placeholder={t('POST_PLACEHOLDER')}
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
          placeholder={t('POST_HASHTAG')}
          onChange={onChangeHashTag}
          onKeyUp={handleKeyUp}
          value={hashTag}
        />
      </div>
      <div className="post-form__submit-area">
        <div className="post-form__image-area">
          <label htmlFor="file-input" className="post-form__file">
            <FiImage className="post-form__file-icon" />
          </label>
          <input
            type="file"
            name="file-input"
            id="file-input"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {imageFile && (
            <div className="post-form__attacthment">
              <img src={imageFile} alt="attacthment" width={100} height={100} />
              <button
                className="post-form__clear-btn"
                type="button"
                onClick={handleDeleteImage}
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <input
          type="submit"
          value="Tweet"
          className="post-form__submit-btn"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}
