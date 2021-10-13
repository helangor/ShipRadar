import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ShipService } from '../ship.service';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-ship-detail',
  templateUrl: './ship-detail.component.html',
  styleUrls: ['./ship-detail.component.scss']
})

export class ShipDetailComponent implements OnInit {
  timeInterval: Subscription | undefined;
  ships: any[] = [];
  nearestShip: any = {};

  constructor(private shipService: ShipService) { }

  ngOnInit() {
    this.startPollingShips();
  }

  startPollingShips() {
    this.timeInterval = interval(2000)
      .pipe(
        startWith(0),
        switchMap(() => this.shipService.getShips())
      ).subscribe((res: any) => {
        this.ships = this.shipService.filterShipsComingTowardsMustola(res.features);
        this.nearestShip = this.ships.length > 0 ? this.ships[0] : null
      },
        err => console.log(err));
  }
}

