import { AuthContext } from 'components/context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from 'firebase/storage';
import { db, storage } from 'firebaseApp';
import { PostProps } from 'pages/home';
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { FiImage } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import PostHeader from './PostHeader';
import useTranslation from 'hooks/useTranslation';

interface Props {}
export default function PostEditForm({}: Props) {
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);
  const [content, setContent] = useState<string>('');
  const [hashTag, setHashTag] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
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

  const getPost = useCallback(async () => {
    if (params.id) {
      const defRef = doc(db, 'posts', params.id);
      const docSnap = await getDoc(defRef);
      setPost({ ...(docSnap?.data() as PostProps), id: docSnap.id });
      setContent(docSnap?.data()?.content);
      setTags(docSnap?.data()?.hashTags);
      setImageFile(docSnap?.data()?.imageUrl);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) getPost();
  }, [getPost, params.id]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const key = `${user?.uid}/${uuidv4()}`;
    // 참조 생성
    const storageRef = ref(storage, key);

    try {
      if (post && post.id) {
        // 기존 사진 지우고 새로운 사진 업로드.
        if (post?.imageUrl) {
          let imageRef = ref(storage, post?.imageUrl);
          await deleteObject(imageRef).catch((error) => {
            console.log(error);
          });
        }
        // 새로운 파일이 있다면 업로드
        let imageUrl = '';
        if (imageFile) {
          const data = await uploadString(storageRef, imageFile, 'data_url');
          imageUrl = await getDownloadURL(data?.ref);
        }

        // 만약 post 데이터가 있다면, firestore로 데이터 수정
        const postRef = doc(db, 'posts', post?.id);
        await updateDoc(postRef, {
          content: content,
          hashTags: tags,
          imageUrl: imageUrl,
          updatedAt: new Date().toLocaleDateString('ko', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        });

        setImageFile(null);
        toast?.success('게시글을 수정했습니다.');
        navigate(`/posts/${post.id}`);
      }
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
    <div className="post">
      <PostHeader />
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
                <img
                  src={imageFile}
                  alt="attacthment"
                  width={100}
                  height={100}
                />
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
            value={t('BUTTON_EDIT')}
            className="post-form__submit-btn"
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
