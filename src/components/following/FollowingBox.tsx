import { AuthContext } from 'components/context/AuthContext';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface FollowingBoxProps {
  post: PostProps;
}

export interface UserProps {
  id: string;
}

export default function FollowingBox({ post }: FollowingBoxProps) {
  const { user } = useContext(AuthContext);
  const [postFollowers, setPostFollowers] = useState<any>([]);

  const onClickFollow = async (e: any) => {
    e.preventDefault();

    if (user?.uid) {
      try {
        // 내가 주체가 되어 '팔로잉' 컬렉션 생성 or 업데이트
        const followingRef = doc(db, 'following', user?.uid);

        await setDoc(
          followingRef,
          {
            users: arrayUnion({ id: post?.uid }),
          },
          { merge: true }
        );

        // 팔로우 당하는 사람이 주체가 되어 '팔로우' 컬렉션 생성 or 업데이트
        const followerRef = doc(db, 'follower', post?.uid);

        await setDoc(
          followerRef,
          { users: arrayUnion({ id: user?.uid }) },
          { merge: true }
        );

        // 팔로우 알림 생성
        if (user?.uid !== post?.uid) {
          await addDoc(collection(db, 'notification'), {
            createdAt: new Date()?.toLocaleDateString('ko', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            isRead: false,
            content: `${user?.email || user?.displayName}"가 팔로우 했습니다`,
            url: '#',
            uid: post?.uid,
          });
        }

        toast.success('팔로우를 했습니다.');
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onClickDeleteFollow = async (e: any) => {
    e.preventDefault();
    try {
      if (user?.uid) {
        const followingRef = doc(db, 'following', user?.uid);
        await updateDoc(followingRef, {
          users: arrayRemove({ id: post?.uid }),
        });

        const followerRef = doc(db, 'follower', post?.uid);
        await updateDoc(followerRef, {
          users: arrayRemove({ id: user?.uid }),
        });

        toast.success('팔로우를 취소했습니다.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFollower = useCallback(async () => {
    if (post?.uid) {
      const ref = doc(db, 'follower', post.uid);
      onSnapshot(ref, (doc) => {
        setPostFollowers([]);
        doc
          ?.data()
          ?.users?.map((user: UserProps) =>
            setPostFollowers((prev: UserProps[]) =>
              prev ? [...prev, user?.id] : []
            )
          );
      });
    }
  }, [post?.uid]);

  useEffect(() => {
    if (post.uid) getFollower();
  }, []);

  return (
    <>
      {user?.uid !== post?.uid &&
        (postFollowers?.includes(user?.uid) ? (
          <button
            type="button"
            className="post__following-btn"
            onClick={onClickDeleteFollow}
          >
            Following
          </button>
        ) : (
          <button
            type="button"
            className="post__follow-btn"
            onClick={onClickFollow}
          >
            Follow
          </button>
        ))}
    </>
  );
}
