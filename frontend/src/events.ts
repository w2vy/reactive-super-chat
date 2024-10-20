// events.ts
export interface ServerToClientEvents {
  clientMessage: (message: string) => void;
}

export interface ClientToServerEvents {
  serverMessage: (message: string ) => void;
}

