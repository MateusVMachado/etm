import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JWTtoken } from '../../storage';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DashboardComponent {
    public token: string = JWTtoken.token;
}
