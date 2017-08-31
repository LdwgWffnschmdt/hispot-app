import { Chat } from './../../models/models';
import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';

import { AuthService } from './../../providers/auth.service';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  chat: Chat;

  @ViewChild(Content) content: Content;
  
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

  ionViewDidLoad() {

  }
}
