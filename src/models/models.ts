
export enum MessageType {
  TEXT = <any>'TEXT',
  PICTURE = <any>'PICTURE'
}

export interface User {
  id: string;
  fbId: string;
  name: string;
  description: string;
  age: number;
  pictures: [Picture];
  location: Location;
  locationTime: Date;
  chats: [Chat];
}

export interface Chat {
  id: string;
  user: User;
  location: Location;
  messages: [Message];
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  sender: User;
  timestamp: Date;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  pictures: [Picture];
  lat: number;
  lng: number;
  visitors: [User];
  feed: Chat;
}

export interface Picture {
  id: string;
  url: string;
  timestamp: Date;
  expires: boolean;
}
