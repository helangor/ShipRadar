import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ship } from '../models/ship';
import { ChangeLockService } from '../change-lock.service';
import { ShipService } from '../ship.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  @Input() ships: Ship[] = [];
  @Input() ship: any;
  @Output() shipClicked = new EventEmitter<any>();



  mapHeigth = "74vh";
  mapWidth = "60vw";
  center: any = [61.061435,28.320379];
  zoom = 11;
  timeInterval: any;
  windowWidth: any;

  // Kludge to enable nice looking map sizing
  @HostListener('window:resize', ['$event'])
  resizeMap() {
    if (window.innerWidth < 950) {
      this.mapWidth = "90vw";
    } else {
      this.mapWidth = "60vw";
    }
  }

  constructor(httpClient: HttpClient, public changeLockService: ChangeLockService, public shipService: ShipService) {
  }


  ngOnInit() {
    this.centerMapToShip();
    this.resizeMap();
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
      if (this.ship) {
        this.center = this.getGoogleCoords(this.ship.geometry.coordinates);
      }
  }

  getGoogleCoords(coordinates: number[]) {
    return new google.maps.LatLng(coordinates[1], coordinates[0]);
  }
}
