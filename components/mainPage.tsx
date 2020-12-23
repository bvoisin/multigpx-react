import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';
import {merge, Subject} from 'rxjs';
import FilePopup from 'components/filePopup';
import {reduceGpx} from 'lib/gpx/reduceGpx';
import {concatMap, debounceTime, filter, scan, shareReplay} from 'rxjs/operators';
import {parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';
import {uploadGpx} from 'lib/io/upload';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {DisplayMode, DroppedMapsContextType, FlyToCommand, MainPageContext} from 'lib/mainPageContext';
import {LatLngBounds, PanOptions} from 'leaflet';
import {doTrace} from 'lib/rxjs/rxjs-doTrace';

const DynamicMyMap = dynamic(
    () => import('components/myMap'),
    {ssr: false}
);

interface MainPageProps {
    fileDirectory: string;
    displayMode: DisplayMode;
}

interface MainPageState {
    droppedMapsContext: DroppedMapsContextType;
    position: [number, number];
    zoom: number;
    shownFile?: GpxFileInfo
}

type BoundsRequest = { bounds: LatLngBounds, extend: boolean, options: PanOptions };

/**
 * The Main page when on a given directory
 * Contains the Map and all the piping
 */
class MainPage extends React.Component<MainPageProps, MainPageState> {

    private readonly droppedGpxFile$ = new Subject<File>();

    readonly newGpxFilesToDraw2$ = this.droppedGpxFile$.pipe(
        concatMap(file =>
            reduceGpx(file)
                .then(gpxDoc => parseToGpxFileInfo(gpxDoc, file.name))
                .then(fileInfo => uploadGpx(fileInfo, this.state.droppedMapsContext.fileDirectory).then(() => fileInfo))
        )
    )
    readonly otherGpxFilesToDraw$$ = new Subject<GpxFileInfo>()

    readonly newGpxFilesToDraw$ = merge(this.newGpxFilesToDraw2$, this.otherGpxFilesToDraw$$)

    readonly boundsRequest$ = new Subject<BoundsRequest>();

    readonly bounds$ = this.boundsRequest$.pipe(
        scan<BoundsRequest, FlyToCommand>((lastCmd, request) => {
            const newBounds = request.extend && lastCmd.bounds ? lastCmd.bounds.extend(request.bounds) : request.bounds;
            const newOptions = {...lastCmd.options, ...request.options}
            const newCmd: FlyToCommand = {bounds: newBounds, options: newOptions};
            console.log('mergedCmd', {request, newCmd});
            return newCmd;
        }, {}),
        doTrace('bounds'),
        filter(b => !!b.bounds), // ignore null bounds : we receive extends=false but no bounds to clear the scan
        debounceTime(300),
        shareReplay(1)
    );

    constructor(props, context) {
        super(props, context);
        this.state = {
            droppedMapsContext: {
                newGpxFilesToDraw$: this.newGpxFilesToDraw$,
                newGpxFileToDraw: f => this.otherGpxFilesToDraw$$.next(f),
                showFileInfo: f => this.showFileInfo(f),
                fileDirectory: props.fileDirectory,
                flyToCommands$: this.bounds$,
                flyToRequest: (bounds: LatLngBounds, options: PanOptions, extend: boolean) => {
                    this.boundsRequest$.next({bounds: bounds, extend: extend, options})
                },
                displayMode: props.displayMode
            },
            position: [48.864716, 2.4],
            zoom: 13,
        }
    }

    showFileInfo(shownFile: GpxFileInfo) {
        this.setState({shownFile})
    }

    async dropHandler(event: React.DragEvent<HTMLDivElement>) {
        const files = Array.from(event.dataTransfer.files);
        console.log('File(s) dropped ', {event, f: files});
        event.preventDefault();

        files.forEach(f => this.droppedGpxFile$.next(f));
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