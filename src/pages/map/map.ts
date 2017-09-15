import { StatusPage } from './../status/status';
import { LocationSwitcherComponent } from './../../components/location-switcher/location-switcher';
import { Location } from './../../models/models';
import { LocationPage } from './../location/location';
import { UserProfilePage } from './../user-profile/user-profile';
import { Component, ViewChild, ElementRef, NgZone, Renderer } from '@angular/core';
import { NavController, MenuController, Navbar, AlertController, PopoverController, ModalController, Content } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';

import { ChatListPage } from '../chat-list/chat-list';

declare var google;

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import gql from 'graphql-tag';

import { AuthService } from './../../providers/auth.service';
import { Chat, User } from "../../models/models";
import { ChatPage } from "../chat/chat";

const GetLocationQuery = gql`
  query location($googlePlaceId: String) {
    location(googlePlaceId: $googlePlaceId) {
      id
      googlePlaceId
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
          id
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
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  @ViewChild('navbar') navbar: Navbar;
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('feed') feed: any;

  @ViewChild(Content) content: Content;
  
  state: number = -1;
  offset: number = 150;
  
  zone: any;
  map: any;

  loading: boolean = false;

  currentLocation: Location;

  mapInitialised: boolean = false;
  onDevice: boolean;
  apiKey: any = "AIzaSyA7I5gFFrRO8VzqmDK4Jw6qle5TG2b3IiQ";
  locationMarker: any;
  locationAccuracyCircle: any;
  locationWatching: boolean = false;
  
  closeLocations: [Location] = [
    new Location("ChIJPdTV4C5QqEcRYuaEK_x3_h8", "Zyankali Bar"),
    new Location("ChIJ528Y3ddPqEcRpJK-keQ4D0A", "Junction Bar"),
    new Location("ChIJvXT5xddPqEcRIwILgO_CnC0", "Mokkabar")
  ]

  constructor(
    public alertCtrl: AlertController,
    public element: ElementRef,
    public authService: AuthService,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public geolocation: Geolocation,
    public network: Network,
    private apollo: Apollo,
    public renderer: Renderer
  ) {
    this.zone = new NgZone({ enableLongStackTrace: false });

    // Check if online or not
    this.isOnline();

    this.network.onConnect().subscribe(() => {
      console.log('network connect');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.isOnline()) {
          if (typeof google == "undefined" || typeof google.maps == "undefined") {

            this.loadGoogleMaps();

          } else {

            if (!this.mapInitialised) {
              this.initMap();
            }
          }
        }
      }, 1000);
    });

    this.network.onDisconnect().subscribe(() => {
      this.renderer.setElementClass(this.element.nativeElement, "offline", true);
    });

    this.loadGoogleMaps();
  }

  // ionViewCanEnter(): Promise<boolean> {
  //   return this.authService.authenticated;
  // }

  ionViewDidLoad() {
    this.setState(0);

    this.navbar.backButtonClick = (e: UIEvent) => {
      this.setState(1);
    };

    this.feed.ionScroll.subscribe((ev) => {
      ev.domWrite(() => {
        
        if (this.state == 1 && ev.directionY == "down" && ev.scrollTop > this.offset) { // DOWN
          this.setState(4);
        }
        else if (this.state == 4 && (ev.directionY == "up" && ev.velocityY > 5) || (ev.scrollTop <= this.offset)) { // UP
          this.setState(1);
        }
    
        });
    });

    // vanilla JS
    // var people = document.querySelector('.people');
    // var iso = new Isotope( people, {
    //   itemSelector: '.image-button',
    //   layoutMode: 'masonryHorizontal',
    //   masonry: {
    //     rowHeight: 33
    //   }
    // });
  }

  setState(state: number): void {
    if (this.state == state || (state != 0 && !this.currentLocation)) return;
    console.log("Go to state " + state);

    if (this.state == 2) {
      this.map.setCenter(this.locationMarker.getPosition());
      this.map.setZoom(19);
    }

    this.renderer.setElementClass(this.element.nativeElement, "state-" + this.state, false);
    this.state = state;
    this.renderer.setElementClass(this.element.nativeElement, "state-" + this.state, true);
  }

  ////////////////////////////////////////////// LOGIN

  onSigninWithFacebook(): void {
    
    this.showLoading();

    this.authService.signinWithFacebook()
      .then((isLogged: boolean) => {

        if (isLogged) {
          this.getPlaceInformation(this.closeLocations[0].googlePlaceId)
            .then((response) => {
              this.currentLocation = response
              this.setState(1);
              this.hideLoading();
            });

          // this.navCtrl.setRoot(MapPage);
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
          this.getPlaceInformation(this.closeLocations[0].googlePlaceId)
            .then((response) => {
              this.currentLocation = response
              this.setState(1);
              this.hideLoading();
            });

          // this.navCtrl.setRoot(MapPage);
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

  ////////////////////////////////////////////// MAP

  loadGoogleMaps() {

    if (typeof google == "undefined" || typeof google.maps == "undefined") {

      if (this.isOnline()) {
        console.log("online, loading map");

        //Load the SDK
        window['mapInit'] = () => {
          this.initMap();
        }

        let script = document.createElement("script");
        script.id = "googleMaps";

        if (this.apiKey) {
          script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=places';
        } else {
          script.src = 'http://maps.google.com/maps/api/js?callback=mapInit&libraries=places';
        }

        document.body.appendChild(script);

      }
    }
    else {

      if (this.isOnline()) {
        console.log("showing map");
        this.initMap();
      }

    }

  }

  initMap() {
    // this.geolocation.getCurrentPosition({ timeout: 30000 }).then((position) => {
      var position = {
        coords: {
          latitude: 52.4916686397199,
          longitude: 13.392747044563293,
          accuracy: 10
        }
      };

      if (position.coords !== undefined) {

        this.setLocationAvailable(true);

        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        let mapOptions = {
          center: latLng,
          zoom: 19,
          gestureHandling: 'greedy',
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              "elementType": "labels.icon",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#ffffff"
                }
              ]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry.fill",
              "stylers": [
                {
                  "color": "#b32552"
                }
              ]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry.stroke",
              "stylers": [
                {
                  "color": "#b32552"
                },
                {
                  "weight": 1
                }
              ]
            },
            {
              "featureType": "administrative.land_parcel",
              "elementType": "labels",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "administrative.locality",
              "stylers": [
                {
                  "visibility": "simplified"
                }
              ]
            },
            {
              "featureType": "landscape",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#b32552"
                }
              ]
            },
            {
              "featureType": "landscape.man_made",
              "elementType": "labels",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "landscape.natural",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#7b1a39"
                }
              ]
            },
            {
              "featureType": "poi",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#7b1a39"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "labels.icon",
              "stylers": [
                {
                  "hue": "#0094d4"
                },
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "poi.business",
              "elementType": "labels.icon",
              "stylers": [
                {
                  "visibility": "simplified"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry.stroke",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "labels",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#b32552"
                },
                {
                  "lightness": -20
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.fill",
              "stylers": [
                {
                  "color": "#b32552"
                },
                {
                  "lightness": -40
                }
              ]
            },
            {
              "featureType": "road.highway.controlled_access",
              "elementType": "geometry.stroke",
              "stylers": [
                {
                  "color": "#b32552"
                },
                {
                  "lightness": -40
                }
              ]
            },
            {
              "featureType": "road.local",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#b32552"
                },
                {
                  "saturation": 60
                },
                {
                  "lightness": 20
                }
              ]
            },
            {
              "featureType": "transit",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#7b1a39"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#090228"
                }
              ]
            }
          ],
          disableDefaultUI: true
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        this.locationMarker = new google.maps.Marker({
          position: latLng,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            strokeColor: '#ffffff',
            strokeOpacity: 0.6,
            strokeWeight: 1,
            fillColor: '#0094d4',
            fillOpacity: 1
          },
          draggable: false,
          clickable: false,
          map: this.map
        });

        this.locationAccuracyCircle = new google.maps.Circle({
          center: latLng,
          radius: position.coords.accuracy,
          map: this.map,
          strokeColor: '#ffffff',
          strokeOpacity: 0.3,
          strokeWeight: 1,
          fillColor: '#0094d4',
          fillOpacity: 0.3,
          clickable: false
        });

        // Listen for clicks on the map.
        this.map.addListener('click', this.handleClick.bind(this));

        // this.geolocation.watchPosition({ timeout: 10000 }).subscribe((position) => {
        //   if (position.coords !== undefined) {
        //     this.setLocationAvailable(true);

        //     if (this.locationMarker && this.locationAccuracyCircle) {
        //       let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        //       this.locationMarker.setPosition(latLng);
        //       this.locationAccuracyCircle.setCenter(latLng);
        //       this.locationAccuracyCircle.setRadius(Number(position.coords.accuracy));
        //     };
        //   }
        //   else {
        //     this.onLocationError(position);
        //   }
        // }, this.onLocationError);

        this.locationWatching = true;
        this.mapInitialised = true;
      }
      else {
        this.onLocationError(null);
      }
    // }, this.onLocationError).catch(this.onLocationError);
  }

  setLocationAvailable(locationAvailable: boolean) : void {
    this.renderer.setElementClass(this.element.nativeElement, "no-location", !locationAvailable);
  }

  onLocationError(error) {
    // this.setLocationAvailable(false);

    // if (!this.locationWatching) {
    //   var temporaryLocationWatch = this.geolocation.watchPosition({ timeout: 10000 }).subscribe((position) => {
    //     if (position.coords !== undefined && (this.isOnline())) {
    //       if (typeof google == "undefined" || typeof google.maps == "undefined") {

    //         this.loadGoogleMaps();

    //       } else {

    //         if (!this.mapInitialised) {
    //           this.initMap();
    //         }
    //       }

    //       temporaryLocationWatch.unsubscribe();
    //     }
    //   });
    //   this.locationWatching = true;
    // }

    console.log('Error getting location', error);
  }


  handleClick(event) {
    
    // If the event has a placeId, use it.
    if (event.placeId) {
      // this.zone.run(() => {
      //   this.currentLocationLoading = true;
      // });
      console.log(event.placeId);

      // Calling e.stop() on the event prevents the default info window from
      // showing.
      // If you call stop here when there is no placeId you will prevent some
      // other map click event handlers from receiving the event.
      event.stop();
      
      this.goToLocation(new Location(event.placeId, ""));
    }
  };

  getPlaceInformation(placeId: string): Promise<Location> {
    console.log("Get Place Information");
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

  checkIn(placeId: string): void {
    this.setState(1);
    this.showLoading();
    this.getPlaceInformation(placeId == this.currentLocation.googlePlaceId ? "0" : placeId)
      .then((response) => {
        this.currentLocation = response
        this.setState(1);
        this.hideLoading();
      });
  }

  ////////////////////////////////////////////// NETWORK

  isOnline(): boolean {
    var online: boolean = false;

    if (this.onDevice && this.network.type) {
      online = this.network.type !== 'none';
    } else {
      online = navigator.onLine;
    }

    this.renderer.setElementClass(this.element.nativeElement, "offline", !online);

    return online;
  }

  ////////////////////////////////////////////// NAVIGATION

  newStatus(): void {
    let modal = this.modalCtrl.create(StatusPage);
    
    modal.onDidDismiss((data) => {
      if (data) {
        console.log("data", data);
        // this.currentLocation.feed.messages.push(data);
        this.scrollToTop();
      }
    });

    modal.present();
  }
   
  selectLocation(ev) {
    if (this.loading) return;

    let popover = this.popoverCtrl.create(LocationSwitcherComponent,
      {
        locations: this.closeLocations,
        currentLocation: this.currentLocation
      }
    );

    popover.present({
      ev: ev
    });
 
    popover.onDidDismiss((popoverData) => {
      if (popoverData) {
        console.log("popoverData", popoverData);
        if (popoverData.checkIn == true) {
          this.checkIn(popoverData.location.googlePlaceId);
        }
        else {
          this.goToLocation(popoverData.location);
        }
      }
    })
  }

  goToLocation(location: Location): void {
    if (location.googlePlaceId != "0") {
      let modal = this.modalCtrl.create(LocationPage,
        {
          placeId: location.googlePlaceId,
          // 0: Location is current Location
          // 1: Can check in
          // 2: Too far away for check in 
          checkInStatus: location.googlePlaceId == this.currentLocation.googlePlaceId ? 0 : this.closeLocations.find((loc) => loc.googlePlaceId == location.googlePlaceId) ? 1 : 2
        }
      );
      
      modal.onDidDismiss((data) => {
        if (data) {
          if (data.checkIn == true) this.checkIn(location.googlePlaceId);
        }
      });
  
      modal.present();
    }
  }
 
  openChat(chat: Chat): void {
    this.navCtrl.push(ChatPage, { chat: chat });
  }

  openProfile(_user: User): void {
    this.navCtrl.push(UserProfilePage, {userId: _user.id})
  }

  openOwnProfile(): void {
    this.navCtrl.push(UserProfilePage, {user: this.authService.currentUser})
  }

  private scrollToTop(duration?: number): void {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToTop(duration || 300);
      }
    }, 50);
  }

}
