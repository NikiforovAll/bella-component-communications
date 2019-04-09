import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DiagramComponent } from '../models/storage-models/diagram-component';

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

    // TODO: consider deep copy to prevent source data mutation.
    const serviceComparer = (s1, s2) => {
      const n1 = s1.name;
      const n2 = s2.name;
      if (n1 > n2) { return 1; }
      if (n1 < n2) { return -1; }
      return 0;
    };
    component.services = component.services.sort(serviceComparer);
    component.consumes = component.consumes.sort(serviceComparer);
    this.selectedComponent$.next(component);
  }
}
