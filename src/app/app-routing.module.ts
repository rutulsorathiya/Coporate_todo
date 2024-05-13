import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {NavigationEnum} from "./enums/navigation.enum";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {TaskListComponent} from "./components/task-list/task-list.component";
import {authGuard} from "./guards/auth.guard";

const routes: Routes = [
  {
    path: '',
    redirectTo: NavigationEnum.LOGIN,
    pathMatch: 'full'
  },
  {
    path: NavigationEnum.LOGIN,
    component: LoginComponent
  },
  {
    canActivate: [authGuard],
    path: NavigationEnum.DASHBOARD,
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: TaskListComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: NavigationEnum.LOGIN
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
