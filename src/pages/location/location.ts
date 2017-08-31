import { Location } from './../../models/models';
import { Component, ViewChild, Renderer, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { AuthService } from './../../providers/auth.service';
import { User } from "../../models/models";

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import gql from 'graphql-tag';

const GetLocationQuery = gql`
query location($googlePlaceId: String) {
  location(googlePlaceId: $googlePlaceId) {
    id
    name
    description
    pictures {
      url
    }
    visitors {
      id
      pictures {
        url
      }
    }
    feed {
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

interface GetLocationQueryResponse{
  location: Location
  loading
}

@Component({
  selector: 'page-location',
  templateUrl: 'location.html',
})
export class LocationPage {
  @ViewChild('content') content: any;
  
  state: number = -1;
  offset: number = 50;

  location: Location;
  placeholder: any;

  checkInStatus: number = 2; // 0: Checked in, 1: Check in possible, 2: Out of reach

  constructor(
    public authService: AuthService,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private apollo: Apollo,
    public element: ElementRef,
    public renderer: Renderer
  ) {
    var user = {
      name: "Benutzername",
      pictures: [
        { url: ""}
      ]
    };

    var message = {
      content: "Das hier ist ein Platzhalter",
      sender: user,
      timestamp: Date.now()
    }

    this.placeholder = {
      name: "Name der Location",
      description: "Description ist meist etwas länger",
      pictures: [
        { url: ""}
      ],
      lat: 52,
      lng: 12,
      visitors: [ user, user, user, user, user, user, user, user, user ],
      feed: {
        messages: [ message, message, message, message, message ]
      }
    }
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.authService.authenticated;
  }

  ionViewWillEnter() {

    this.location = this.navParams.get("location");

    if (this.location === undefined || this.location === null) {
      this.getPlaceInformation(this.navParams.get("placeId"))
        .then((response) => {
          this.location = response;
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

  getPlaceInformation(placeId: string): Promise<Location> {
    return new Promise<Location>((resolve, reject) =>
      this.apollo.watchQuery<GetLocationQueryResponse>({
        query: GetLocationQuery,
        variables: {
          googlePlaceId: placeId
        }
      }).subscribe(({data}) => {
        if (data.location) resolve(data.location);
      })
    );
  }

}
