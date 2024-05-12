import {CanActivateFn} from '@angular/router';
import {inject} from "@angular/core";
import {UserService} from "../services/user.service";

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  return userService.getCurrentUser() && !!Object.keys(userService.getCurrentUser()).length;
};
