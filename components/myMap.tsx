import {MapContainer, MapContainerProps, TileLayer} from 'react-leaflet';
import React from 'react';
import {Map as LeafletMap} from 'leaflet';
import {GpxFileRefs} from '../pages/api/getGpxFileList';
import {createLeafletGpx} from '../lib/leafletgpx';
import {DroppedMapsContext} from '../pages';
import {reduceGpx} from '../lib/reduceGpx';
import {uploadGpxText} from '../lib/upload';


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


    function addGpxToMap(gpxFile: string | Document, map: LeafletMap) {
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

        const lgpx = createLeafletGpx(gpxFile, gpxOptions)
        lgpx['on']('loaded', function (e) {
            const gpx = e.target;
            //  mymap.fitBounds(e.target.getBounds());
            gpx.bindPopup(gpx => {
                const link = gpx.get_link();
                let author = gpx.get_author();
                const popupText = '<b>' + gpx.get_name() + '</b>' +
                    (author ? '<br><i>' + author + '</i>' : '') +
                    (link ? '<br><a href="' + link + '" target="_blank">Link</a>' : '');
                return popupText;
            });
        }).addTo(map);
    }

    function addGpxsToMap(map: LeafletMap, gpxFileList: GpxFileRefs) {
        gpxFileList.forEach((gpxFile, index) => {
            addGpxToMap(gpxFile.url, map);
        });
    }

    return (
        <DroppedMapsContext.Consumer>
            {({droppedGpxFile$}) => {
                function fillMap(map: LeafletMap) {
                    // console.log('fillMap', {map});
                    droppedGpxFile$.subscribe(file => {
                            reduceGpx(file)
                                .then(gpxDoc => {
                                    addGpxToMap(gpxDoc, map);
                                    const gpxText = new XMLSerializer().serializeToString(gpxDoc);
                                    // console.log('gpxText ' + file.name, {gpxText})
                                    return uploadGpxText(file.name, gpxText);
                                })
                        }
                    );

                    fetch(`api/getGpxFileList`)
                        .then(res => res.json())
                        .then(data => {
                                const gpxFileList = data as GpxFileRefs
                                console.log('getList', {gpxFileList})
                                addGpxsToMap(map, gpxFileList)
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