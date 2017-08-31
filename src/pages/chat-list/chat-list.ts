import { ChatPage } from './../chat/chat';
import { Observable } from 'rxjs';
import { Component } from '@angular/core';

import { MenuController, NavController } from 'ionic-angular';

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import gql from 'graphql-tag';

import { AuthService } from './../../providers/auth.service';
import { Chat, User } from "../../models/models";

const GetChatsQuery = gql`
  query user($id: ID) {
    user(id: $id) {
      chats {
        id
        user {
          name
          pictures {
            url
          }
        }
        messages {
          id
          content
          type
          timestamp
          sender {
            id
            name
            pictures {
              url
            }
          }
        }
      }
    }
  }
`;

interface GetChatsQueryResponse{
  user: User
  loading
}

@Component({
  selector: 'page-chat-list',
  templateUrl: 'chat-list.html'
})
export class ChatListPage {

  view: string = 'chats';

  chats: Observable<[Chat]>;

  constructor(
    public authService: AuthService,
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    private apollo: Apollo
  ) {}

 ionViewWillEnter(){
  this.chats = this.apollo.watchQuery<GetChatsQueryResponse>({
    query: GetChatsQuery,
    variables: {
      id: 123
    }
  }).map(({data}) => data.user.chats);
 }

  ionViewCanEnter(): Promise<boolean> {
    return this.authService.authenticated;
  }

  ionViewDidLoad() {
    this.menuCtrl.enable(true, 'user-menu');
  }

  onChatOpen(chat: Chat): void {
    this.navCtrl.push(ChatPage, { chat: chat });
  }

}
