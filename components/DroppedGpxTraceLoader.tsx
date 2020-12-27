import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import React, {useContext, useEffect, useState} from 'react';
import {MainPageContext} from 'lib/mainPageContext';


export interface GpxTraceLoaderProps {
    addTraceToMapCb: (gpxTrace: GpxFileInfo) => void;
    removeTracesFromMapCb: (gpxTraces: GpxFileInfo[]) => void;
}

export default function DroppedGpxTraceLoader({addTraceToMapCb, removeTracesFromMapCb}: GpxTraceLoaderProps) {
    const [loadedFiles, setLoadedFiles] = useState([] as GpxFileInfo[]);
    const {newGpxFilesToDraw$} = useContext(MainPageContext)

    useEffect(() => {
        const subscription = newGpxFilesToDraw$.subscribe(f => {
            addTraceToMapCb(f);
            setLoadedFiles((alreadyLoadedFiles) => ([...alreadyLoadedFiles, f])) // normally only one, but in case
        })

        return () => {
            removeTracesFromMapCb(loadedFiles);
            subscription.unsubscribe();
        };
    }, []);

    return null;
}
