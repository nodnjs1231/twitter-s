import {
  signInWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { app } from 'firebaseApp';
import useTranslation from 'hooks/useTranslation';
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
  const t = useTranslation();

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

  const onClickSocialLogin = async (e: any) => {
    const { name } = e?.target;

    let provider;
    const auth = getAuth(app);

    if (name === 'google') {
      provider = new GoogleAuthProvider();
    }

    if (name === 'github') {
      provider = new GithubAuthProvider();
    }

    await signInWithPopup(
      auth,
      provider as GithubAuthProvider | GoogleAuthProvider //타입지정
    )
      .then((result) => {
        console.log(result);
        toast.success('로그인 되었습니다.');
      })
      .catch((error) => {
        console.log(error);
        const errorMessage = error?.message;
        toast?.error(errorMessage);
      });
  };

  return (
    <form className="form from--lg" onSubmit={onSubmit}>
      <div className="form__title">{t('MENU_LOGIN')}</div>
      <div className="form__block">
        <label htmlFor="email">{t('FORM_EMAIL')}</label>
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
        <label htmlFor="password">{t('FORM_PASSWORD')}</label>
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
        {t('NO_ACCOUNT')}
        <Link to={'/users/signup'} className="form__link">
          {t('SIGNUP_LINK')}
        </Link>
      </div>
      <div className="form__block--lg">
        <button
          type="submit"
          className="form__btn--submit"
          disabled={error?.length > 0}
        >
          {t('SIGNIN_LINK')}
        </button>
      </div>
      <div className="form__block--lg">
        <button
          type="button"
          name="google"
          className="form__btn--google"
          onClick={onClickSocialLogin}
        >
          {t('LOGIN_WITH_GOOGLE')}
        </button>
      </div>
      <div className="form__block--lg">
        <button
          type="button"
          name="github"
          className="form__btn--github"
          onClick={onClickSocialLogin}
        >
          {t('LOGIN_WITH_GITHUB')}
        </button>
      </div>
    </form>
  );
}
