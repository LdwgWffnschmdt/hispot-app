import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Facebook } from '@ionic-native/facebook'

import { FacebookService } from "ngx-facebook";

import { ElasticModule } from 'angular2-elastic';
import { MomentModule } from 'angular2-moment';

import { AuthService } from './../providers/auth.service';

import { ParallaxHeader } from '../directives/parallax-header/parallax-header';
import { Autoresize } from './../directives/autoresize/autoresize';

import { CapitalizePipe } from './../pipes/capitalize.pipe';

import { CustomLoggedHeaderComponent } from './../components/custom-logged-header/custom-logged-header.component';
import { MessageBoxComponent } from './../components/message-box/message-box.component';
import { ProgressBarComponent } from './../components/progress-bar/progress-bar.component';
import { UserInfoComponent } from './../components/user-info/user-info.component';
import { UserMenuComponent } from './../components/user-menu/user-menu.component';
import { LocationSwitcherComponent } from '../components/location-switcher/location-switcher';

import { SigninPage } from './../pages/signin/signin';
import { UserProfilePage } from './../pages/user-profile/user-profile';
import { EditUserProfilePage } from './../pages/edit-user-profile/edit-user-profile';
import { ChatPage } from './../pages/chat/chat';
import { ChatListPage } from '../pages/chat-list/chat-list';
import { MapPage } from './../pages/map/map';
import { HomePage } from '../pages/home/home';
import { LocationPage } from '../pages/location/location';
import { StatusPage } from './../pages/status/status';


import { ApolloClient, createNetworkInterface } from 'apollo-client';
import { ApolloModule } from 'apollo-angular';

import { MyApp } from './app.component';
import { ShrinkingSegmentHeader } from '../components/shrinking-segment-header/shrinking-segment-header';

const networkInterface = createNetworkInterface({ uri: 'https://hispot-server-segekjpsrd.now.sh/graphql' });
// const networkInterface = createNetworkInterface({ uri: 'http://localhost:3000/graphql' });

networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {};  // Create the header object if needed.
    }
    // get the authentication token from local storage if it exists
    req.options.headers.access_token = localStorage.getItem('fbToken') || null;
    next();
  }
}]);

const client = new ApolloClient({
  dataIdFromObject: (o: any) => {
    if (o.googlePlaceId) return o.googlePlaceId;
    else return o.id
  },
  networkInterface,
});

export function provideClient(): ApolloClient {
  return client;
}

declare var window;

export class MyErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    window.Ionic.handleNewError(err);
  }
}

@NgModule({
  declarations: [
    MyApp,
    ParallaxHeader,
    Autoresize,
    CapitalizePipe,
    CustomLoggedHeaderComponent,
    MessageBoxComponent,
    ProgressBarComponent,
    UserInfoComponent,
    UserMenuComponent,
    SigninPage,
    UserProfilePage,
    EditUserProfilePage,
    ChatPage,
    ChatListPage, 
    MapPage, 
    HomePage,
    LocationPage,
    StatusPage,
    ShrinkingSegmentHeader,
    LocationSwitcherComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    ApolloModule.forRoot(provideClient),
    MomentModule,
    ElasticModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SigninPage,
    UserProfilePage,
    EditUserProfilePage,
    ChatPage,
    ChatListPage, 
    MapPage, 
    HomePage,
    LocationPage,
    StatusPage,
    LocationSwitcherComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Facebook,
    Geolocation,
    Network,
    AuthService,
    FacebookService,
    [{ provide: ErrorHandler, useClass: MyErrorHandler }]
  ]
})
export class AppModule { }
