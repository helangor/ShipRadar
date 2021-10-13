import { Component, OnInit } from '@angular/core';
import { ShipService } from '../ship.service';

@Component({
  selector: 'app-ship-detail',
  templateUrl: './ship-detail.component.html',
  styleUrls: ['./ship-detail.component.scss']
})

export class ShipDetailComponent implements OnInit {
  ships: any[] = [];
  nearestShip: any = {};

  constructor(private shipService: ShipService) { }

  ngOnInit() {
    this.getShips();
  }

  getShips() {
    this.shipService.getShips().subscribe((shipDetails: any) => {
      this.ships = this.shipService.filterShipsComingTowardsMustola(shipDetails.features);
    })
  }
}
