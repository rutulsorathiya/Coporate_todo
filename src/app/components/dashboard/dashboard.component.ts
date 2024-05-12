import {Component, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import TaskList from '../../../assets/task-list.json'
import {Task} from '../../interfaces/task.interface';
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
        label: this.userService.getFullName(this.userService.getCurrentUser()),
        icon: 'pi pi-user',
        escape: false,
        items: [
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            routerLink: ['/', NavigationEnum.LOGIN]
          },
        ],
      },
    ]
  }
}
