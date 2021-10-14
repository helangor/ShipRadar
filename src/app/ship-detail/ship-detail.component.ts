import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ShipService } from '../ship.service';
import { startWith, switchMap } from 'rxjs/operators';
import { Paho } from 'ng2-mqtt/mqttws31';

@Component({
  selector: 'app-ship-detail',
  templateUrl: './ship-detail.component.html',
  styleUrls: ['./ship-detail.component.scss']
})

export class ShipDetailComponent implements OnInit {
  timeInterval: Subscription | undefined;
  ships: any[] = [];
  nearestShip: any = {};
  connectionStatus: boolean = false;

  private subscribedMmsi: string = "";
  private client: any;
  private connectionProperties: any = {
    onSuccess: this.onConnect.bind(this),
    mqttVersion: 4,
    useSSL: true,
    userName: "digitraffic",
    password: "digitrafficPassword"
  };

  constructor(private shipService: ShipService) { }

  ngOnInit() {
    this.client = new Paho.MQTT.Client("meri.digitraffic.fi", 61619, "ShipRadar");
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    this.client.connect(this.connectionProperties);
    this.startPollingShips();
  }

  startPollingShips() {
    this.timeInterval = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.shipService.getShips())
      ).subscribe((res: any) => {
        this.ships = this.shipService.filterShipsComingTowardsMustola(res.features);
        this.nearestShip = this.ships.length > 0 ? this.ships[0] : null
        this.nearestShip ? this.subscribe(this.nearestShip.mmsi) : null;
      },
        err => console.log(err));
  }

  onConnect() {
    this.connectionStatus = true;
    console.log('Websocket Connected');
  }

  subscribe(mmsi: string) {
    if (!this.connectionStatus || mmsi == this.subscribedMmsi) {
      return;
    }

    if (this.subscribedMmsi) {
      console.log("Unsubscribe ", this.subscribedMmsi)
      this.client.unsubscribe('vessels/' + this.subscribedMmsi + '/locations');
    }
    this.subscribedMmsi = mmsi;
    console.log('Subscribe', mmsi);
    this.client.subscribe('vessels/' + mmsi + '/locations');

  }

  onConnectionLost(responseObject: any) {
    this.connectionStatus = false;
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  }

  onMessageArrived(message: any) {
    console.log('onMessageArrived: ' + message.payloadString);
  }

}

