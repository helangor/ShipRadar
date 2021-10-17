import { Component, OnInit, Sanitizer } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { CodeDescriptions } from '../models/codes';
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

  constructor(private shipService: ShipService) { }

  ngOnInit() {
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    this.client.connect(this.connectionProperties);
    this.shipService.getCodeDescriptions().subscribe((res: CodeDescriptions) => this.descCodes = res,  e => console.log(e));
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
        this.updateShips(shipsFromApi);
        this.ships ? this.handleTopicSubscription() : null;
        this.selectedShip = this.selectedShip ? this.selectedShip : this.ships[0];
      },
        err => console.log(err));
  }
  updateShips(shipsFromApi: any[]) {
    if (this.ships.length === 0) {
      this.ships = shipsFromApi;
    } else {
      //Lisätään laiva, jos löytyy shipsFromApi, mutta ei löydy this.ships
      let shipsToBeAdded = shipsFromApi.filter(x => !this.ships.some(s => s.mmsi === x.mmsi));
      shipsToBeAdded.forEach(s => this.ships.push(s));

      // Poistetaan laiva, jos löytyy this.ships, mutta ei löydy shipsFromApi
      this.ships =  this.ships.filter(x => shipsFromApi.some(s => s.mmsi === x.mmsi));
      this.ships = this.ships.sort(s => s.distance);
      console.log("SHIPS ", this.ships);
    }
    this.ships.map(ship => ship.metadata ? ship : this.addShipMetadata(ship) )
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
    this.client.unsubscribe('vessels/' + mmsi + '/locations',{});
    this.connectedShips.splice(this.connectedShips.indexOf(mmsi), 1);
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
    ship.distance = this.shipService.getDistance(ship.geometry.coordinates);
    let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
    this.ships[index].geometry = ship.geometry;
    this.ships[index].distance = ship.distance;
    this.ships[index].properties.sog = ship.properties.sog;
    this.ships[index].metadata.eta = getShipEta(ship.distance, ship.properties.sog);
  }

  addShipMetadata(ship: Ship) {
    this.shipService.getShipExtraDetails(ship.mmsi).subscribe(metadata => {
      let index = this.ships.findIndex(o => o.mmsi === ship.mmsi);
      if (index != -1) {
        let foundShip = this.ships[index];
        foundShip.metadata = metadata;
        foundShip.geometry.googleCoords = new google.maps.LatLng(foundShip.geometry.coordinates[1], foundShip.geometry.coordinates[0]);
        foundShip.markerOptions = { draggable: false, label: foundShip.metadata.name, icon: {url: "assets/icons/ship.png", scaledSize: new google.maps.Size(50, 50), labelOrigin: new google.maps.Point(20,0)}};
        foundShip.metadata.shipTypeDescriptionFi = this.getShipTypeDescription(metadata.shipType);
        this.shipService.getShipDataFromFirebase(ship.mmsi).subscribe(s => s.forEach((p: any) => {
          foundShip.metadata.flag = p.flag;
          foundShip.metadata.length = p.length;
          foundShip.metadata.width = p.width;
          foundShip.metadata.image = p.image;
        }));

      }
    })
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
}

function getShipEta(distance: number, sog: number): number {
  let speedInKmh = sog*1.852;
  let eta = distance / speedInKmh;
  eta = eta > 400 ? 0 : eta;
  return eta;
}

