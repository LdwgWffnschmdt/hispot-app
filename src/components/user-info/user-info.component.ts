import { Component, Input } from '@angular/core';
import { User } from "../../models/models";

@Component({
  selector: 'user-info',
  templateUrl: 'user-info.component.html'
})
export class UserInfoComponent {

  @Input() user: User;
  @Input() isMenu: boolean = false;

  constructor() {}

}
