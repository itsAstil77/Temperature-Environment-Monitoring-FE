import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-newuser',
  imports: [CommonModule],
  templateUrl: './newuser.html',
  styleUrl: './newuser.css'
})
export class Newuser {

  @Input() users: any[] = [];

  @Output() editUser = new EventEmitter<any>();
  @Output() deleteUser = new EventEmitter<any>();

  onEdit(user: any) {
    this.editUser.emit(user);
  }

  onDelete(user: any) {
    this.deleteUser.emit(user);
  }

}
