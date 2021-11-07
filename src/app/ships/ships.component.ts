import { Component, OnInit, Sanitizer } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ChangeLockService } from '../change-lock.service';
import { CodeDescriptions } from '../models/codes';
import { Ship } from '../models/ship';
import { ShipService } from '../ship.service';

@Component({
  selector: 'app-ships',
  templateUrl: './ships.component.html',
  styleUrls: ['./ships.component.scss']
})

export class ShipsComponent implements OnInit {
  constructor(private shipService: ShipService, private changeLockService: ChangeLockService) { }

  timeInterval: Subscription | undefined;
  ships: Ship[] = [];
  selectedShip?: Ship;
  connectedShips: number[] = [];
  connectionStatus: boolean = false;

  descCodes: CodeDescriptions = {
    agentTypes: [],
    cargoTypes: [],
    vesselTypes: []
  };

  client = new Paho.MQTT.Client("meri.digitraffic.fi", 61619, "ShipRadar");
  private connectionProperties: any = {
    onSuccess: this.onConnect.bind(this),
    mqttVersion: 4,
    useSSL: true,
    userName: "digitraffic",
    password: "digitrafficPassword"
  };

  ngOnInit() {
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    this.client.connect(this.connectionProperties);
    this.shipService.getCodeDescriptions().subscribe((res: CodeDescriptions) => this.descCodes = res, e => console.log(e));
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
        let shipsFromApi = this.filterShipsComingTowardsMustola(res.features);
        this.updateShownShips(shipsFromApi);
        this.ships ? this.handleTopicSubscription() : null;
        this.selectedShip = this.selectedShip ? this.selectedShip : this.ships[0];
      },
        err => console.log(err));
  }
  updateShownShips(shipsFromApi: any[]) {
    if (this.ships.length === 0) {
      this.ships = shipsFromApi;
    } else {
      let shipsToBeAdded = shipsFromApi.filter(x => !this.ships.some(s => s.mmsi === x.mmsi));
      shipsToBeAdded.forEach(s => this.ships.push(s));

      this.ships = this.ships.filter(x => shipsFromApi.some(s => s.mmsi === x.mmsi));
      this.ships = this.ships.sort(s => s.distance);
    }
    this.ships.map(ship => ship.metadata ? ship : this.addShipMetadata(ship))
  }

  onConnect() {
    this.connectionStatus = true;
    console.log('Websocket Connected');
  }

  handleTopicSubscription() {
    if (this.ships.length == 0 || !this.connectionStatus) {
      return;
    }
    this.ships.forEach((ship: any) => {
      if (this.connectedShips.includes(ship.mmsi)) {
        return;
      }
      this.subscribeShip(ship);
    });

    this.connectedShips.forEach((mmsi: number) => {
      let shipIndex = this.ships.findIndex((ship: any) => ship.mmsi === mmsi)
      if (shipIndex === -1) {
        this.unsubscribeShip(mmsi);
      }
    })
  }

  unsubscribeShip(mmsi: number) {
    console.log('Unsubscribed: ', mmsi);
    this.client.unsubscribe('vessels/' + mmsi + '/locations', {});
    this.connectedShips.splice(this.connectedShips.indexOf(mmsi), 1);
    this.selectedShip = this.ships[0];
  }

  subscribeShip(ship: any) {
    console.log('Subscribe: ', ship);
    this.client.subscribe('vessels/' + ship.mmsi + '/locations', {});
    this.connectedShips.push(ship.mmsi);
  }

  onConnectionLost(responseObject: any) {
    this.connectionStatus = false;
    console.log('onConnectionLost:', responseObject);
    window.location.reload();
 }

  onMessageArrived(message: any) {
    let ship = JSON.parse(message.payloadString);
    let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
    let foundShip = this.ships[index]
    if (ship.geometry) {
      foundShip.geometry = ship.geometry;
    }
    if (ship.properties.sog) {
      foundShip.properties.sog = ship.properties.sog;
    }

  }

  addShipMetadata(ship: Ship) {
    this.shipService.getShipExtraDetails(ship.mmsi).subscribe(metadata => {
      let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
      if (index != -1) {
        let foundShip = this.ships[index];
        foundShip.metadata = metadata;
        foundShip.metadata.shipTypeDescriptionFi = this.getShipTypeDescription(metadata.shipType);
        this.addShipDataFromFirebase(ship, foundShip);
      }
    })
  }

  addShipDataFromFirebase(ship: Ship, foundShip: Ship) {
    this.shipService.getShipDataFromFirebase(ship.mmsi).subscribe(s => s.forEach((p: any) => {
      foundShip.metadata.flag = p.flag;
      foundShip.metadata.length = p.length;
      foundShip.metadata.width = p.width;
      foundShip.metadata.image = p.image;
    }));
  }

  getShipTypeDescription(shipCode: number): string {
    let description = this.descCodes.vesselTypes.find(v => v.code === shipCode.toString());
    if (description) {
      return description.descriptionFi;
    } else {
      return "Unknown";
    }
  }

  changeSelectedShip(ship: any) {
    this.selectedShip = ship;
  }

  filterShipsComingTowardsMustola(shipData: any) {
    let movingShips = shipData.filter((s: any) => s.properties.navStat !== 5 && s.properties.mmsi !== 1);
    if (movingShips.length == 0) {
      return [];
    }


    // USE IF WANT TO FILTER SHIPS ONLY COMING TOWARS THE LOCK
    // let easternShips: any[] = [];
    // let westernShips: any[] = [];

    // movingShips.forEach((s: any) => {
    //   s.geometry.coordinates[1] <= this.changeLockService.selectedLock.coordinates[0] ? easternShips.push(s) : westernShips.push(s);
    // });

    // sometimes heading 511 meaning it is unkown. So includes also ships unknown heading
    // easternShips = easternShips.filter(s => (s.properties.heading > 230 || s.properties.heading < 30) || s.properties.heading > 360);
    // westernShips = westernShips.filter(s => (s.properties.heading < 230 && s.properties.heading > 30) || s.properties.heading > 360);

    // let shipsComingTowards: any[] = easternShips.concat(westernShips);
    movingShips.forEach((s: any) => s.distance = this.shipService.getDistance(s.geometry.coordinates))
    movingShips.sort((a: any, b: any) => { return a.distance - b.distance; });
    return movingShips;
  }
}