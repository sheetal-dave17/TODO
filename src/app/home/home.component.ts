import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../auth/authentication.service';
import { UserService } from '../user.service';
import { TodoService } from '../todo.service';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { User } from '../interfaces/user';
import { AlertService } from '../alert.service';
import {Todo} from '../interfaces/todo';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, OnDestroy {
  loading = false;
  todoForm: FormGroup;
  submitted = false;
  currentUser: User;
  currentUserSubscription: Subscription;
  user: User;
  todos: Todo[];
  total = 0;
  currentTodo;
  isEdit = false;
  config;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private todoService: TodoService,
    private alertService: AlertService
  ) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.total
    };
  }

  ngOnInit(): void {
    this.todoForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', []]
    });
    this.loading = true;
    this.getAllTodos(this.config.currentPage);
    this.userService.getUserData(this.currentUser.email)
      .pipe(first())
      .subscribe(
        (user) => {
          this.loading = false;
          this.user = user;
          this.alertService.clear();
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

  // convenience getter for easy access to form fields
  get f(): any { return this.todoForm.controls; }

  getAllTodos(page: number): any {
    this.todoService.getAllTodos(page)
      .pipe(first())
      .subscribe(
        (response) => {
          this.loading = false;
          this.todos = response.todos;
          this.total = response.total;
          this.config.totalItems = this.total;
          this.alertService.clear();
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

  pageChanged(event): void {
    this.config.currentPage = event;
  }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.todoForm.invalid) {
      return;
    }

    this.loading = true;
    const todo = {title: this.f.title.value, description: this.f.description.value};
    if (this.isEdit) {
      this.todoService.updateTodo(todo, this.currentTodo)
        .pipe(first())
        .subscribe( () => {
            this.getAllTodos(this.config.currentPage);
            this.alertService.clear();
            this.todoForm.reset();
            this.submitted = false;
            this.isEdit = false;
            this.loading = false;
          },
          error => {
            this.alertService.error(error);
            this.loading = false;
          });
    } else {
      this.todoService.addTodo(todo)
        .pipe(first())
        .subscribe(
          newTodo => {
            this.getAllTodos(this.config.currentPage);
            this.alertService.clear();
            this.loading = false;
            this.todoForm.reset();
            this.submitted = false;
          },
          error => {
            this.alertService.error(error);
            this.loading = false;
          });
    }
  }

  editTodo(item): void {
    this.todoForm.get('title').setValue(item.title);
    this.todoForm.get('description').setValue(item.description);
    this.isEdit = true;
    this.currentTodo = item.id;
  }

  deleteTodo(item): void {
    this.todoService.deleteTodo(item.id)
      .subscribe(
        (res) => {
          this.alertService.success(res.message);
          this.getAllTodos(this.config.currentPage);
          this.loading = false;
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

  displayDescription(todo): void {
    todo.displayDescription = !todo.displayDescription;
  }

  ngOnDestroy(): void {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

}
