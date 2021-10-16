import { Component, OnInit } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { Ship } from '../models/ship';
import { ShipService } from '../ship.service';

@Component({
  selector: 'app-ships',
  templateUrl: './ships.component.html',
  styleUrls: ['./ships.component.scss']
})
export class ShipsComponent implements OnInit {
  timeInterval: Subscription | undefined;
  ships: Ship[] = [];
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
        let shipsFromApi = this.shipService.filterShipsComingTowardsMustola(res.features);
        this.ships = this.ships.length === 0 ? shipsFromApi : this.ships;
        console.log("This.ships ", this.ships);
        this.ships ? this.handleTopicSubscription(shipsFromApi) : null;
      },
        err => console.log(err));
  }

  onConnect() {
    this.connectionStatus = true;
    console.log('Websocket Connected');
  }

  handleTopicSubscription(shipsFromApi: any[]) {
    if (shipsFromApi.length == 0 || !this.connectionStatus) {
      return;
    }
    shipsFromApi.forEach((ship: any) => {
      if (this.connectedShips.includes(ship.mmsi)) {
        return;
      }
      this.subscribeShip(ship);
    });

    this.connectedShips.forEach((mmsi: string) => {
      let shipIndex = shipsFromApi.findIndex((ship: any) => ship.mmsi === mmsi)
      if (shipIndex === -1) {
        this.unsubscribeShip(mmsi);
      }
    })
  }
  unsubscribeShip(mmsi: string) {
    console.log('Unsubscribed: ', mmsi);
    this.client.unsubscribe('vessels/' + mmsi + '/locations',{});
    this.connectedShips.splice(this.connectedShips.indexOf(mmsi), 1);
  }

  subscribeShip(ship: any) {
    if (!ship.metadata) {
      this.addShipMetadata(ship);
    }
    console.log('Subscribe: ', ship.mmsi);
    this.client.subscribe('vessels/' + ship.mmsi + '/locations', {});
    this.connectedShips.push(ship.mmsi);
  }

  onConnectionLost(responseObject: any) {
    this.connectionStatus = false;
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  }

  onMessageArrived(message: any) {
    let ship = JSON.parse(message.payloadString);
    console.log("UPDATE ", ship); 
    ship.distance = this.shipService.getDistance(ship.geometry.coordinates);
    let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
    this.ships[index] = ship;
  }

  addShipMetadata(ship: any) {
    this.shipService.getShipExtraDetails(ship.mmsi).subscribe(metadata => {
      let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
      console.log("METADATA Added ", metadata);
      this.ships[index].metadata = metadata;
    })
  }
}

