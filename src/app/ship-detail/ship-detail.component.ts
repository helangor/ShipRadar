import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ship-detail',
  templateUrl: './ship-detail.component.html',
  styleUrls: ['./ship-detail.component.scss']
})

export class ShipDetailComponent implements OnInit {

  @Input() ship: any;
  constructor() { }

  ngOnInit() {
  }
}

// Näkyviin, nopeus, aika, kuva, paino, pituus 