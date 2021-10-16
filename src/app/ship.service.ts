import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ship } from './models/ship';

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  private ships: Ship[] = [];
  private center = [60.919615, 28.459493];
  private MUSTOLA_COORDINATES = [61.061435, 28.320379];
  private radius = 35; //default 20
  private time = new Date(Date.now() - 20000).toISOString();
  //TODO: Lisää metadataa scrapeemalla muualta. Ainakin kuva.

  constructor(
    private http: HttpClient
  ) { }


  getShips(): Observable<any[]> {
    const url = "https://meri.digitraffic.fi/api/v1/locations/latitude/" +
      this.center[0] + "/longitude/" + this.center[1] + "/radius/"
      + this.radius + "/from/" + this.time;
    return this.http.get<any[]>(url);
  }

  getShipExtraDetails(mmsi: string) {
    const url = "https://meri.digitraffic.fi/api/v1/metadata/vessels/" + mmsi;
    console.log("URL ", url)
    return this.http.get<any>(url);
  }


  getDistance(coordinates: number[]) {
    var radlat1 = Math.PI * this.MUSTOLA_COORDINATES[0] / 180
    var radlat2 = Math.PI * coordinates[1] / 180
    var theta = this.MUSTOLA_COORDINATES[1] - coordinates[0]
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    { dist = dist * 1.609344 }
    return dist
  }

  filterShipsComingTowardsMustola(shipData: any) {
    // FOR TESTING PURPOSES
    let shipsComingTowards: any[] = shipData;
    shipsComingTowards.forEach(s => s.distance = this.getDistance(s.geometry.coordinates))
    shipsComingTowards.sort((a, b) => { return a.distance - b.distance; })


    /*let movingShips = shipData.filter((s: any) => s.properties.navStat !== 5 && s.properties.mmsi !== 1);
    if (movingShips.length == 0) {
      return [];
    }

    let easternShips: any[] = [];
    let westernShips: any[] = [];
    movingShips.forEach((s: any) => {
      s.geometry.coordinates[1] <= 61.0613 ? easternShips.push(s) : westernShips.push(s);
    });
    easternShips = easternShips.filter(s => s.properties.cog > 270 || s.properties.cog < 45);
    westernShips = westernShips.filter(s => s.properties.cog < 190);

    let shipsComingTowards: any[] = easternShips.concat(westernShips);
    shipsComingTowards.forEach(s => s.distance = this.getDistance(s.geometry.coordinates))
    shipsComingTowards.sort((a, b) => { return a.distance - b.distance; });*/
    return shipsComingTowards;
  }

}
