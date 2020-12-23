import {Observable} from 'rxjs';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import React from 'react';
import {LatLngBounds, PanOptions} from 'leaflet';

export type DisplayMode = 'def' | 'xmas' | 'xmas2'

export interface DroppedMapsContextType {
    newGpxFilesToDraw$: Observable<GpxFileInfo>;
    newGpxFileToDraw: (file: GpxFileInfo) => void;
    showFileInfo: (file: GpxFileInfo) => void
    fileDirectory: string;
    displayMode: DisplayMode;
    flyToCommands$: Observable<FlyToCommand>;

    flyToRequest(bounds: LatLngBounds, options: PanOptions, extend: boolean)
}

export type FlyToCommand = { bounds?: LatLngBounds, options?: PanOptions };
export const MainPageContext = React.createContext<DroppedMapsContextType>(undefined);
