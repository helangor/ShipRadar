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

  constructor(private service: ShipService) { }

  ngOnInit() {
    this.service.getShips();
    //this.nearestShip = this.ships[0];
    // // console.log("ships", this.ships);
  }

}
