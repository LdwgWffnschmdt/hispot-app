import { UserProfilePage } from './../../pages/user-profile/user-profile';
import { Component, Input } from '@angular/core';

import { AlertController, App, MenuController } from 'ionic-angular';

import { AuthService } from "../../providers/auth.service";
import { BaseComponent } from "../base.component";
import { User } from "../../models/models";

@Component({
  selector: 'custom-logged-header',
  templateUrl: 'custom-logged-header.component.html'
})
export class CustomLoggedHeaderComponent extends BaseComponent {

  @Input() title: string;
  @Input() user: User;

  constructor(
    public alertCtrl: AlertController,
    public authService: AuthService,
    public app: App,
    public menuCtrl: MenuController
  ) {
    super(alertCtrl, authService, app, menuCtrl);
  }

  openProfile(_user: User): void {
    this.navCtrl.push(UserProfilePage, {userId: _user.id})
  }
}
