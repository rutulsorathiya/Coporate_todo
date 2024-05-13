import {Component} from '@angular/core';
import {MenuItem} from "primeng/api";
import {NavigationEnum} from "../../enums/navigation.enum";
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  public navBarItems: MenuItem[] = [];

  constructor(private userService: UserService, private readonly router: Router) {
    if (this.userService.getCurrentUser() && Object.keys(this.userService.getCurrentUser()).length) {
      this.initialiseNavbar();
    } else {
      this.router.navigate([NavigationEnum.LOGIN])
    }
  }

  initialiseNavbar() {
    this.navBarItems = [
      {
        label: this.userService.getFullNameWithUserRole(this.userService.getCurrentUser()),
        icon: 'pi pi-user',
        escape: false,
        items: [
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: async () => {
              localStorage.removeItem('currentUser');
              await this.router.navigate([NavigationEnum.LOGIN])
            }
          },
        ],
      },
    ]
  }
}
