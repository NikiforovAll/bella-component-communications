import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DiagramComponent } from './components/dumb/diagram/diagram.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentInformationSidebarService {

  public sidebarState$: BehaviorSubject<boolean>;
  public selectedComponent$: BehaviorSubject<DiagramComponent>;

  constructor() {
    this.sidebarState$ = new BehaviorSubject<boolean>(false);
    this.selectedComponent$ = new BehaviorSubject<DiagramComponent>(null);
  }

  public openSidebar() {
    this.setSidebarState(true);
  }

  public setSidebarState(state: boolean) {
    this.sidebarState$.next(state);
  }

  public setSidebarComponent(component: DiagramComponent) {
    this.selectedComponent$.next(component);
  }
}
