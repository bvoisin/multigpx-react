import {Observable} from 'rxjs';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import React from 'react';
import {LatLngBounds} from 'leaflet';

export interface DroppedMapsContextType {
    newGpxFilesToDraw$: Observable<GpxFileInfo>;
    newGpxFileToDraw: (file: GpxFileInfo) => void;
    showFileInfo: (file: GpxFileInfo) => void
    fileDirectory: string;
    xmasMode: boolean;
    bounds$: Observable<LatLngBounds>;

    boundsRequest(bounds: LatLngBounds, extend: boolean)
}

export type BoundsRequest = { bounds: LatLngBounds, extends: boolean };
export const MainPageContext = React.createContext<DroppedMapsContextType>(undefined);
