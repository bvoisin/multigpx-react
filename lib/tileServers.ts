export class TileServer {
    constructor(readonly code: string, readonly name: string, readonly    url: string, readonly    attribution: string) {
    }
}

const defTS = new TileServer('def', 'OpenStreetMap.Mapnik', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors');
const darkTS = new TileServer('dark', 'Carto Dark', 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', '&copy; <a href="http://carto.com/basemaps">Carto</a> contributors');
const bwTS = new TileServer('bw', 'OpenStreetMap.BlackAndWhite', 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors');

export const tileServers: TileServer[] = [
    defTS,
    darkTS,
    bwTS
];

export function getTileServer(code: string) {
    return tileServers.find(ts => ts.code === code) || defTS;
}
