import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeLockService } from './change-lock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public changeLockService: ChangeLockService) { }
  title = 'ship-radar';

}
