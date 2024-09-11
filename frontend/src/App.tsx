import { Route } from "wouter";
import LoginForm from "./pages/LoginForm";
import Chat from "./pages/Chat";
import ChoiceTheme from "./pages/ChoiceTheme";
import "./App.css";
import ChatProps from "./ChatProps";

function App({ fluxchat }: ChatProps) {
  return (
    <div>
      <Route path="/" component={() => <LoginForm fluxchat={fluxchat}/>} />
      <Route path="/chat" component={() => <Chat fluxchat={fluxchat}/>} />
      <Route path="/theme" component={ChoiceTheme} />
    </div>
  );
}

export default App;
