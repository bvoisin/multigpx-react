import {Observable} from 'rxjs';
import React from 'react';
import {LatLngBounds, PanOptions} from 'leaflet';
import {TraceData} from 'lib/api/MongoDao';
import {TraceDataWithXml} from 'lib/io/getTraces';

export type DisplayMode = 'def' | 'xmas' | 'xmas2'

export interface MainPageContextType {
    otherMapsToDraw: TraceDataWithXml[];
    redrawFile: (file: TraceDataWithXml) => void;
    selectFile: (file: TraceData) => void;
    selectedFileId: string;
    fileDirectory: string;
    displayMode: DisplayMode;
    flyToCommand$: Observable<FlyToCommand>;

    flyToRequest(bounds: LatLngBounds, options: PanOptions, extend: boolean)
}

export type FlyToCommand = { bounds?: LatLngBounds, options?: PanOptions };
export const MainPageContext = React.createContext<MainPageContextType>(undefined);
