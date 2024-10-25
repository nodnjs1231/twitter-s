import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { BrowserRouter as Rouoter } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Rouoter>
    <App />
  </Rouoter>
);  
