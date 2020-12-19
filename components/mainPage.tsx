import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';
import {merge, Subject} from 'rxjs';
import FilePopup from 'components/filePopup';
import {reduceGpx} from 'lib/gpx/reduceGpx';
import {switchMap} from 'rxjs/operators';
import {parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';
import {uploadGpx} from 'lib/io/upload';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {DroppedMapsContextType, MainPageContext} from 'lib/mainPageContext';

const DynamicMyMap = dynamic(
    () => import('components/myMap'),
    {ssr: false}
);

interface MainPageProps {
    fileDirectory: string;
    xmasMode: boolean;
}

interface MainPageState {
    droppedMapsContext: DroppedMapsContextType;
    position: [number, number];
    zoom: number;
    shownFile?: GpxFileInfo
}

/**
 * The Main page when on a given directory
 * Contains the Map and all the piping
 */
class MainPage extends React.Component<MainPageProps, MainPageState> {

    private readonly droppedGpxFile$ = new Subject<File>();

    readonly newGpxFilesToDraw2$ = this.droppedGpxFile$.pipe(
        switchMap(file => reduceGpx(file).then(gpxDoc => parseToGpxFileInfo(gpxDoc, file.name))),
        switchMap(fileInfo => {
            return uploadGpx(fileInfo, this.state.droppedMapsContext.fileDirectory).then(() => fileInfo);
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
                showFileInfo: f => this.showFileInfo(f),
                fileDirectory: props.fileDirectory,
                xmasMode: props.xmasMode
            },
            position: [48.864716, 2.4],
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
    }

    dragOverHandler(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    render() {
        return this.state && <div>
          <Head>
            <title>{this.state.droppedMapsContext.fileDirectory}</title>
          </Head>
          <MainPageContext.Provider value={this.state.droppedMapsContext}>
            <div onDrop={e => this.dropHandler(e)} onDragOver={e => this.dragOverHandler(e)}>
              <DynamicMyMap center={this.state.position} zoom={this.state.zoom} style={{height: '100vh', width: '100vw'}}/>
            </div>
            <FilePopup file={this.state.shownFile} closePopup={() => this.showFileInfo(null)}/>
          </MainPageContext.Provider>
        </div>;
    }
}

export default MainPage;