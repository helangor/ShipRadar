export class Ship {
    distance!: number;
    geometry: Geometry = new Geometry();
    properties: Properties= new Properties();
    mmsi!: number;
    metadata: Metadata = new Metadata();
    markerOptions!: google.maps.MarkerOptions;
}

class Geometry {
    coordinates!: number[];
    type!: string;
}

class Properties {
    cog!: number;
    heading!: number;
    mmsi!: number;
    sog!: number;
}

class Metadata {
    callSign?: string;
    destination?: string;
    draught?: number;
    eta?: number;
    etaInUi?: string;
    imo?: number;
    name?: string;
    posType?: number;
    shipType?: number;
    shipTypeDescriptionFi?: string;
    timestamp?: number;
    flag?: string;
    image?: string;
    length?: number;
    width?: number;
}