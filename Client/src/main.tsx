import { StrictMode } from 'react'; //No visible UI will be rendered
import { createRoot } from 'react-dom/client'; //import new engine for react 18
import './index.css';
import App from './App'; 

// find the root element in the HTML where the React app will be mounted
const container = document.getElementById('root');

if (container) {
  const root = createRoot(container); //initidize the react 18 root
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}