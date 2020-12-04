import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';
import {Observable, Subject} from 'rxjs';

const MyMap = dynamic(
    () => import('../components/myMap'),
    {ssr: false}
);

export interface DroppedMapsContextType {
    droppedGpxFile$: Observable<File>;
}

export const DroppedMapsContext = React.createContext<DroppedMapsContextType>({droppedGpxFile$: new Subject()});

interface HomeState {
    droppedMapsContext: DroppedMapsContextType;
    position: [number, number];
    zoom: number;
}

class Home extends React.Component<{}, HomeState> {

    private readonly droppedGpxFile$ = new Subject<File>();

    constructor(props, context) {
        super(props, context);
        this.state = {droppedMapsContext: {droppedGpxFile$: this.droppedGpxFile$}, position: [48.864716, 2.349014], zoom: 13}
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
        </div>;
    }
}

const indexHome = () => {
    return <Home/>;
}

export default indexHome;