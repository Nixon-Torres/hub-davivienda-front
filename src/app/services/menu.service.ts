import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
    public listenAction: Subject<any>;
    public $listenActions: Observable<any>;

  constructor() {
      this.listenAction = new Subject();
      this.$listenActions = this.listenAction.asObservable();
  }

  emit(action) {
      this.listenAction.next({action});
  }
}
