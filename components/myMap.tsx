import {MapContainer, MapContainerProps} from 'react-leaflet';
import React, {useEffect, useState} from 'react';
import L, {Map as LeafletMap} from 'leaflet';
import {GpxFileRefs} from 'pages/api/getGpxFileList';
import {MainPageContext} from 'lib/mainPageContext';
import MyLayerControl from 'components/myMapLayerControl';
import {Subscription} from 'rxjs';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {parseToGpxFileInfo2} from 'lib/gpx/parseToGpxFileInfo';
import {useLeafletContext} from '@react-leaflet/core';
import GpxTrace from 'components/GpxTrace';

export interface MyMapContainerProps extends MapContainerProps {

}

export interface MyMapContainerState {
    fileList: GpxFileInfo[]
}

// export default function MyMap({children, position, zoom = 10, whenCreated}: { children?: any, position: LatLngExpression, zoom: number, whenCreated?: (map: LeafletMap) => void }) {
export default function MyMap(opts: MyMapContainerProps) {
    let subscription: Subscription;

    const [{fileList}, setState] = useState<MyMapContainerState>({fileList: []});

    return (
        <MainPageContext.Consumer>
            {({showFileInfo, fileDirectory, displayMode, flyToCommands$, flyToRequest}) => {

                function subscribeToFlyToCommands(map: LeafletMap) {
                    if (subscription) {
                        subscription.unsubscribe();
                        subscription = null;
                    }

                    subscription = flyToCommands$.subscribe(cmd => {
                        console.log('Fly To ', cmd)
                        map.flyToBounds(cmd.bounds, {animate: true, duration: 1, noMoveStart: true, ...cmd.options})
                    });
                }

                async function addGpxsToMap(map: LeafletMap, gpxFileList: GpxFileRefs, showFile: (file: GpxFileInfo) => void) {
                    const promises = gpxFileList.map((gpxFileRef) => {
                        const i = parseToGpxFileInfo2(gpxFileRef);
                        return i;
                    });
                    return Promise.all(promises).then(lst => setState(s => {
                        console.log('parsed ', {lst})
                        return ({fileList: [...s.fileList, ...lst]});
                    }))
                }

                function loadGpxTraces(map: LeafletMap, dir: string) {
                    fetch(`api/getGpxFileList?directory=${dir}`)
                        .then(res => res.json())
                        .then(gpxFileRefs => {
                                return addGpxsToMap(map, gpxFileRefs as GpxFileRefs, showFileInfo)
                            }
                        );
                }

                function showJoyeuxNoel(map: LeafletMap) {
                    console.log('showJoyeuxNoel');
                    flyToRequest(null, {duration: 10, easeLinearity: 0.1}, false);
                    loadGpxTraces(map, '_joyeux-noel');
                }

                function fillMap(map: LeafletMap) {
                    // console.log('fillMap', {map});
                    // TODO followInNewGpxFiles(map);

                    loadGpxTraces(map, fileDirectory);
                    subscribeToFlyToCommands(map);

                    // TODO fireFlashing();

                    map.on('moveend', event => {
                        console.log('moveend ', {event, bounds: map.getBounds()});
                    })

                    if (displayMode == 'xmas2') {
                        setTimeout(() => showJoyeuxNoel(map), 5000)
                    }
                }

                const mapOpts: MapContainerProps = {
                    ...opts, whenCreated: map => {
                        if (opts.whenCreated) {
                            opts.whenCreated(map)
                        }
                        fillMap(map);
                    },
                }
                console.log('State ', fileList);
                return <MapContainer {...mapOpts}>
                    <MyLayerControl displayMode={displayMode}/>
                    {fileList.map(file => {
                        return <GpxTrace displayMode={displayMode} gpxFileInfo={file}/>;
                    })}
                </MapContainer>;
            }}
        </MainPageContext.Consumer>
    );
}