import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ship } from '../models/ship';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  @Input() ships: Ship[] = [];
  @Input() ship: any;
  @Output() shipClicked = new EventEmitter<any>();

  center: google.maps.LatLngLiteral = { lat: 61.061435, lng: 28.320379 };
  zoom = 11;
  timeInterval: any;
  mapHeight = "400px";
  mapWidth = "400px";

  constructor(httpClient: HttpClient) {
  }


  ngOnInit() {
    this.centerMapToShip();
  }

  ngOnChanges(changes: SimpleChange) {
    this.centerMapToShip();
  }

  click(event: any, ship: Ship)
  {
    this.ship = ship;
    this.shipClicked.emit(this.ship);
  }

  centerMapToShip() {
    if (this.ship?.geometry.googleCoords) {
      this.center = this.ship?.geometry.googleCoords;
    }
  }
}
