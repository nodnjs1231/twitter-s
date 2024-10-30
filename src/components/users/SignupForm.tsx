import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from 'firebaseApp';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface signFormData {
  email: string;
  password: string;
  password_confirmation: string;
}

export default function SignupForm() {
  const [error, setError] = useState<string>('');
  const [signData, setSignData] = useState<signFormData>({
    email: '',
    password: '',
    password_confirmation: '',
  });

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(
        auth,
        signData.email,
        signData.password
      );

      toast.success('성공적으로 회원가입이 되었습니다.');
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
      } else if (
        signData.password_confirmation?.length > 0 &&
        value !== signData.password_confirmation
      ) {
        setError('비밀번호와 비밀번호 확인 값이 다릅니다. 다시 확인해주세요');
      } else {
        setError('');
      }
    }

    if (name == 'password_confirmation') {
      if (value?.length < 8) {
        setError('비밀번호는 8자리 이상으로 입력해주세요');
      } else if (signData.password?.length > 0 && value !== signData.password) {
        setError('비밀번호와 비밀번호 확인 값이 다릅니다. 다시 확인해주세요');
      } else {
        setError('');
      }
    }

    setSignData({ ...signData, [name]: value });
  };

  return (
    <form className="form from--lg" onSubmit={onSubmit}>
      <div className="form__title">회원가입</div>
      <div className="form__block">
        <label htmlFor="email">이메일</label>
        <input
          type="text"
          name="email"
          id="email"
          value={signData.email}
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
          value={signData.password}
          onChange={onChange}
          required
        />
      </div>
      <div className="form__block">
        <label htmlFor="password_confirmation">비밀번호 확인</label>
        <input
          type="password"
          name="password_confirmation"
          id="password_confirmation"
          value={signData.password_confirmation}
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
        계정이 있으신가요?
        <Link to={'/users/login'} className="form__link">
          로그인하기
        </Link>
      </div>
      <div className="form__block--lg">
        <button
          type="submit"
          className="form__btn--submit"
          disabled={error?.length > 0}
        >
          회원가입
        </button>
      </div>
    </form>
  );
}
