import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { AuthService } from './../../providers/auth.service';
import { User } from "../../models/models";

@Component({
  selector: 'page-edit-user-profile',
  templateUrl: 'edit-user-profile.html',
})
export class EditUserProfilePage {
  @ViewChild('content') content: any;
  
  state: number = -1;
  offset: number = 50;

  uploadProgress: number;
  private filePhoto: File;

  constructor(
    public authService: AuthService,
    public navParams: NavParams,
    public element: ElementRef,
    public viewCtrl: ViewController
  ) {
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.authService.authenticated;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    // if (this.filePhoto) {

    //   let uploadTask = this.userService.uploadPhoto(this.filePhoto, this.currentUser.$key);

    //   uploadTask.on('state_changed', (snapshot) => {

    //     this.uploadProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

    //   }, (error: Error) => {
    //     // catch error
    //   }, () => {
    //     this.editUser(uploadTask.snapshot.downloadURL);
    //   });

    // } else {
      this.editUser();
    // }
    
    this.viewCtrl.dismiss();
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  onPhoto(event): void {  
    this.filePhoto = event.target.files[0];
  }

  private editUser(photoUrl?: string): void {
    // this.userService
    //   .edit({
    //     name: this.currentUser.name,
    //     username: this.currentUser.username,
    //     photo: photoUrl || this.currentUser.photo || ''
    //   }).then(() => {
    //     this.canEdit = false;
    //     this.filePhoto = undefined;
    //     this.uploadProgress = 0;
    //   });
  }

}
