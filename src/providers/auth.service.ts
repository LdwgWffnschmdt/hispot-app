import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';

import { BaseService } from "./base.service";

import { Facebook } from '@ionic-native/facebook';
import { FacebookService, InitParams, LoginResponse } from 'ngx-facebook';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { User } from "../models/models";

const GetUserFromIdQuery = gql`
  query user($id: ID!) {
    user(id: $id) {
      id
      fbId
      name
      description
      age
      pictures {
        url
      }
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

const GetUserFromFbIdQuery = gql`
  query user($fbId: String) {
    user(fbId: $fbId) {
      id
      fbId
      name
      pictures {
        url
      }
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

interface QueryResponse{
  user: User
  loading: boolean
}

@Injectable()
export class AuthService extends BaseService {

  constructor(
    public fb: Facebook,
    public platform: Platform,
    public jsfb: FacebookService,
    public apollo: Apollo
  ) {
    super();
    console.log('Hello Auth Provider');

    // Initialize FB JS API (on Cordova we use the native API)
    if (!this.platform.is("cordova")){
      const params: InitParams = {
        appId: '620636164812861',
        version: 'v2.9'
      };

      this.jsfb.init(params);
    }
  }

  fakeLogin(): Promise<boolean> {
    console.log("Fake login");
    return this.getUserFromFacebookID("100000233467836")
      .then((_user: User) => {
        console.log("User", _user);

        // Save the resulted User in local storage
        this.currentUser = _user;

        return _user != null;
      })
      .catch(this.handlePromiseError);
  }
  
  signinWithFacebook(): Promise<boolean> {
    console.log("Sign in with Facebook");
    // Local Facebook login --> Token
    return this._fbLogin(["email, user_likes"])
      .then((_response: any) => {
        console.log("Facebook response", _response);
        
        // Save token --> Will be used in all GraphQL queries
        this.fbToken = _response.authResponse.accessToken;
        
        // Get the current User by Facebook ID
        return this.getUserFromFacebookID(_response.authResponse.userID);
      })
      .then((_user: User) => {
        console.log("User", _user);

        // Save the resulted User in local storage
        this.currentUser = _user;

        return _user != null;
      })
      .catch(this.handlePromiseError);
  }
  
  // Wrapper for Native / JS Facebook API
  private _fbLogin(permissions: string[]): Promise<any> {
    if (this.platform.is("cordova")){
      console.log("Native Facebook login flow");

      return this.fb.login(['email, user_likes']);
    }
    else{
      console.log("JS Facebook login flow");
      
      return this.jsfb.login();
    }
  }

  getUserFromFacebookID(id: string): Promise<User> {
    console.log("Get user from FB Id", id);

    return new Promise<User>((resolve, reject) =>
      this.apollo.watchQuery<QueryResponse>({
        query: GetUserFromFbIdQuery,
        variables: {
          fbId: id
        }
      }).subscribe(({data}) => {
        resolve(data.user || null);
      }));
  }

  logout(): Promise<void> {
    return null;
  }


  // Checks if the User is authenticated.
  // This can definetely be improved (token expiration or something)
  get authenticated(): Promise<boolean> {
    console.log("Authenticated?");
    return new Promise((resolve, reject) => {
      if (this.fbToken != null && this.currentUser != null && this.currentUser.fbId) {
        
        this.getUserFromFacebookID(this.currentUser.fbId)
          .then((_user: User) => {
            // Save the resulted User in local storage
            // this.currentUser = _user;

            (_user != null) ? resolve(true) : reject(false);
          })
          .catch(this.handlePromiseError);
      }
      else {
        reject(false);
      }
    });
  }

  get fbToken(): string {
    return localStorage.getItem("fbToken") || null;
  }
  set fbToken(_fbToken: string) {
    localStorage.setItem("fbToken", _fbToken);
  }

  get currentUser(): User {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
  }
  set currentUser(_currentUser: User) {
    localStorage.setItem("currentUser", JSON.stringify(_currentUser));
  }
}
