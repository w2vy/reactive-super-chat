import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import ChatProps from './ChatProps';
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
      const jident = JSON.parse(ident);
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

test('renders learn react link', () => {
  <App fluxchat={fluxchat}/>
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
