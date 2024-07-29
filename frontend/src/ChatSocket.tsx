import socketIOClient from "socket.io-client";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "./events";
import DefaultEventsMap from "socket.io-client";

const FCServer = "http://localhost:34373";
//const FCServer = "http://162.55.166.99:34373";

// Singleton
class ChatSocket {
   public socket: Socket<ServerToClientEvents, ClientToServerEvents>;
   public static instance: ChatSocket = new ChatSocket();

  private constructor() {
     this.socket = socketIOClient(FCServer);
  }

  public emitServerMessage(data:string){
   let sock : Socket = this.socket;
   sock.emit("serverMessage", data );
   this.socket.emit("serverMessage", data );
  }

  public doOtherThings(){
     //...
  }
}

interface myProps {
   socket: Socket <typeof DefaultEventsMap, typeof DefaultEventsMap>
 }
 
export default ChatSocket;