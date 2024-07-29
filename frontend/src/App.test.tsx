import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import ChatProps from './ChatProps';
import ChatSocket from './ChatSocket';

const socketInstance = ChatSocket.instance;

test('renders learn react link', () => {
  render(<App socket={socketInstance.socket} />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
