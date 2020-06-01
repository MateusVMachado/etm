import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';

@Injectable()
export class StateService {

  protected layouts: any = [
    {
      name: 'One Column',
      icon: 'nb-layout-default',
      id: 'one-column',
      selected: true,
    },
  ];

  protected sidebars: any = [
    {
      name: 'Left Sidebar',
      icon: 'nb-layout-sidebar-left',
      id: 'left',
      selected: true,
    }
  ];

  protected layoutState$ = new BehaviorSubject(this.layouts[0]);
  protected sidebarState$ = new BehaviorSubject(this.sidebars[0]);

  onLayoutState(): Observable<any> {
    return this.layoutState$.asObservable();
  }

  onSidebarState(): Observable<any> {
    return this.sidebarState$.asObservable();
  }
}
