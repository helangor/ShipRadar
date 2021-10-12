import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  private ships: any[] = [];
  private home_coordinates = [61.058983, 28.320951]
  private radius = 40



  constructor(
    private http: HttpClient
  ) { }


  getShips() {
    const url = "https://meri.digitraffic.fi/api/v1/locations/latitude/" +
      this.home_coordinates[0] + "/longitude/" + this.home_coordinates[1] + "/radius/"
      + this.radius + "/from/" + new Date().toISOString();

    this.http.get<any>(url).subscribe(data => {
      console.log("DATA ", data);
      this.ships = data;
    })
  }
}
