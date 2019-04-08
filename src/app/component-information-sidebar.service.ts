import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentInformationSidebarService {

  private emitter: BehaviorSubject<boolean>;
  state: boolean;
  constructor() { }

  public setEmitter(emitter: BehaviorSubject<boolean>) {
    this.emitter = emitter;
  }

  public openSidebar() {
    this.setSidebarState(true);
  }

  public setSidebarState(state: boolean) {
    this.state = state;
    this.emitter.next(state);
  }

}
