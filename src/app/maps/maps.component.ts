import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ship } from '../models/ship';
import { ChangeLockService } from '../change-lock.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  @Input() ships: Ship[] = [];
  @Input() ship: any;
  @Output() shipClicked = new EventEmitter<any>();

  center: any = [61.061435,28.320379];
  zoom = 11;
  timeInterval: any;
  mapHeight = "400px";
  mapWidth = "400px";

  constructor(httpClient: HttpClient, public changeLockService: ChangeLockService) {
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
      this.center = this.getGoogleCoords(this.ship.geometry.coordinates);
  }

  getGoogleCoords(coordinates: number[]) {
    return new google.maps.LatLng(coordinates[1], coordinates[0]);
  }
}
