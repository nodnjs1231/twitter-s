import { AuthContext } from 'components/context/AuthContext';
import PostHeader from 'components/posts/PostHeader';
import { updateProfile } from 'firebase/auth';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from 'firebase/storage';
import { storage } from 'firebaseApp';
import { useContext, useEffect, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_DOWNLOAD_URL_STR = 'https://firebasestorage.googleapis.com';

export default function ProfileEdit() {
  const [disPlayName, setDisPlayName] = useState<string>('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    setDisPlayName(value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const key = `${user?.uid}/${uuidv4()}`;
    // 참조 생성
    const storageRef = ref(storage, key);

    try {
      // 기존 유저 이미지가 Firebase Storage 이미지일 경우에만 삭제
      if (
        user?.photoURL &&
        user?.photoURL?.includes(STORAGE_DOWNLOAD_URL_STR)
      ) {
        const imageRef = ref(storage, user?.photoURL);
        if (imageRef) {
          await deleteObject(imageRef).catch((error) => {
            console.log(error);
          });
        }
      }
      // 이미지 업로드
      let newImageUrl = null;
      if (imageFile) {
        const data = await uploadString(storageRef, imageFile, 'data_url');
        newImageUrl = await getDownloadURL(data?.ref);
      }

      // updateProfile 호출
      if (user) {
        await updateProfile(user, {
          displayName: disPlayName || '',
          photoURL: newImageUrl || '',
        }).then(() => {
          setImageFile(null);
          toast?.success('프로필을 업데이트 했습니다.');
          navigate(`/profile`);
        });
      }
    } catch (e: any) {
      console.log(e);
      toast?.error(e?.code);
    } finally {
      setIsSubmitting(false);
    }
  };
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

  const handleDeleteImage = () => {
    setImageFile(null);
  };

  useEffect(() => {
    if (user?.photoURL) {
      setImageFile(user?.photoURL);
    }
    if (user?.displayName) {
      setDisPlayName(user?.displayName);
    }
  }, [user?.photoURL, user?.displayName]);

  return (
    <div className="post">
      <PostHeader />
      <form className="post-form" onSubmit={onSubmit}>
        <div className="post-form__profile">
          <input
            type="text"
            name="disPlayName"
            className="post-form__input"
            placeholder="이름"
            onChange={onChange}
            value={disPlayName}
          />
          {imageFile && (
            <div className="post-form__attacthment">
              <img src={imageFile} alt="attacthment" width={100} height={100} />
              <button
                className="post-form__clear-btn"
                type="button"
                onClick={handleDeleteImage}
              >
                삭제
              </button>
            </div>
          )}
          <div className="post-form__submit-area">
            <div className="post-form__image-area">
              <label className="post-form__file" htmlFor="file-input">
                <FiImage className="post-form__file-icon" />
              </label>
              <input
                type="file"
                name="file-input"
                id="file-input"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <input
              type="submit"
              value="프로필 수정"
              className="post-form__submit-btn"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
