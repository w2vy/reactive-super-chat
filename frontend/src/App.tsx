import { Route } from "wouter";
import LoginForm from "./pages/LoginForm";
import Chat from "./pages/Chat";
import ChoiceTheme from "./pages/ChoiceTheme";
import "./App.css";
import ChatProps from "./ChatProps";

function App({ socket }: ChatProps) {
  return (
    <div>
      <Route path="/" component={LoginForm} />
      <Route path="/chat" component={() => <Chat socket={socket} />} />
      <Route path="/theme" component={ChoiceTheme} />
    </div>
  );
}

export default App;
