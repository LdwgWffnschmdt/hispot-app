import { Chat, Message } from './../../models/models';
import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';

import { AuthService } from './../../providers/auth.service';
import { User } from "../../models/models";

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import gql from 'graphql-tag';
import { ChatPage } from "../chat/chat";
import { EditUserProfilePage } from "../edit-user-profile/edit-user-profile";

const GetUserQuery = gql`
query user($id: ID) {
  user(id: $id) {
    id
    name
    description
    age
    pictures {
      url
    }
  }
}
`;

interface GetUserQueryResponse{
  user: User
  loading
}

@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  @ViewChild('content') content: any;
  
  state: number = -1;
  offset: number = 50;

  user: User;
  placeholder: any;
  canEdit: boolean = false;
  uploadProgress: number;
  private filePhoto: File;

  constructor(
    public authService: AuthService,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private apollo: Apollo,
    public modalCtrl: ModalController,
    public element: ElementRef,
    public renderer: Renderer
  ) {
    this.placeholder = {
      name: "Benutzername",
      description: "Eine lange und nicht unbedingt",
      age: 24,
      pictures: [
        { url: ""}
      ]
    };
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.authService.authenticated;
  }

  ionViewWillEnter() {

    this.user = this.navParams.get("user");

    if (this.user === undefined || this.user === null) {
      this.getUserInformation(this.navParams.get("userId"))
        .then((response) => {
          this.user = response;
        });
    }
  }

  ionViewDidLoad() {
    this.setState(0);

    this.content.ionScroll.subscribe((ev) => {
      ev.domWrite(() => {
        
        if (this.state == 0 && ev.directionY == "down" && ev.scrollTop > this.offset) { // DOWN
          this.setState(1);
        }
        else if (this.state == 1 && ev.scrollTop <= this.offset) {  // UP
          this.setState(0);
        }
    
        });
    });
  }

  setState(state: number): void {
    if (this.state == state) return;

    this.renderer.setElementClass(this.element.nativeElement, "state-" + this.state, false);
    this.state = state;
    this.renderer.setElementClass(this.element.nativeElement, "state-" + this.state, true);
  }

  getUserInformation(userId: string): Promise<User> {
    console.log("Get user Information for ID", userId);
    return new Promise<User>((resolve, reject) =>
      this.apollo.watchQuery<GetUserQueryResponse>({
        query: GetUserQuery,
        variables: {
          id: userId
        }
      }).subscribe(({data}) => {
        console.log("Got user data for", data.user.id);
        if (data.user) resolve(data.user);
      })
    );
  }

  startChat(): void {
    var chat = this.authService.currentUser.chats.find((value) => value.user.id == this.user.id);

    if (!chat) {
      var chat = new Chat();

      chat.user = this.user;
      chat.messages = <[Message]>[];
    }
    
    this.navCtrl.push(ChatPage, { chat: chat });

  }

  editUser(): void {
    let modal = this.modalCtrl.create(EditUserProfilePage);
    
    // modal.onDidDismiss((data) => {
    //   if (data) {
    //     console.log("data", data);
    //     // this.currentLocation.feed.messages.push(data);
    //     this.scrollToTop();
    //   }
    // });

    modal.present();
  }
}
