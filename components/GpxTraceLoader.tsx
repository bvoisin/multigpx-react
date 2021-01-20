import {useLeafletContext} from '@react-leaflet/core';
import {Map as LeafletMap} from 'leaflet';
import React, {useEffect, useState} from 'react';
import {TraceData} from 'lib/api/MongoDao';
import {getTraces} from 'lib/io/getTraces';
import _ from 'lodash';


export interface GpxTraceLoaderProps {
    directory: string;
    addTraceToMapCb: (gpxTrace: TraceData) => void;
    removeTracesFromMapCb: (gpxTraceIds: string[]) => void;
}

export default function GpxTraceLoader({directory, addTraceToMapCb, removeTracesFromMapCb}: GpxTraceLoaderProps) {
    const leafletContext = useLeafletContext();
    const [loadedFileIds, setLoadedFileIds] = useState([] as string[]);

    useEffect(() => {
        async function addTracesToMap(map: LeafletMap, traces: TraceData[]): Promise<TraceData[]> {
            console.log('Going to add traces to Map', traces);
            const promises = traces.map((trace) => {
                addTraceToMapCb(trace);
                setLoadedFileIds((alreadyLoadedFileIds) => ([...alreadyLoadedFileIds, trace._id]))
                return trace;
            });
            return Promise.all(promises);
        }

        getTraces(directory)
            .then(traces => addTracesToMap(leafletContext.map, traces as TraceData[]))
        return () => removeTracesFromMapCb(loadedFileIds);
    }, [directory]);

    return null;
}
