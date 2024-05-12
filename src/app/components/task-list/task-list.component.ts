import {Component, OnInit} from '@angular/core';
import {Task} from "../../interfaces/task.interface";
import TaskList from "../../../assets/task-list.json";
import {TaskPriorityEnum, TaskStatusEnum} from "../../enums/task-status.enum";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../services/user.service";
import {User} from "../../interfaces/user.interface";

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
    this.initialiseTabItem();
    this.initialiseTableAction();
    this.loadTableData(this.selectedTabIndex);
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
        command: () => {
          this.isAddTaskDialogVisible = true;
          this.userList = this.userService.getUserList().map((user: User) => this.userService.getFullName(user));
        },
      },
    ];
  }

  tabChange() {
    this.loadTableData(this.selectedTabIndex);
  }

  countOfTaskBasedOnStatus(status: string): number {
    return TaskList.filter((task) => task.status === status).length
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
    this.tableData = TaskList.filter((task) => task.status === this.statusMappingObject[activeIndex])
  }

  onClose() {
    this.taskForm.reset();
    this.isAddTaskDialogVisible = false;
  }

  onFormSubmit() {
    if (this.taskForm.invalid) {
      return;
    }
    this.taskForm.value();
  }
}
