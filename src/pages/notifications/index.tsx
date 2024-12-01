import { AuthContext } from 'components/context/AuthContext';
import NotificationBox from 'components/notification/NotificationBox';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import useTranslation from 'hooks/useTranslation';
import { useContext, useEffect, useState } from 'react';

export interface NotificationProps {
  id: string;
  uid: string;
  url: string;
  isRead: boolean;
  content: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user } = useContext(AuthContext);
  const [notification, setNotification] = useState<NotificationProps[]>([]);
  const t = useTranslation();

  useEffect(() => {
    if (user) {
      let ref = collection(db, 'notification');
      let notificationQuery = query(
        ref,
        where('uid', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      onSnapshot(notificationQuery, (snapShot) => {
        let dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setNotification(dataObj as NotificationProps[]);
      });
    }
  }, [user]);

  return (
    <div className="home">
      <div className="home__top">
        <div className="home__title">
          <div className="home__title-text">{t('MENU_NOTI')}</div>
        </div>
      </div>
      <div className="post">
        {notification?.length > 0 ? (
          notification.map((noti) => (
            <NotificationBox notification={noti} key={noti?.id} />
          ))
        ) : (
          <div className="post__no-posts">
            <div className="post__text">{t('NO_NOTIFICATIONS')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
