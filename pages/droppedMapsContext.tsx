import {Observable} from 'rxjs';
import {GpxFileInfo} from 'pages/gpxFileInfo';
import React from 'react';

export interface DroppedMapsContextType {
    newGpxFilesToDraw$: Observable<GpxFileInfo>;
    newGpxFileToDraw: (file: GpxFileInfo) => void;
    showFileInfo: (file: GpxFileInfo) => void
    fileDirectory: string;
}

export const DroppedMapsContext = React.createContext<DroppedMapsContextType>(undefined);
