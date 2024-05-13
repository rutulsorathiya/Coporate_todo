import {Component, OnInit} from '@angular/core';
import {Task} from "../../interfaces/task.interface";
import TaskList from "../../../assets/task-list.json";
import {TaskPriorityEnum, TaskStatusEnum} from "../../enums/task-status.enum";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../services/user.service";
import {User} from "../../interfaces/user.interface";
import {UserRoleEnum} from "../../enums/user.enum";

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  public isAddTaskDialogVisible: boolean = false;
  public taskForm: FormGroup;
  public priorityArr: Array<string> = [TaskPriorityEnum.HIGH, TaskPriorityEnum.MEDIUM, TaskPriorityEnum.LOW]
  public taskTabDetails: {
    tabTitle: string;
    tabUniqKey: string;
    totalCount: Number;
  }[] = [];
  public userList: any = []
  public selectedTabIndex: number = 0;
  public tableData: Array<Task> = [];
  public tableHeaderActionArr: Array<any> = [];
  private statusMappingObject: { [key: number]: string } = {
    0: TaskStatusEnum.AWAITED,
    1: TaskStatusEnum.TODO,
    2: TaskStatusEnum.DONE,
    3: TaskStatusEnum.REJECTED
  }
  public selectedTasks: Array<Task> = [];
  public isMoveTaskDialogVisible: boolean = false;
  public taskStatusArr: Array<string> = [];
  public selectedTaskStatus: string = TaskStatusEnum.TODO;
  public currentUser!: User;
  public taskList: Array<Task> = [];
  public isTaskViewDialogVisible: boolean = false;
  public taskDetails!: Task;
  protected readonly UserRoleEnum = UserRoleEnum;

  constructor(private readonly fb: FormBuilder, private userService: UserService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: [{value: TaskStatusEnum.AWAITED, disabled: true}, Validators.required],
      priority: ['', Validators.required],
      story_point: [1, [Validators.min(1), Validators.max(12)]],
      assigned_person: ['', Validators.required]
    })
  }


  ngOnInit() {
    localStorage.setItem('taskList', JSON.stringify(TaskList));
    this.taskList = JSON.parse(localStorage.getItem('taskList') ?? '');
    this.currentUser = this.userService.getCurrentUser();
    this.loadTableData(this.selectedTabIndex);
    this.initialiseTabItem();
    this.initialiseTableAction();
  }

  loadTableData(activeIndex: number): void {
    this.tableData = this.taskList.filter((task) => task.status === this.statusMappingObject[activeIndex]);
  }

  onFormSubmit() {
    if (this.taskForm.invalid) {
      return;
    }
    console.log(this.taskForm);
    this.taskList.push({
      ...this.taskForm.value,
      status: TaskStatusEnum.AWAITED,
      creation_date: new Date().toString(),
      creadted_by: this.userService.getFullName(this.currentUser)
    });
    localStorage.setItem('taskList', JSON.stringify(this.taskList));
    if (!this.selectedTabIndex) {
      this.loadTableData(this.selectedTabIndex)
    }
    this.taskTabDetails[0].totalCount = this.countOfTaskBasedOnStatus(TaskStatusEnum.AWAITED)
    this.isAddTaskDialogVisible = false;
    this.taskForm.reset();
  }

  tabChange() {
    this.selectedTasks = [];
    this.loadTableData(this.selectedTabIndex);
  }

  countOfTaskBasedOnStatus(status: string): number {
    return this.taskList.filter((task) => task.status === status).length
  }

  getSeverity(status: string): any {
    switch (status) {
      case TaskStatusEnum.AWAITED:
        return 'warning';
      case TaskStatusEnum.TODO:
        return 'primary';
      case TaskStatusEnum.DONE:
        return 'success';
      case TaskStatusEnum.REJECTED:
        return 'danger';
    }
  }

  getPriorityClass(status: string) {
    switch (status) {
      case TaskPriorityEnum.HIGH:
        return 'badge-danger';
      case TaskPriorityEnum.MEDIUM:
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  changeTaskStatus() {
    if (this.currentUser.role === UserRoleEnum.DEVELOPER) {
      this.selectedTasks.forEach(task => task.status = TaskStatusEnum.DONE);
      this.taskTabDetails[2].totalCount = this.countOfTaskBasedOnStatus(TaskStatusEnum.DONE);
    } else {
      this.selectedTasks.forEach(task => task.status = this.selectedTaskStatus);
      const key: string = this.getKeyByValue(this.selectedTaskStatus);
      this.taskTabDetails[+key].totalCount = this.countOfTaskBasedOnStatus(this.selectedTaskStatus);
    }
    this.taskTabDetails[this.selectedTabIndex].totalCount = this.countOfTaskBasedOnStatus(this.statusMappingObject[this.selectedTabIndex]);
    this.isMoveTaskDialogVisible = false;
    this.loadTableData(this.selectedTabIndex);
  }

  onTaskRowClick(task: Task): void {
    this.isTaskViewDialogVisible = true;
    this.taskDetails = task;
  }

  private initialiseTabItem(): void {
    this.taskTabDetails = [
      {
        tabTitle: 'Awaited tasks',
        tabUniqKey: 'Awaited_tasks',
        totalCount: this.countOfTaskBasedOnStatus(TaskStatusEnum.AWAITED)
      },
      {
        tabTitle: 'ToDo tasks',
        tabUniqKey: 'Todo_tasks',
        totalCount: this.countOfTaskBasedOnStatus(TaskStatusEnum.TODO)
      },
      {
        tabTitle: 'Done tasks',
        tabUniqKey: 'Done_tasks',
        totalCount: this.countOfTaskBasedOnStatus(TaskStatusEnum.DONE)
      },
      {
        tabTitle: 'Denied tasks',
        tabUniqKey: 'Denied_tasks',
        totalCount: this.countOfTaskBasedOnStatus(TaskStatusEnum.REJECTED)
      }
    ]
  }

  onClose() {
    this.taskForm.reset();
    this.isAddTaskDialogVisible = false;
  }

  getKeyByValue(value: string) {
    return Object.keys(this.statusMappingObject).find((key: any) => this.statusMappingObject[key] === value) ?? '';
  }

  onTaskDialogClose() {
    this.isMoveTaskDialogVisible = false;
  }

  private initialiseTableAction(): void {
    if (this.currentUser.role === UserRoleEnum.MANAGER) {
      this.tableHeaderActionArr.push({
        tooltipOptions: {
          tooltipLabel: 'Add new task',
          tooltipPosition: 'bottom',
        },
        icon: 'pi pi-plus',
        command: () => {
          this.taskForm.reset();
          this.taskForm.controls['status'].setValue(TaskStatusEnum.AWAITED);
          this.taskForm.controls['priority'].setValue(TaskPriorityEnum.HIGH);
          this.taskForm.controls['story_point'].setValue(1);
          this.isAddTaskDialogVisible = true;
          this.userList = this.userService.getUserList().filter((user: User) => user.role === UserRoleEnum.DEVELOPER).map((user: User) => this.userService.getFullName(user));
        },
      })
    }
    if (this.currentUser.role === UserRoleEnum.ADMIN || this.currentUser.role === UserRoleEnum.DEVELOPER) {
      this.tableHeaderActionArr.push({
        tooltipOptions: {
          tooltipLabel: 'Move task',
          tooltipPosition: 'bottom',
        },
        icon: 'pi pi-reply',
        command: () => {
          this.isMoveTaskDialogVisible = true;
          if (this.currentUser.role === UserRoleEnum.ADMIN) {
            this.taskStatusArr = [TaskStatusEnum.TODO, TaskStatusEnum.REJECTED];
          }
        },
      })
    }
  }
}
