import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ship } from '../models/ship';

@Component({
  selector: 'app-ship-detail',
  templateUrl: './ship-detail.component.html',
  styleUrls: ['./ship-detail.component.scss']
})

export class ShipDetailComponent implements OnInit {
  @Input() ship: Ship | undefined;
  constructor() { }

  ngOnInit() {
  }
}

// Näkyviin, nopeus, aika, kuva, paino, pituus 