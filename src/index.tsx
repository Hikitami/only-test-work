import ReactDOM from 'react-dom/client';
import { Main } from './pages';
import './styles/normolize.css'

const App = () => {
  return (
    <div>
      <Main/>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);