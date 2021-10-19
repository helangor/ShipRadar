import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ship } from '../models/ship';

@Component({
  selector: 'app-ship-detail',
  templateUrl: './ship-detail.component.html',
  styleUrls: ['./ship-detail.component.scss']
})

export class ShipDetailComponent implements OnInit {
  @Input() ship: Ship | undefined;
  @Input() ships: Ship[] = [];
  @Output() shipChanged = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  changeShip() {
    let index = this.ships.findIndex(s => s.mmsi === this.ship?.mmsi);
    index = index > this.ships.length -2 ? 0 : index;
    this.ship = this.ships[index+1];
    this.shipChanged.emit(this.ship);
  }
}