import {useLeafletContext} from '@react-leaflet/core';
import {Map as LeafletMap} from 'leaflet';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import React, {useEffect, useState} from 'react';
import {GpxFileRefs} from 'pages/api/getGpxFileList';
import {parseToGpxFileInfo2} from 'lib/gpx/parseToGpxFileInfo';


export interface GpxTraceLoaderProps {
    directory: string;
    addTraceToMapCb: (gpxTrace: GpxFileInfo) => void;
    removeTracesFromMapCb: (gpxTraces: GpxFileInfo[]) => void;
}

export default function GpxTraceLoader({directory, addTraceToMapCb, removeTracesFromMapCb}: GpxTraceLoaderProps) {
    const leafletContext = useLeafletContext();
    const [loadedFiles, setLoadedFiles] = useState([] as GpxFileInfo[]);

    useEffect(() => {
        async function addGpxsToMap(map: LeafletMap, gpxFileList: GpxFileRefs): Promise<GpxFileInfo[]> {
            const promises = gpxFileList.map((gpxFileRef) => {
                return parseToGpxFileInfo2(gpxFileRef).then(fileInfo => {
                    addTraceToMapCb(fileInfo);
                    setLoadedFiles((alreadyLoadedFiles) => ([...alreadyLoadedFiles, fileInfo]))
                    return fileInfo;
                });
            });
            return Promise.all(promises);
        }

        fetch(`api/getGpxFileList?directory=${directory}`)
            .then(res => res.json())
            .then(gpxFileRefs => addGpxsToMap(leafletContext.map, gpxFileRefs as GpxFileRefs))
        return () => removeTracesFromMapCb(loadedFiles);
    }, [directory]);

    return null;
}
