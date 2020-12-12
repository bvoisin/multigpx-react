import {MapContainer, MapContainerProps, TileLayer} from 'react-leaflet';
import React from 'react';
import {Layer, Map as LeafletMap} from 'leaflet';
import {GpxFileRefs} from 'pages/api/getGpxFileList';
import {createLeafletGpx} from 'lib/leafletgpx';
import {DroppedMapsContext, GpxFileInfo} from 'pages';
import {parseToGpxFileInfo2} from 'lib/parseToGpxFileInfo';

const colors = [
    '#7c7c7c',
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

let colorIndex = 0;

function getIndexedColor() {
    return colors[((colorIndex++) * 37) % colors.length];
}

export interface MyMapContainerProps extends MapContainerProps {

}

// export default function MyMap({children, position, zoom = 10, whenCreated}: { children?: any, position: LatLngExpression, zoom: number, whenCreated?: (map: LeafletMap) => void }) {
export default function MyMap(opts: MyMapContainerProps) {

    const layersByGpxFileName = new Map<string, Layer>();

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
            //  mymap.fitBounds(e.target.getBounds());

            gpx.on('click', (e) => {
                showFile(gpxFile)
            })
            // gpx.clickevent bindPopup(layer => {
            //     const link = gpxFile.link;
            //     let author = gpxFile.athleteName;
            //     ReactDOM.render(<div>
            //         <b>{gpxFile.traceName}</b>
            //         {author ? <b><i>{author}</i></b> : null}
            //         {link ? <><br/><a href={link} target="_blank">Link</a></> : null}
            //     </div>, layer.getPopup().getElement());
            //     return;
            // });
        }).addTo(map);
        layersByGpxFileName.set(gpxFile.fileName, lgpx as Layer);
    }

    async function addGpxsToMap(map: LeafletMap, gpxFileList: GpxFileRefs, showFile: (file: GpxFileInfo) => void) {
        const promises = gpxFileList.map((gpxFileRef, index) => {
            return parseToGpxFileInfo2(gpxFileRef).then(gpxFileInfo => {
                addGpxToMap(gpxFileInfo, map, showFile);
                return gpxFileInfo
            });
        });
        return Promise.all(promises)
    }

    return (
        <DroppedMapsContext.Consumer>
            {({newGpxFilesToDraw$, showFileInfo}) => {
                function fillMap(map: LeafletMap) {
                    // console.log('fillMap', {map});
                    newGpxFilesToDraw$.subscribe(gpxFileInfo => {
                        addGpxToMap(gpxFileInfo, map, showFileInfo);
                    });

                    fetch(`api/getGpxFileList`)
                        .then(res => res.json())
                        .then(data => {
                                const gpxFileList = data as GpxFileRefs
                                console.log('getList2', {gpxFileList})
                                return addGpxsToMap(map, gpxFileList, showFileInfo)
                            }
                        );

                }

                const mapOpts: MapContainerProps = {
                    ...opts, whenCreated: map => {
                        if (opts.whenCreated) {
                            opts.whenCreated(map)
                        }
                        fillMap(map);
                    }
                }
                return <MapContainer {...mapOpts}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/*<Marker position={position}>*/}
                    {/*    <Popup>*/}
                    {/*        A pretty CSS3 popup. <br/> Easily customizable.*/}
                    {/*    </Popup>*/}
                    {/*</Marker>*/}
                </MapContainer>;
            }}
        </DroppedMapsContext.Consumer>
    );
}