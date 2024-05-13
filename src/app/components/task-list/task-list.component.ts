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

  constructor(private readonly fb: FormBuilder, private userService: UserService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
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

  initialiseTabItem() {
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

  initialiseTableAction() {
    this.tableHeaderActionArr = [
      {
        tooltipOptions: {
          tooltipLabel: 'Add new task',
          tooltipPosition: 'bottom',
        },
        icon: 'pi pi-plus',
        disabled: this.currentUser.role === UserRoleEnum.DEVELOPER,
        command: () => {
          this.isAddTaskDialogVisible = true;
          this.userList = this.userService.getUserList().map((user: User) => this.userService.getFullName(user));
        },
      },
      {
        tooltipOptions: {
          tooltipLabel: 'Move task',
          tooltipPosition: 'bottom',
        },
        icon: 'pi pi-reply',
        command: () => {
          this.isMoveTaskDialogVisible = true;
          if (this.currentUser.role === 'Manager') {
            this.taskStatusArr = [TaskStatusEnum.TODO, TaskStatusEnum.REJECTED];
          } else if (this.currentUser.role === 'Developer') {
            this.taskStatusArr = [TaskStatusEnum.DONE];
          }
        },
      },
    ];
  }

  onTasksCheckboxSelection() {
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

  loadTableData(activeIndex: number): void {
    this.tableData = this.taskList.filter((task) => task.status === this.statusMappingObject[activeIndex])
  }

  onFormSubmit() {
    if (this.taskForm.invalid) {
      return;
    }
    this.taskForm.value();
  }

  changeTaskStatus() {
    this.selectedTasks.forEach(task => task.status = this.selectedTaskStatus);
    this.loadTableData(this.selectedTabIndex);
    const key: string = this.getKeyByValue(this.selectedTaskStatus);
    this.taskTabDetails[+key].totalCount = this.countOfTaskBasedOnStatus(this.selectedTaskStatus);
    this.isMoveTaskDialogVisible = false;
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
}
