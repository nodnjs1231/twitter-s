import { languageState } from 'atom';
import { AuthContext } from 'components/context/AuthContext';
import PostBox from 'components/posts/PostBox';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import useTranslation from 'hooks/useTranslation';
import { PostProps } from 'pages/home';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

const PROFILE_DEFUALT_URL = '/logo512.png';
type TabType = 'my' | 'like';

export default function ProfilePage() {
  const [tab, setTab] = useState<TabType>('my');
  const [myPosts, setMyPosts] = useState<PostProps[]>([]);
  const [likePosts, setLikePosts] = useState<PostProps[]>([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [language, setLanguage] = useRecoilState(languageState);
  const t = useTranslation();

  const onClickLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
    localStorage.setItem('language', language === 'ko' ? 'en' : 'ko');
  };

  useEffect(() => {
    if (user) {
      let postsRef = collection(db, 'posts');
      const myPostQuery = query(
        postsRef,
        where('uid', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const likePostQuery = query(
        postsRef,
        where('likes', 'array-contains', user?.uid),
        orderBy('createdAt', 'desc')
      );

      onSnapshot(myPostQuery, (snapShot) => {
        let dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc?.id,
        }));

        setMyPosts(dataObj as PostProps[]);
      });

      onSnapshot(likePostQuery, (snapShot) => {
        let dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc?.id,
        }));

        setLikePosts(dataObj as PostProps[]);
      });
    }
  }, [user]);
  return (
    <div className="home">
      <div className="home__top">
        <div className="home__title">{t('MENU_PROFILE')}</div>
        <div className="profile">
          <img
            src={user?.photoURL || PROFILE_DEFUALT_URL}
            alt="profile"
            className="profile__image"
            width={100}
            height={100}
          />
          <div className="profile__flex">
            <button
              type="button"
              className="profile__btn"
              onClick={() => navigate('/profile/edit')}
            >
              {t('BUTTON_EDIT_PROFILE')}
            </button>
            <button
              type="button"
              className="profile__btn--language"
              onClick={onClickLanguage}
            >
              {language === 'ko' ? '한국어' : 'English'}
            </button>
          </div>
        </div>
        <div className="profile__text">
          <div className="profile__name">{user?.displayName || '사용자님'}</div>
          <div className="profile__email">{user?.email}</div>
        </div>
        <div className="home__tabs">
          <div
            className={`home__tab ${tab === 'my' && 'home__tab--active'}`}
            onClick={() => setTab('my')}
          >
            {t('TAB_ALL')}
          </div>
          <div
            className={`home__tab ${tab === 'like' && 'home__tab--active'}`}
            onClick={() => setTab('like')}
          >
            {t('TAB_LIKES')}
          </div>
        </div>
        {tab === 'my' && (
          <div className="post">
            {myPosts?.length > 0 ? (
              myPosts?.map((post) => <PostBox post={post} key={post.id} />)
            ) : (
              <div className="post__no-posts">
                <div className="post__text">{t('NO_POSTS')}</div>
              </div>
            )}
          </div>
        )}
        {tab === 'like' && (
          <div className="post">
            {likePosts?.length > 0 ? (
              likePosts?.map((post) => <PostBox post={post} key={post.id} />)
            ) : (
              <div className="post__no-posts">
                <div className="post__text">{t('NO_POSTS')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
