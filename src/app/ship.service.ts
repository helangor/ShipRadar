import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { ChangeLockService } from './change-lock.service';

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  items: Observable<any[]> | undefined;
  
  private center = [60.919615, 28.459493];
  private radius = 20; //default 20
  private time = new Date(Date.now() - 20000).toISOString();

  constructor(private http: HttpClient, private firestore: AngularFirestore, private changeLockService: ChangeLockService) { 
  }


  getShips(): Observable<any[]> {
    const url = "https://meri.digitraffic.fi/api/v1/locations/latitude/" +
      this.center[0] + "/longitude/" + this.center[1] + "/radius/"
      + this.radius + "/from/" + this.time;
    return this.http.get<any[]>(url);
  }

  getShipExtraDetails(mmsi: number) {
    const url = "https://meri.digitraffic.fi/api/v1/metadata/vessels/" + mmsi;
    return this.http.get<any>(url);
  }

  getShipDataFromFirebase(mmsi: number) { 
    return this.firestore.collection("ships", ref => ref.where('mmsi', '==', mmsi)).valueChanges();
  }

  getCodeDescriptions() {
    const url = "https://meri.digitraffic.fi/api/v2/metadata/code-descriptions"
    return this.http.get<any>(url);
  }

  getDistance(shipCoordinates: number[]) {
    var radlat1 = Math.PI * this.changeLockService.selectedLock?.coordinates[1] / 180
    var radlat2 = Math.PI * shipCoordinates[1] / 180
    var theta = this.changeLockService.selectedLock?.coordinates[0] - shipCoordinates[0]
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    { dist = dist * 1.609344 }
    return dist
  }


  getEta(shipCoordinates: number[], sog: number): string {
    let distance = this.getDistance(shipCoordinates);
    let speedInKmh = sog * 1.852;
    let eta = (distance / speedInKmh);
    let etaInUi = "";

    if (eta > 1) {
      etaInUi = eta > 8 ? "--" : "Yli " + Math.floor(eta) + " h"
    } else if (distance < 0.1) {
      etaInUi = "Kanavassa";
    } else {
      etaInUi = Math.round(eta * 60).toString() + " min";
    }
    return etaInUi;
  }

}
