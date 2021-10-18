import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ship } from '../models/ship';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  @Input() ships: Ship[] = [];
  @Output() shipClicked = new EventEmitter<any>();

  center: google.maps.LatLngLiteral = { lat: 61.061435, lng: 28.320379 };
  zoom = 11;
  timeInterval: any;
  mapHeight = "400px";
  mapWidth = "400px";

  constructor(httpClient: HttpClient) {
  }

  
  ngOnInit() {

  }

  click(event: any, ship: Ship)
  {
    this.center = { lat: ship.geometry.coordinates[1], lng: ship.geometry.coordinates[0] };
    this.shipClicked.emit(ship);
  }
}
