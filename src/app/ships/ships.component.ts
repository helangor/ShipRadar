import { Component, OnInit } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ShipService } from '../ship.service';

@Component({
  selector: 'app-ships',
  templateUrl: './ships.component.html',
  styleUrls: ['./ships.component.scss']
})
export class ShipsComponent implements OnInit {
  timeInterval: Subscription | undefined;
  ships: any[] = [];
  connectedShips: string[] = [];
  connectionStatus: boolean = false;

  private client = new Paho.MQTT.Client("meri.digitraffic.fi", 61619, "ShipRadar");
  private connectionProperties: any = {
    onSuccess: this.onConnect.bind(this),
    mqttVersion: 4,
    useSSL: true,
    userName: "digitraffic",
    password: "digitrafficPassword"
  };

  constructor(private shipService: ShipService) { }

  ngOnInit() {
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    this.client.connect(this.connectionProperties);
    this.startPollingShips();
  }

  ngOnDestroy() {
    this.client?.disconnect();
  }

  startPollingShips() {
    this.timeInterval = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.shipService.getShips())
      ).subscribe((res: any) => {
        this.ships = this.shipService.filterShipsComingTowardsMustola(res.features);
        this.ships ? this.handleTopicSubscription() : null;
      },
        err => console.log(err));
  }

  onConnect() {
    this.connectionStatus = true;
    console.log('Websocket Connected');
  }

  handleTopicSubscription() {
    console.log("connectionStatus", this.connectionStatus)
    if (this.ships.length == 0 || !this.connectionStatus) {
      return;
    }
    this.ships.forEach((ship: any) => {
      if (this.connectedShips.includes(ship.mmsi)) {
        return;
      }

      console.log('Subscribe: ', ship.mmsi);
      this.client.subscribe('vessels/' + ship.mmsi + '/locations', {});
      this.connectedShips.push(ship.mmsi);
    });

    this.connectedShips.forEach((mmsi: string) => {
      let shipIndex = this.ships.findIndex((ship: any) => ship.mmsi === mmsi)
      if (shipIndex === -1) {
        console.log('Unsubscribed: ', mmsi);
        this.client.unsubscribe('vessels/' + mmsi + '/locations',{});
        this.connectedShips.splice(this.connectedShips.indexOf(mmsi), 1);
      }
    })
  }

  onConnectionLost(responseObject: any) {
    this.connectionStatus = false;
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  }

  onMessageArrived(message: any) {
    let ship = JSON.parse(message.payloadString);
    ship.distance = this.shipService.getDistance(ship.geometry.coordinates);
    let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
    this.ships[index] = ship;
  }
}

