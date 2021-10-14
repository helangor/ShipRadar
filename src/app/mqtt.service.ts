import { Injectable } from '@angular/core';
import { Paho } from 'ng2-mqtt/mqttws31';
import { ShipService } from './ship.service';

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client: any;
  public connectionStatus: boolean = false;
  private connectionProperties: any = {
    onSuccess: this.onConnect.bind(this),
    mqttVersion: 4,
    useSSL: true,
    userName: "digitraffic",
    password: "digitrafficPassword"
  };

  constructor(private shipService: ShipService) { }


  connect() {
    this.client = new Paho.MQTT.Client("meri.digitraffic.fi", 61619, "ShipRadar");
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    this.client.connect(this.connectionProperties);
  }

  onConnect() {
    this.connectionStatus = true;
    console.log('Websocket Connected');
  }

  subscribe(topic: string) {
    this.client.subscribe(topic);
  }

  unsubscribe(topic:string) {
    this.client.unsubscribe(topic);
  }

  onConnectionLost(responseObject: any) {
    this.connectionStatus = false;
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  }

  onMessageArrived(message: any) {
    console.log("MessageArrived ", message);
    let ship = JSON.parse(message.payloadString);
    return ship;
  }
}
