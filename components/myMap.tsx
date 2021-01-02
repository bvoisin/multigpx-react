import {MapContainer, MapContainerProps} from 'react-leaflet';
import React, {useState} from 'react';
import {Map as LeafletMap} from 'leaflet';
import {GpxFileRefs} from 'pages/api/getGpxFileList';
import {MainPageContext} from 'lib/mainPageContext';
import MyLayerControl from 'components/myMapLayerControl';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {parseToGpxFileInfo2} from 'lib/gpx/parseToGpxFileInfo';
import GpxTrace from 'components/GpxTrace';
import FlyToSupport from 'components/FlyToSupport';

export interface MyMapContainerProps extends MapContainerProps {

}

export interface MyMapContainerState {
    fileList: GpxFileInfo[]
}

// export default function MyMap({children, position, zoom = 10, whenCreated}: { children?: any, position: LatLngExpression, zoom: number, whenCreated?: (map: LeafletMap) => void }) {
export default function MyMap(opts: MyMapContainerProps) {

    const [{fileList}, setState] = useState<MyMapContainerState>({fileList: []});

    return (
        <MainPageContext.Consumer>
            {({fileDirectory, displayMode, flyToCommand$, flyToRequest}) => {

                async function addGpxsToMap(map: LeafletMap, gpxFileList: GpxFileRefs) {
                    const promises = gpxFileList.map((gpxFileRef) => {
                        return parseToGpxFileInfo2(gpxFileRef);
                    });
                    return Promise.all(promises).then(lst => setState(s => {
                        return ({fileList: [...s.fileList, ...lst]});
                    }))
                }

                function loadGpxTraces(map: LeafletMap, dir: string) {
                    fetch(`api/getGpxFileList?directory=${dir}`)
                        .then(res => res.json())
                        .then(gpxFileRefs => {
                                return addGpxsToMap(map, gpxFileRefs as GpxFileRefs)
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

                    //TODO fireFlashing();

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
                        return <GpxTrace gpxFileInfo={file} key={file.fileName} flashPeriodFactor={Math.sqrt(fileList.length)}/>;
                    })}
                    <FlyToSupport flyToCommand$={flyToCommand$}/>
                </MapContainer>;
            }}
        </MainPageContext.Consumer>
    );
}