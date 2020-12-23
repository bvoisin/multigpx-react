import {MapContainer, MapContainerProps} from 'react-leaflet';
import React from 'react';
import {Layer, Map as LeafletMap, Path} from 'leaflet';
import {GpxFileRefs} from 'pages/api/getGpxFileList';
import {createLeafletGpx} from 'lib/3rdParty/leafletgpx';
import {parseToGpxFileInfo2} from 'lib/gpx/parseToGpxFileInfo';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {MainPageContext} from 'lib/mainPageContext';
import MyLayerControl from 'components/myMapLayerControl';
import {interval, Subscription} from 'rxjs';

const stdColors = [
    '#d34f00',
    '#b96500',
    '#a57000',
    '#937800',
    '#817f00',
    '#6c8500',
    '#4f8a00',
    '#009004',
    '#008f42',
    '#008e5d',
    '#008d6f',
    '#008c7d',
    '#008b89',
    '#008a94',
    '#00899f',
    '#0088aa',
    '#0086b7',
    '#0084c7',
    '#0081dc',
    '#007afe',
    '#606fff',
    '#8f5dff',
    '#bc3afc',
    '#db00dd',
    '#e400b5',
    '#e90096',
    '#ed007a',
    '#f0005e',
    '#f2003f',
    '#f30011'
]

const xmasColors = [
    '#FFFF00',
    '#00FFFF',
    '#FF00FF',
    '#00FF00',
    '#0000FF',
    '#FF0000'
]

let colorIndex = 0;

function getIndexedColor(xmasMode: boolean) {
    const colors = xmasMode ? xmasColors : stdColors;
    return colors[((colorIndex++) * 37) % colors.length];
}

export interface MyMapContainerProps extends MapContainerProps {

}

// export default function MyMap({children, position, zoom = 10, whenCreated}: { children?: any, position: LatLngExpression, zoom: number, whenCreated?: (map: LeafletMap) => void }) {
export default function MyMap(opts: MyMapContainerProps) {
    const layersByGpxFileName = new Map<string, Layer>();

    let subscription: Subscription;


    return (
        <MainPageContext.Consumer>
            {({newGpxFilesToDraw$, showFileInfo, fileDirectory, xmasMode, bounds$, boundsRequest}) => {
                function addGpxToMap(gpxFile: GpxFileInfo, map: LeafletMap, showFile: (file: GpxFileInfo) => void) {
                    const gpxOptions = {
                        async: true,
                        marker_options: {
                            startIconUrl: '', //'img/pin-icon-start.png',
                            endIconUrl: '', // 'img/pin-icon-end.png',
                            shadowUrl: '' // 'img/pin-shadow.png'
                        },
                        polyline_options: {
                            color: getIndexedColor(xmasMode),
                            opacity: 0.90,
                            weight: 3,
                            fill: !xmasMode,
                            fillOpacity: !xmasMode && 0.1
                        }
                    };

                    let previousLayer = layersByGpxFileName.get(gpxFile.fileName);
                    if (previousLayer) {
                        map.removeLayer(previousLayer);
                        layersByGpxFileName.delete(gpxFile.fileName)
                    }
                    const lgpx = createLeafletGpx(gpxFile.doc, gpxOptions)
                    lgpx['on']('loaded', function (e) {
                        const gpx = e.target;
                        boundsRequest(e.target.getBounds(), true)

                        if (xmasMode) {
                            const tracePath: Path = gpx.getLayers()[0] as Path;
                            const traceEl = tracePath.getElement();
                            traceEl.classList.add('flashingTrace')
                            // const delayOffset = Math.floor(Math.random() * 8);
                            // traceEl.classList.add('flashingTrace_delay_' + delayOffset)
                            // const durationOffset = Math.floor(Math.random() * 8);
                            // traceEl.classList.add('flashingTrace_duration_' + durationOffset)
                        }
                        gpx.on('click', () => {
                            showFile(gpxFile);

                            console.log('lgpx ', {layers: lgpx.getLayers(), lgpx})
                            // lgpx.setStyle({color: 'white'})
                        })
                        gpx.bindTooltip(() => {
                            // const link = gpxFile.link;
                            let author = gpxFile.athleteName;
                            return `<div>                    <b>${gpxFile.traceName}</b>` +
                                (author ? `<br/><b><i>${author}</i></b>` : '') +
                                // (link ? `<br/><a href=${link}>Link</a>` : '') +
                                '</div>';
                        });
                    }).addTo(map);
                    layersByGpxFileName.set(gpxFile.fileName, lgpx as Layer);
                }

                async function addGpxsToMap(map: LeafletMap, gpxFileList: GpxFileRefs, showFile: (file: GpxFileInfo) => void) {
                    const promises = gpxFileList.map((gpxFileRef) => {
                        return parseToGpxFileInfo2(gpxFileRef).then(gpxFileInfo => {
                            addGpxToMap(gpxFileInfo, map, showFile);
                            return gpxFileInfo
                        });
                    });
                    return Promise.all(promises)
                }

                function followBoundChanges(map: LeafletMap) {
                    if (subscription) {
                        subscription.unsubscribe();
                        subscription = null;
                    }

                    subscription = bounds$.subscribe(bounds => {
                        console.log('To bounds ', bounds)
                        map.flyToBounds(bounds, {animate: true, duration: 0.5})
                    });
                }

                function followInNewGpxFiles(map: LeafletMap) {
                    newGpxFilesToDraw$.subscribe(gpxFileInfo => {
                        addGpxToMap(gpxFileInfo, map, showFileInfo);
                    });
                }

                function fireFlashing() {
                    let currentGpxs: string[] = [];
                    const intervalMs = 400
                    const nbIntervalsWithoutReFires = Math.ceil(3000 / intervalMs); // 3000 = lenght of the longuest animation
                    const flashedGpxs: string[] = new Array<string>(nbIntervalsWithoutReFires);
                    interval(intervalMs).subscribe(i => {
                        if (currentGpxs.length != layersByGpxFileName.size) {
                            currentGpxs = Array.from(layersByGpxFileName.keys());
                        }
                        if (currentGpxs.length !== 0) {
                            const selectedGpx = currentGpxs[Math.floor(Math.random() * currentGpxs.length)];
                            if (flashedGpxs.indexOf(selectedGpx) === -1) { // do not refire this trace if it has been fired in the last intervals
                                flashedGpxs[i % nbIntervalsWithoutReFires] = selectedGpx;
                                const lGpx = layersByGpxFileName.get(selectedGpx) as Path;
                                const layer = (lGpx as any).getLayers()[0];
                                console.log(`fireFlashing ${i} ${selectedGpx}`, {lGpx, layer});

                                if (layer) {
                                    const traceEl = layer.getElement();
                                    if (traceEl.classList.contains('flashingTraceA')) {
                                        traceEl.classList.remove('flashingTraceA')
                                        traceEl.classList.add('flashingTraceB')
                                    } else {
                                        traceEl.classList.remove('flashingTraceB')
                                        traceEl.classList.add('flashingTraceA')
                                    }
                                }
                            } else {
                                flashedGpxs[i % nbIntervalsWithoutReFires] = null;
                            }
                        }
                    })
                }

                function fillMap(map: LeafletMap) {
                    // console.log('fillMap', {map});
                    followInNewGpxFiles(map);

                    fetch(`api/getGpxFileList?directory=${fileDirectory}`)
                        .then(res => res.json())
                        .then(gpxFileRefs => {
                                return addGpxsToMap(map, gpxFileRefs as GpxFileRefs, showFileInfo)
                            }
                        );
                    followBoundChanges(map);

                    fireFlashing();
                }

                const mapOpts: MapContainerProps = {
                    ...opts, whenCreated: map => {
                        if (opts.whenCreated) {
                            opts.whenCreated(map)
                        }
                        fillMap(map);
                    },
                }
                return <MapContainer {...mapOpts}>
                    <MyLayerControl xmasMode={xmasMode}/>
                </MapContainer>;
            }}
        </MainPageContext.Consumer>
    );
}