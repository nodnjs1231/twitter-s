import { useNavigate } from 'react-router-dom';
import { BsHouse } from 'react-icons/bs';
import { BiUserCircle } from 'react-icons/bi';
import { MdLogout, MdLogin } from 'react-icons/md';
import { AiOutlineSearch } from 'react-icons/ai';
import { useContext, useTransition } from 'react';
import { AuthContext } from './context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import { app } from 'firebaseApp';
import { toast } from 'react-toastify';
import { IoMdNotificationsOutline } from 'react-icons/io';
import useTranslation from 'hooks/useTranslation';

interface Props {}
export default function MenuList({}: Props) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const t = useTranslation();

  const onSignOut = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      toast.success('로그아웃 되었습니다.');
    } catch (error: any) {
      toast.error(error?.code);
      console.log(error);
    }
  };

  return (
    <div className="footer">
      <div className="footer__grid">
        <button type="button" onClick={() => navigate('/')}>
          <BsHouse />
          {t('MENU_HOME')}
        </button>
        <button type="button" onClick={() => navigate('/profile')}>
          <BiUserCircle />
          {t('MENU_PROFILE')}
        </button>
        <button type="button" onClick={() => navigate('/search')}>
          <AiOutlineSearch />
          {t('MENU_SEARCH')}
        </button>
        <button type="button" onClick={() => navigate('/notifications')}>
          <IoMdNotificationsOutline />
          {t('MENU_NOTI')}
        </button>
        {user === null ? (
          <button type="button" onClick={() => navigate('/users/login')}>
            <MdLogin />
            {t('MENU_LOGIN')}
          </button>
        ) : (
          <button type="button" onClick={onSignOut}>
            <MdLogout />
            {t('MENU_LOGOUT')}
          </button>
        )}
      </div>
    </div>
  );
}
