import { ChangeEvent } from 'react';
import { FiImage } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { AiFillHeart } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { FaRegComment } from 'react-icons/fa';
import PostForm from 'components/posts/PostForm';
import PostBox from 'components/posts/PostBox';

export interface PostProps {
  id: string;
  email: string;
  content: string;
  createdAt: string;
  uid: string;
  profileUrl?: string;
  likes?: string[];
  likeCount?: number;
  comments?: any;
}

const posts: PostProps[] = [
  {
    id: '1',
    email: 'test@test.com',
    content: '내용',
    createdAt: '2023-08-30',
    uid: '123123',
  },
  {
    id: '2',
    email: 'test@test.com',
    content: '내용',
    createdAt: '2023-08-30',
    uid: '123123',
  },
  {
    id: '3',
    email: 'test@test.com',
    content: '내용',
    createdAt: '2023-08-30',
    uid: '123123',
  },
  {
    id: '4',
    email: 'test@test.com',
    content: '내용',
    createdAt: '2023-08-30',
    uid: '123123',
  },
  {
    id: '5',
    email: 'test@test.com',
    content: '내용',
    createdAt: '2023-08-30',
    uid: '123123',
  },
];

export default function HomePage() {
  return (
    <div className="home">
      <div className="home__title"></div>
      <div className="home__tabs">
        <div className="home__tab home__tab--active">For You</div>
        <div className="home__tab">Following</div>
      </div>
      <PostForm />
      <div className="post">
        {posts?.map((post) => (
          <PostBox post={post} key={post.id} />
        ))}
      </div>
    </div>
  );
}
