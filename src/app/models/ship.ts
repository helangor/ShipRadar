export class Ship {
    distance!: number;
    geometry!: Geometry;
    properties!: Properties;
    mmsi!: number;
    metadata: any;
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