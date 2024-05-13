import {Injectable} from '@angular/core';
import {User} from "../interfaces/user.interface";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() {
  }

  getCurrentUser() {
    if (localStorage.getItem('currentUser')) {
      return JSON.parse(localStorage.getItem('currentUser') ?? '');
    } else {
      return;
    }

  }

  getUserList() {
    if (localStorage.getItem('userList')) {
      return JSON.parse(localStorage.getItem('userList') ?? '');
    } else {
      return [];
    }
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  getFullNameWithUserRole(user: User): string {
    return `${user.firstName} ${user.lastName} (${user.role})`;
  }
}
