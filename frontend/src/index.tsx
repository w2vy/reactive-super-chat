import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ChatSocket from "./ChatSocket"; 

const socketInstance = ChatSocket.instance;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App socket={socketInstance.socket} />
  </React.StrictMode>
);

reportWebVitals();
