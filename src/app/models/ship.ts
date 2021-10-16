export class Ship {
    distance!: number;
    geometry!: Geometry;
    properties!: Properties;
    mmsi!: number;
    metadata: any;
    markerOptions!: google.maps.MarkerOptions;
}

class Geometry {
    coordinates!: number[];
    type!: string;
    googleCoords!:  google.maps.LatLng;

}

class Properties {
    cog!: number;
    heading!: number;
    mmsi!: number;
    sog!: number;
}