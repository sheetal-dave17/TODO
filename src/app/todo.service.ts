import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Todo} from './interfaces/todo';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  constructor(private http: HttpClient) {}

  getAllTodos(page: number = 1): Observable<{total: number, todos: Todo[]}> {
    return this.http.get<{total: number, todos: Todo[]}>(`${environment.APIURL}/getTodos?page${page}`);
  }

  addTodo(todo): Observable<Todo> {
    return this.http.post<{status: string, message: string, todo: Todo}>(`${environment.APIURL}/addTodo`, todo)
      .pipe(map(data => {
        return data.todo;
      }));
  }

  updateTodo(todo, id): Observable<Todo> {
    return this.http.put<{status: string, message: string, todo: Todo}>(`${environment.APIURL}/updateTodo/${id}`, todo)
      .pipe(map(data => {
        return data.todo;
      }));
  }

  deleteTodo(id): Observable<{status: string, message: string}> {
    return this.http.delete<{status: string, message: string}>(`${environment.APIURL}/deleteTodo/${id}`);
  }

}
