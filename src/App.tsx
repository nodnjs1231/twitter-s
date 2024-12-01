import Layout from 'components/Layout';
import Loader from 'components/loader/Loader';
import Router from 'components/Router';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from 'firebaseApp';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RecoilRoot } from 'recoil';

function App() {
  // getAuth 함수는 app을 넣어줘야 동작합니다.
  const auth = getAuth(app);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!auth?.currentUser
  );

  // auth를 체크하기 전에 (initialize 전)에는 loader를 띄워주는 용도
  const [init, setInit] = useState<boolean>(false);

  // auth리스너 onAuthStateChanged는 로그인상태를 추적관리합니다.
  // useEffect로 회원가입 및 로그인, 로그아웃을 했다면 새로고침안해도 되게끔 처리
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        // User is sign out
        setIsAuthenticated(false);
      }
      setInit(true);
    });
  }, []);

  return (
    <RecoilRoot>
      <Layout>
        <ToastContainer
          theme="dark"
          autoClose={1000}
          hideProgressBar
          newestOnTop
        />
        {init ? <Router isAuthenticated={isAuthenticated} /> : <Loader />}
      </Layout>
    </RecoilRoot>
  );
}

export default App;
