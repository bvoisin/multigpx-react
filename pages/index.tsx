import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';
import {Observable, Subject} from 'rxjs';
import FilePopup from 'components/filePopup';

const MyMap = dynamic(
    () => import('components/myMap'),
    {ssr: false}
);

export interface DroppedMapsContextType {
    droppedGpxFile$: Observable<File>;
    showFile: (file: GpxFileInfo) => void
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

    constructor(props, context) {
        super(props, context);
        this.state = {
            droppedMapsContext: {
                droppedGpxFile$: this.droppedGpxFile$,
                showFile: f => this.showFile(f)
            },
            position: [48.864716, 2.349014],
            zoom: 13,
        }
    }

    showFile(shownFile: GpxFileInfo) {
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
            </DroppedMapsContext.Provider>
            <FilePopup file={this.state.shownFile} closePopup={() => this.showFile(null)}></FilePopup>
        </div>;
    }
}

const indexHome = () => {
    return <Home/>;
}

export default indexHome;