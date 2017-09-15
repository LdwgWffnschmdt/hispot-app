import { AuthService } from './../../providers/auth.service';
import { Message, MessageType } from './../../models/models';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-status',
  templateUrl: 'status.html',
})
export class StatusPage {
  content: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public authService: AuthService) {
  }

  post() {
    var message = new Message();
    message.content = this.content;
    message.type = MessageType.TEXT;
    message.sender = this.authService.currentUser;
    message.timestamp = new Date(Date.now());
    this.viewCtrl.dismiss(message);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
