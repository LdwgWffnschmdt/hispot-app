import { Component, Input } from '@angular/core';
import { Message, User, MessageType } from "../../models/models";
import { AuthService } from "../../providers/auth.service";

@Component({
  selector: 'message-box',
  templateUrl: 'message-box.component.html'
})
export class MessageBoxComponent {

  @Input() message: Message;

  constructor(public authService: AuthService) { }
}
