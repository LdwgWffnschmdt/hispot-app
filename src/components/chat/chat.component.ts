import { Component, Input, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';

import { AuthService } from './../../providers/auth.service';
import { Chat, User } from "../../models/models";

@Component({
  selector: 'chat',
  templateUrl: 'chat.component.html'
})
export class ChatComponent {

  @Input() chat: Chat;

  @ViewChild(Content) content: Content;
  
  newMessage: string = "";

  constructor(
    public authService: AuthService,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.authService.authenticated;
  }

  sendMessage(newMessage: string): void {

    if (newMessage) {

    }

  }

  private scrollToBottom(duration?: number): void {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(duration || 300);
      }
    }, 50);
  }

}
