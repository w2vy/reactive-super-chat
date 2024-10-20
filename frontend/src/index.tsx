import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FluxChat } from 'fluxchat';

const FCServer = "http://162.55.166.99:34373";

class myWallet {
  readIdentity(nickName: string): string {
    let identity = localStorage.getItem(`identity_${nickName}`);
    if (identity === null) {
      const errorString = `Error reading identity for ${nickName}`;
      throw new Error(errorString);
    }
    return identity;
  }
  writeIdentity(nickName: string, ident: string): string {
    try {
      JSON.parse(ident); // Test if valid json
    } catch (error) {
      const errorstr = 'writeIdentity: passed string no JSON: ' + error;
      throw new Error(errorstr);
    }
    localStorage.setItem(`identity_${nickName}`, ident);
    return ident;
  }
}

const storage = new myWallet();
const fluxchat = new FluxChat(FCServer, storage);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App fluxchat={fluxchat}/>
  </React.StrictMode>
);

reportWebVitals();
