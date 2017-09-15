import { Location } from './../../models/models';
import { Component } from '@angular/core';
import { ViewController, NavParams } from "ionic-angular";

@Component({
  selector: 'location-switcher',
  templateUrl: 'location-switcher.html'
})
export class LocationSwitcherComponent {
  locations: [Location];
  currentLocation: Location;
  none: Location = new Location("0", "Keine Location");

  constructor(private params: NavParams, public viewCtrl: ViewController) {
    this.locations = params.get('locations');
    this.currentLocation = params.get('currentLocation');

    console.log(this.currentLocation);
  }

  checkIn(event, location: Location) {
    this.viewCtrl.dismiss({ location: location, checkIn: true });
    event.stopPropagation();
  }

  close(event, location: Location) {
    this.viewCtrl.dismiss({ location: location, checkIn: false });
    event.stopPropagation();
  }
}
