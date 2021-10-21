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

  private client = new Paho.MQTT.Client("meri.digitraffic.fi", 61619, "ShipRadar");
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
    ship.distance = this.getDistance(ship.geometry.coordinates, this.changeLockService.selectedLock?.coordinates);
    let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
    let foundShip = this.ships[index]
    foundShip.geometry = ship.geometry;
    foundShip.distance = ship.distance;
    foundShip.properties.sog = ship.properties.sog;
    foundShip.metadata.etaInUi = this.getShipEta(ship.distance, ship.properties.sog);
  }

  addShipMetadata(ship: Ship) {
    this.shipService.getShipExtraDetails(ship.mmsi).subscribe(metadata => {
      let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
      if (index != -1) {
        let foundShip = this.ships[index];
        foundShip.metadata = metadata;
        foundShip.markerOptions = { draggable: false, label: foundShip.metadata.name, icon: { url: "assets/icons/ship.png", scaledSize: new google.maps.Size(50, 50), labelOrigin: new google.maps.Point(20, 0) } };
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

  getDistance(shipCoordinates: number[], lockCoordinates: number[]) {
    var radlat1 = Math.PI * lockCoordinates[1] / 180
    var radlat2 = Math.PI * shipCoordinates[1] / 180
    var theta = lockCoordinates[0] - shipCoordinates[0]
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    { dist = dist * 1.609344 }
    return dist
  }

  filterShipsComingTowardsMustola(shipData: any) {
    let movingShips = shipData.filter((s: any) => s.properties.navStat !== 5 && s.properties.mmsi !== 1);
    if (movingShips.length == 0) {
      return [];
    }

    let easternShips: any[] = [];
    let westernShips: any[] = [];
    movingShips.forEach((s: any) => {
      s.geometry.coordinates[1] <= this.changeLockService.selectedLock.coordinates[0] ? easternShips.push(s) : westernShips.push(s);
    });
    easternShips = easternShips.filter(s => s.properties.cog > 270 || s.properties.cog < 45);
    westernShips = westernShips.filter(s => s.properties.cog < 190);

    let shipsComingTowards: any[] = easternShips.concat(westernShips);
    shipsComingTowards.forEach(s => s.distance = this.getDistance(s.geometry.coordinates, this.changeLockService.selectedLock.coordinates))
    shipsComingTowards.sort((a, b) => { return a.distance - b.distance; });
    return shipsComingTowards;
  }

  getShipEta(distance: number, sog: number): string {
    let speedInKmh = sog * 1.852;
    let eta = (distance / speedInKmh);
    let etaInUi = "";
    if (eta > 1) {
      etaInUi = eta > 8 ? "--" : "Yli " + Math.floor(eta) + " h"
    } else {
      etaInUi = Math.round(eta * 60).toString() + " min";
    }
    return etaInUi;
  }
}


// Joku Paho MQTT error tulee jos rämppää linkkiä, eikä laivoja kanavassa

// Kun vaihtaa sulkua niin laskee uudestaan etäisyydet ja ETAt
// Joku tietty markkeri mikä sulku valittuna

// Toolbar kun sm niin Laivatutka ja Info menee painikkeeseen. 

// ships.ts refactorointi 

// Hostaus
// laivojen markkerit laivan tyypin mukaan
