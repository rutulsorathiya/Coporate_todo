import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {NavigationEnum} from "../../enums/navigation.enum";
import {UserRoleEnum} from "../../enums/user.enum";
import {MessageService} from "primeng/api";
import {User} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  signInForm: FormGroup;
  scope: string = 'login';
  userRole: Array<string> = [UserRoleEnum.DEVELOPER, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN];
  userList: Array<User> = [];

  constructor(private readonly router: Router,
              private readonly messageService: MessageService,
              private readonly fb: FormBuilder,
              private userService: UserService) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    })
    this.signInForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      reEnterPassword: ['', Validators.required],
      role: [UserRoleEnum.ADMIN, Validators.required]
    });
  }

  ngOnInit() {
    this.userList = this.userService.getUserList();
  }

  async doLogin() {
    if (this.loginForm.value) {
      const validUser = this.userList.filter(user => user.email === this.loginForm.value.email && user.password === this.loginForm.value.password);
      localStorage.setItem('currentUser',JSON.stringify(validUser[0]))
      if (validUser.length) {
        await this.router.navigate([NavigationEnum.DASHBOARD]);
      } else {
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Please enter valid credentials'
        })
      }
    }
  }

  doSingIn() {
    if (this.signInForm.invalid) {
      return;
    }
    if (this.signInForm.controls['password'].value === this.signInForm.controls['reEnterPassword'].value) {
      delete this.signInForm.value.reEnterPassword;
      this.userList.push(this.signInForm.value)
      localStorage.setItem('userList', JSON.stringify(this.userList));
      this.scope = 'login';
      this.signInForm.reset();
      this.messageService.add({
        severity: 'success',
        detail: 'User created successfully'
      })
    } else {
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        detail: 'Passwords do not match. Please ensure that the passwords entered in both fields match exactly.'
      })
    }
  }

  changeScope() {
    this.scope = this.scope === 'login' ? 'signUp' : 'login';
    this.signInForm.reset();
    this.loginForm.reset();
    this.signInForm.controls['role'].setValue(UserRoleEnum.DEVELOPER)
  }
}
