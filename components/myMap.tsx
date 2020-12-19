import {MapContainer, MapContainerProps} from 'react-leaflet';
import React from 'react';
import {LatLngBounds, Layer, Map as LeafletMap, Path} from 'leaflet';
import {GpxFileRefs} from 'pages/api/getGpxFileList';
import {createLeafletGpx} from 'lib/3rdParty/leafletgpx';
import {parseToGpxFileInfo2} from 'lib/gpx/parseToGpxFileInfo';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {MainPageContext} from 'lib/mainPageContext';
import MyLayerControl from 'components/myMapLayerControl';
import {Subject} from 'rxjs';
import {debounceTime, scan} from 'rxjs/operators';

// const colors = [
//     '#7c7c7c',
//     '#d34f00',
//     '#b96500',
//     '#a57000',
//     '#937800',
//     '#817f00',
//     '#6c8500',
//     '#4f8a00',
//     '#009004',
//     '#008f42',
//     '#008e5d',
//     '#008d6f',
//     '#008c7d',
//     '#008b89',
//     '#008a94',
//     '#00899f',
//     '#0088aa',
//     '#0086b7',
//     '#0084c7',
//     '#0081dc',
//     '#007afe',
//     '#606fff',
//     '#8f5dff',
//     '#bc3afc',
//     '#db00dd',
//     '#e400b5',
//     '#e90096',
//     '#ed007a',
//     '#f0005e',
//     '#f2003f',
//     '#f30011'
// ]

const colors = [
    '#FFFF00',
    '#00FFFF',
    '#FF00FF',
    '#00FF00',
    '#0000FF',
    '#FF0000'
]

let colorIndex = 0;

function getIndexedColor() {
    return colors[((colorIndex++) * 37) % colors.length];
}

export interface MyMapContainerProps extends MapContainerProps {

}

// export default function MyMap({children, position, zoom = 10, whenCreated}: { children?: any, position: LatLngExpression, zoom: number, whenCreated?: (map: LeafletMap) => void }) {
export default function MyMap(opts: MyMapContainerProps) {
    const layersByGpxFileName = new Map<string, Layer>();

    const boundsRequest$ = new Subject<LatLngBounds>();


    function addGpxToMap(gpxFile: GpxFileInfo, map: LeafletMap, showFile: (file: GpxFileInfo) => void) {
        const gpxOptions = {
            async: true,
            marker_options: {
                startIconUrl: '', //'img/pin-icon-start.png',
                endIconUrl: '', // 'img/pin-icon-end.png',
                shadowUrl: '' // 'img/pin-shadow.png'
            },
            polyline_options: {
                color: getIndexedColor(),
                opacity: 0.75,
                weight: 3,
                fill: true,
                fillOpacity: 0.1
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
            boundsRequest$.next(e.target.getBounds())

            const tracePath: Path = gpx.getLayers()[0] as Path;
            const traceEl = tracePath.getElement();
            traceEl.classList.add('flashingTrace')
            const delayOffset = Math.floor(Math.random() * 8);
            traceEl.classList.add('flashingTrace_delay_'+delayOffset)
            const durationOffset = Math.floor(Math.random() * 8);
            traceEl.classList.add('flashingTrace_duration_'+durationOffset)

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

    return (
        <MainPageContext.Consumer>
            {({newGpxFilesToDraw$, showFileInfo, fileDirectory}) => {
                function fillMap(map: LeafletMap) {
                    // console.log('fillMap', {map});
                    newGpxFilesToDraw$.subscribe(gpxFileInfo => {
                        addGpxToMap(gpxFileInfo, map, showFileInfo);
                    });

                    fetch(`api/getGpxFileList?directory=${fileDirectory}`)
                        .then(res => res.json())
                        .then(gpxFileRefs => {
                                return addGpxsToMap(map, gpxFileRefs as GpxFileRefs, showFileInfo)
                            }
                        );

                }

                const mapOpts: MapContainerProps = {
                    ...opts, whenCreated: map => {
                        if (opts.whenCreated) {
                            opts.whenCreated(map)
                        }
                        fillMap(map);

                        boundsRequest$.pipe(
                            scan<LatLngBounds>((globalBounds, newBounds) => globalBounds && globalBounds.extend(newBounds) || newBounds),
                            debounceTime(300)
                        ).subscribe(bounds => {
                            map.flyToBounds(bounds, {animate: true, duration: 0.5})
                        });
                    },
                }
                return <MapContainer {...mapOpts}>
                    <MyLayerControl/>
                </MapContainer>;
            }}
        </MainPageContext.Consumer>
    );
}