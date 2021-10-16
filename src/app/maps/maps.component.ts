import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ship } from '../models/ship';
import { interval } from 'rxjs';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  @Input() ships: Ship[] = [];
  center: google.maps.LatLngLiteral = { lat: 61.061435, lng: 28.320379 };
  zoom = 12;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  timeInterval: any;

  constructor(httpClient: HttpClient) {
  }

  ngOnInit() {
    this.timeInterval = interval(5000)
      .pipe().subscribe((res: any) => {
        console.log("Maps ships ", this.ships);
      },
        err => console.log(err));
  }
}
