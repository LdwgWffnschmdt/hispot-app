import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, Loading, LoadingController, NavController, NavParams } from 'ionic-angular';

import { AuthService } from './../../providers/auth.service';
import { MapPage } from './../map/map';

@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {

  loading: boolean = false;

  constructor(
    public alertCtrl: AlertController,
    public authService: AuthService,
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {

  }

  onSigninWithFacebook(): void {
    
    this.showLoading();

    this.authService.signinWithFacebook()
      .then((isLogged: boolean) => {

        if (isLogged) {
          this.navCtrl.setRoot(MapPage);
          // this.hideLoading();
        }

      }).catch((error: any) => {
        console.log(error);
        this.hideLoading();
        this.showAlert(error);
      });

  }

  skip(): void {

    this.showLoading();
    
    this.authService.fakeLogin()
      .then((isLogged: boolean) => {

        if (isLogged) {
          this.navCtrl.setRoot(MapPage);
          // this.hideLoading();
        }

      }).catch((error: any) => {
        console.log(error);
        this.hideLoading();
        this.showAlert(error);
      });
  }

  private showLoading(): void {
    this.loading = true;
  }

  private hideLoading(): void {
    this.loading = false;
  }

  private showAlert(message: string): void {
    this.alertCtrl.create({
      message: message,
      buttons: ['Ok']
    }).present();
  }

}
