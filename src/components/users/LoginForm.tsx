import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from 'firebaseApp';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface loginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [error, setError] = useState<string>('');
  const [loginData, setLoginData] = useState<loginFormData>({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      toast.success('성공적으로 로그인이 되었습니다.');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.code);
      console.log(error);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);

    //input validate
    if (name === 'email') {
      const validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~\-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!value?.match(validRegex)) {
        setError('이메일 형식이 올바르지 않습니다.');
      } else {
        setError('');
      }
    }

    if (name === 'password') {
      if (value?.length < 8) {
        setError('비밀번호는 8자리 이상으로 입력해주세요');
      } else {
        setError('');
      }
    }

    setLoginData({ ...loginData, [name]: value });
  };

  return (
    <form className="form from--lg" onSubmit={onSubmit}>
      <div className="form__title">로그인</div>
      <div className="form__block">
        <label htmlFor="email">이메일</label>
        <input
          type="text"
          name="email"
          id="email"
          value={loginData.email}
          onChange={onChange}
          required
        />
      </div>
      <div className="form__block">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          name="password"
          id="password"
          value={loginData.password}
          onChange={onChange}
          required
        />
      </div>
      {error && error?.length > 0 && (
        <div className="form__block">
          <div className="form__error">{error}</div>
        </div>
      )}
      <div className="form__block">
        계정이 없으신가요?
        <Link to={'/users/signup'} className="form__link">
          회원가입 하기
        </Link>
      </div>
      <div className="form__block--lg">
        <button
          type="submit"
          className="form__btn--submit"
          disabled={error?.length > 0}
        >
          로그인
        </button>
      </div>
    </form>
  );
}
