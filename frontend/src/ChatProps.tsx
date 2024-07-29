import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "./events";

interface ChatProps {
  socket: Socket <ServerToClientEvents, ClientToServerEvents>
}

export default ChatProps;