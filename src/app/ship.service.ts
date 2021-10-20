import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  items: Observable<any[]> | undefined;
  
  private center = [60.919615, 28.459493];
  private radius = 20; //default 20
  private time = new Date(Date.now() - 20000).toISOString();

  constructor(private http: HttpClient, private firestore: AngularFirestore) { 
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

}
