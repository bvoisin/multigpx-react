import {MapContainer, MapContainerProps} from 'react-leaflet';
import React, {useContext, useState} from 'react';
import {MainPageContext} from 'lib/mainPageContext';
import MyLayerControl from 'components/myMapLayerControl';
import GpxTrace from 'components/GpxTrace';
import FlyToSupport from 'components/FlyToSupport';
import GpxTraceLoader from 'components/GpxTraceLoader';
import {GpxListControl} from 'components/gpxList/GpxListControl';
import Div100vh from 'lib/3rdParty/Div100vh';
import {TraceDataWithXml} from 'lib/io/getTraces';
import _ from 'lodash';
import {addTraceToList} from 'lib/traceList';

export interface MyMapContainerProps extends MapContainerProps {

}

// export default function MyMap({children, position, zoom = 10, whenCreated}: { children?: any, position: LatLngExpression, zoom: number, whenCreated?: (map: LeafletMap) => void }) {
export default function MyMap(opts: MyMapContainerProps) {

    const [loadedTraces, setLoadedTraces] = useState<TraceDataWithXml[]>([]);
    const {fileDirectory, displayMode, flyToCommand$, otherMapsToDraw} = useContext(MainPageContext)


    function addTraceToMap(newFile: TraceDataWithXml) {
        setLoadedTraces(loadedTraces => {
            return addTraceToList(loadedTraces, newFile);
        })
    }

    function removeTracesFromMap(fileIds: string[]) {
        const fileNames = new Set(fileIds);
        setLoadedTraces(loadedGpxFiles => [...loadedGpxFiles.filter(f => !fileNames.has(f._id))])
    }

    const mapOpts: MapContainerProps = {
        ...opts, whenCreated: map => {
            if (opts.whenCreated) {
                opts.whenCreated(map)
            }
            map.on('moveend', event => {
                console.log('moveend ', {event, bounds: map.getBounds()});
            })
        },
    }
    const traces = _.uniqBy([...otherMapsToDraw, ...loadedTraces], t => t._id)

    return <Div100vh>
        <MapContainer {...mapOpts}>
            {traces.map(file => {
                return <GpxTrace trace={file} key={file._id} flashPeriodFactor={Math.sqrt(traces.length)}/>;
            })}
            <MyLayerControl displayMode={displayMode}/>
            <GpxTraceLoader directory={fileDirectory} addTraceToMapCb={addTraceToMap} removeTracesFromMapCb={removeTracesFromMap}/>
            <FlyToSupport flyToCommand$={flyToCommand$}/>
            <GpxListControl fileList={traces}/>
        </MapContainer>
    </Div100vh>;
}