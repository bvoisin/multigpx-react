import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';
import {merge, Observable, Subject} from 'rxjs';
import FilePopup from 'components/filePopup';
import {reduceGpx} from 'lib/reduceGpx';
import {switchMap} from 'rxjs/operators';
import {parseToGpxFileInfo} from 'lib/parseToGpxFileInfo';
import {uploadGpx} from 'lib/upload';

const MyMap = dynamic(
    () => import('components/myMap'),
    {ssr: false}
);

export interface DroppedMapsContextType {
    newGpxFilesToDraw$: Observable<GpxFileInfo>;
    newGpxFileToDraw: (file: GpxFileInfo) => void;
    showFileInfo: (file: GpxFileInfo) => void
}

export class GpxFileInfo {
    constructor(readonly fileName: string, readonly doc: Document, readonly traceName: string, readonly athleteName: string, readonly link?: string) {
    }
}

export const DroppedMapsContext = React.createContext<DroppedMapsContextType>(undefined);

interface HomeState {
    droppedMapsContext: DroppedMapsContextType;
    position: [number, number];
    zoom: number;
    shownFile?: GpxFileInfo
}

class Home extends React.Component<{}, HomeState> {

    private readonly droppedGpxFile$ = new Subject<File>();

    readonly newGpxFilesToDraw2$ = this.droppedGpxFile$.pipe(
        switchMap(file => reduceGpx(file).then(gpxDoc => parseToGpxFileInfo(gpxDoc, file.name))),
        switchMap(fileInfo => {
            return uploadGpx(fileInfo).then(() => fileInfo);
        })
    )
    readonly otherGpxFilesToDraw$$ = new Subject<GpxFileInfo>()

    readonly newGpxFilesToDraw$ = merge(this.newGpxFilesToDraw2$, this.otherGpxFilesToDraw$$)

    constructor(props, context) {
        super(props, context);
        this.state = {
            droppedMapsContext: {
                newGpxFilesToDraw$: this.newGpxFilesToDraw$,
                newGpxFileToDraw: f => this.otherGpxFilesToDraw$$.next(f),
                showFileInfo: f => this.showFileInfo(f)
            },
            position: [48.864716, 2.349014],
            zoom: 13,
        }
    }

    showFileInfo(shownFile: GpxFileInfo) {
        this.setState({shownFile})
    }

    async dropHandler(event: React.DragEvent<HTMLDivElement>) {
        let file = event.dataTransfer.files[0];
        console.log('File(s) dropped ', {event, f: file});
        event.preventDefault();

        this.droppedGpxFile$.next(file);
        // await uploadGpx(file);
    }

    dragOverHandler(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    render() {
        return <div>
            <Head>
                <title>1km PSC</title>
            </Head>
            <DroppedMapsContext.Provider value={this.state.droppedMapsContext}>
                <div onDrop={e => this.dropHandler(e)} onDragOver={e => this.dragOverHandler(e)}>
                    <MyMap center={this.state.position} zoom={this.state.zoom} style={{height: '100vh', width: '100vw'}}/>
                </div>
                <FilePopup file={this.state.shownFile} closePopup={() => this.showFileInfo(null)}></FilePopup>
            </DroppedMapsContext.Provider>
        </div>;
    }
}

const indexHome = () => {
    return <Home/>;
}

export default indexHome;