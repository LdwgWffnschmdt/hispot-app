import { Chat, Message, MessageType } from './../../models/models';
import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams, TextInput } from 'ionic-angular';

import { AuthService } from './../../providers/auth.service';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  chat: Chat;

  message: string = "";
  
  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  
  constructor(
    public authService: AuthService,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.chat = <Chat>navParams.get('chat');
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.authService.authenticated;
  }

  ionViewDidEnter() {
    this.scrollToBottom();
    // setTimeout(() => {
    //   this.scrollToBottom();
    // }, 100);
  }

  sendMessage(): void {

    if (this.message) {
      // This is a new Chat --> Add it to the chat list
      if (this.chat.messages.length == 0) {
        this.authService.currentUser.chats.push(this.chat);
      }

      var message = new Message();
      message.content = this.message;
      message.type = MessageType.TEXT;
      message.sender = this.authService.currentUser;
      message.timestamp = new Date(Date.now());
      
      this.chat.messages.push(message);

      this.message = "";

      this.messageInput.setFocus();
      this.scrollToBottom();

      setTimeout(() => {
        var message = new Message();
        message.content = "Das hier ist eine einfache Antwort, die jedes Mal kommt.";
        message.type = MessageType.TEXT;
        message.sender = this.chat.user;
        message.timestamp = new Date(Date.now());
        
        this.chat.messages.push(message);

        this.scrollToBottom();
      }, 1000);
    }
  }

  scrollToBottom(duration?: number): void {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(duration || 300);
      }
    }, 50);
  }

}
