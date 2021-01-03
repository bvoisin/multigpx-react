import {MapContainer, MapContainerProps} from 'react-leaflet';
import React, {useContext, useState} from 'react';
import {Map as LeafletMap} from 'leaflet';
import {MainPageContext} from 'lib/mainPageContext';
import MyLayerControl from 'components/myMapLayerControl';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import GpxTrace from 'components/GpxTrace';
import FlyToSupport from 'components/FlyToSupport';
import GpxTraceLoader from 'components/GpxTraceLoader';
import DroppedGpxTraceLoader from 'components/DroppedGpxTraceLoader';
import {Square} from 'components/square';

export interface MyMapContainerProps extends MapContainerProps {

}

export interface MyMapContainerState {
    loadedGpxFiles: GpxFileInfo[]
}


// export default function MyMap({children, position, zoom = 10, whenCreated}: { children?: any, position: LatLngExpression, zoom: number, whenCreated?: (map: LeafletMap) => void }) {
export default function MyMap(opts: MyMapContainerProps) {

    const [{loadedGpxFiles}, setState] = useState<MyMapContainerState>({loadedGpxFiles: []});
    const {fileDirectory, displayMode, flyToCommand$, newGpxFilesToDraw$} = useContext(MainPageContext)

    function fillMap(map: LeafletMap) {
        // console.log('fillMap', {map});
        newGpxFilesToDraw$.subscribe(gpxFileInfo => {
            addTraceToMap(gpxFileInfo);
        });
        map.on('moveend', event => {
            console.log('moveend ', {event, bounds: map.getBounds()});
        })
    }

    function addTraceToMap(f: GpxFileInfo) {
        setState(({loadedGpxFiles}) => ({loadedGpxFiles: [...loadedGpxFiles, f]}))
    }

    function removeTracesFromMap(files: (GpxFileInfo | string)[]) {
        const fileNames = new Set(files.map(f => typeof f === 'string' ? f : f.fileName));
        setState(({loadedGpxFiles}) => ({loadedGpxFiles: [...loadedGpxFiles.filter(f => !fileNames.has(f.fileName))]}))
    }

    const mapOpts: MapContainerProps = {
        ...opts, whenCreated: map => {
            if (opts.whenCreated) {
                opts.whenCreated(map)
            }
            fillMap(map);
        },
    }
    console.log('State ', loadedGpxFiles);
    return <MapContainer {...mapOpts}>
        {loadedGpxFiles.map(file => {
            return <GpxTrace gpxFileInfo={file} key={file.fileName} flashPeriodFactor={Math.sqrt(loadedGpxFiles.length)}/>;
        })}
        <MyLayerControl displayMode={displayMode}/>
        <GpxTraceLoader directory={fileDirectory} addTraceToMapCb={addTraceToMap} removeTracesFromMapCb={removeTracesFromMap}/>
        <FlyToSupport flyToCommand$={flyToCommand$}/>
        <DroppedGpxTraceLoader addTraceToMapCb={addTraceToMap} removeTracesFromMapCb={removeTracesFromMap}/>
        <Square center={[48.864716, 2.4]} size={1000}/>
    </MapContainer>;
}