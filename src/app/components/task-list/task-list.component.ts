import {Component, OnInit} from '@angular/core';
import {Task} from "../../interfaces/task.interface";
import TaskList from "../../../assets/task-list.json";
import {TaskPriorityEnum, TaskStatusEnum} from "../../enums/task-status.enum";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../services/user.service";
import {User} from "../../interfaces/user.interface";
import {UserRoleEnum} from "../../enums/user.enum";
import {ConfirmationService, MessageService} from "primeng/api";

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

  constructor(private readonly fb: FormBuilder,
              private userService: UserService,
              private readonly confirmationService: ConfirmationService,
              private readonly messageService: MessageService) {
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

  public loadTableData(activeIndex: number): void {
    this.tableData = this.taskList.filter((task) => task.status === this.statusMappingObject[activeIndex]);
  }

  public onFormSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }
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
    this.messageService.add({
      severity: 'success',
      summary: 'Task created successfully'
    })
  }

  public tabChange(): void {
    this.selectedTasks = [];
    this.loadTableData(this.selectedTabIndex);
    this.tableHeaderActionArr = this.tableHeaderActionArr.map(item => {
      if (item.name !== 'add_task') {
        item.disabled = true
      }
      return item
    })
  }

  public getSeverity(status: string): any {
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

  public getPriorityClass(status: string) {
    switch (status) {
      case TaskPriorityEnum.HIGH:
        return 'badge-danger';
      case TaskPriorityEnum.MEDIUM:
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  public changeTaskStatus(): void {
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
    this.messageService.add({
      severity: 'success',
      summary: 'Task status changed successfully'
    })
  }

  public onTaskRowClick(task: Task): void {
    this.isTaskViewDialogVisible = true;
    this.taskDetails = task;
  }

  public onTaskFormClose(): void {
    this.taskForm.reset();
    this.isAddTaskDialogVisible = false;
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

  public onTaskDialogClose(): void {
    this.isMoveTaskDialogVisible = false;
  }

  public onCheckBoxSelection(): void {
    this.tableHeaderActionArr = this.selectedTasks.length ? this.tableHeaderActionArr.map(item => {
      this.disableOrEnableAction(item, true)
      return item;
    }) : this.tableHeaderActionArr.map(item => {
      this.disableOrEnableAction(item, false)
      return item;
    })
  }

  public checkToDisplayCheckboxColumn(): boolean {
    return (this.currentUser.role === UserRoleEnum.DEVELOPER && this.selectedTabIndex === 1) ||
      (this.currentUser.role === UserRoleEnum.ADMIN && (!this.selectedTabIndex || this.selectedTabIndex === 2));
  }

  private countOfTaskBasedOnStatus(status: string): number {
    return this.taskList.filter((task) => task.status === status).length
  }

  private getKeyByValue(value: string): string {
    return Object.keys(this.statusMappingObject).find((key: any) => this.statusMappingObject[key] === value) ?? '';
  }

  private initialiseTableAction(): void {
    if (this.currentUser.role === UserRoleEnum.MANAGER) {
      this.tableHeaderActionArr.push({
        name: 'add_task',
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
          this.userList = this.userService.getUserList().map((user: User) => this.userService.getFullName(user));
          // If we want only developer can responsible person then we can do that by using below commented code line
          // this.userList = this.userService.getUserList().filter((user: User) => user.role === UserRoleEnum.DEVELOPER).map((user: User) => this.userService.getFullName(user));
        },
      })
    }
    if (this.currentUser.role === UserRoleEnum.ADMIN) {
      this.tableHeaderActionArr.push({
        name: 'delete_task',
        tooltipOptions: {
          tooltipLabel: 'Delete task',
          tooltipPosition: 'bottom',
        },
        icon: 'pi pi-trash',
        disabled: true,
        command: () => {
          this.openDeleteConfirmation()
        },
      })
    }
    if (this.currentUser.role === UserRoleEnum.ADMIN || this.currentUser.role === UserRoleEnum.DEVELOPER) {
      this.tableHeaderActionArr.push({
        name: 'move_task',
        tooltipOptions: {
          tooltipLabel: 'Move task',
          tooltipPosition: 'bottom',
        },
        icon: 'pi pi-reply',
        disabled: true,
        command: () => {
          this.isMoveTaskDialogVisible = true;
          if (this.currentUser.role === UserRoleEnum.ADMIN) {
            this.taskStatusArr = [TaskStatusEnum.TODO, TaskStatusEnum.REJECTED];
          }
        },
      })
    }
  }

  private openDeleteConfirmation(): void {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      accept: () => {
        if (this.selectedTasks.length) {
          this.taskList = this.taskList.filter(obj => !this.selectedTasks.some(obj2 => obj.title === obj2.title));
          this.taskTabDetails[2].totalCount = this.countOfTaskBasedOnStatus(TaskStatusEnum.DONE)
          this.loadTableData(this.selectedTabIndex);
        }
        this.messageService.add({severity: 'success', summary: 'Confirmed', detail: 'Record deleted'});
      },
      reject: () => {
        this.messageService.add({severity: 'error', summary: 'Rejected', detail: 'You have rejected'});
      }
    });
  }

  private disableOrEnableAction(item: any, flag: boolean): void {
    if (item.name === 'move_task' && [0, 1].includes(this.selectedTabIndex)) {
      item.disabled = flag;
    }
    if (item.name === 'delete_task' && this.selectedTabIndex === 2) {
      item.disabled = flag;
    }
  }
}
