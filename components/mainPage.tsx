import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';
import {merge, Subject} from 'rxjs';
import {reduceGpx} from 'lib/gpx/reduceGpx';
import {concatMap, debounceTime, filter, scan, shareReplay} from 'rxjs/operators';
import {parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';
import {uploadGpx} from 'lib/io/upload';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {DisplayMode, DroppedMapsContextType, FlyToCommand, MainPageContext} from 'lib/mainPageContext';
import {LatLngBounds, PanOptions} from 'leaflet';
import {createStyles, withStyles, WithStyles} from '@material-ui/core';

const DynamicMyMap = dynamic(
    () => import('components/myMap'),
    {ssr: false}
);

const styles = () =>
    createStyles({
        root: {},
        dropZone: {
            height: '100vh',
            width: '100vw'
        },
        mapContainer: {
            height: '100vh',
            width: '100vw'
        }
    });

interface MainPageProps {
    fileDirectory: string;
    displayMode: DisplayMode;
}

interface MainPageState {
    droppedMapsContext: DroppedMapsContextType;
    position: [number, number];
    zoom: number;
}


type BoundsRequest = { bounds: LatLngBounds, extend: boolean, options: PanOptions };

/**
 * The Main page when on a given directory
 * Contains the Map and all the piping
 */
const MainPage = withStyles<any, any, MainPageProps>(styles, {withTheme: true})(
    class extends React.Component<MainPageProps & WithStyles<typeof styles>, MainPageState> {
        private readonly droppedGpxFile$ = new Subject<File>();

        readonly newGpxFilesToDraw2$ = this.droppedGpxFile$.pipe(
            concatMap(file =>
                reduceGpx(file)
                    .then(gpxDoc => parseToGpxFileInfo(gpxDoc, this.props.fileDirectory, file.name))
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
                // console.log('mergedCmd', {request, newCmd});
                return newCmd;
            }, {}),
            // doTrace('bounds'),
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
                    selectFile: f => this.selectFile(f),
                    selectedFileName: null,
                    fileDirectory: props.fileDirectory,
                    flyToCommand$: this.bounds$,
                    flyToRequest: (bounds: LatLngBounds, options: PanOptions, extend: boolean) => {
                        this.boundsRequest$.next({bounds: bounds, extend: extend, options})
                    },
                    displayMode: props.displayMode
                },
                position: [48.864716, 2.4],
                zoom: 13,
            }
        }

        selectFile(selectedFile: GpxFileInfo) {
            this.setState(s => ({...s, droppedMapsContext: {...s.droppedMapsContext, selectedFileName: selectedFile?.fileName}}));
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
            const {classes} = this.props;

            return this.state && <div className={classes.root}>
              <Head>
                <title>{this.state.droppedMapsContext.fileDirectory}</title>
              </Head>
              <MainPageContext.Provider value={this.state.droppedMapsContext}>
                <div onDrop={e => this.dropHandler(e)} onDragOver={e => this.dragOverHandler(e)} className={classes.dropZone}>
                  <DynamicMyMap center={this.state.position} zoom={this.state.zoom} className="mapContainer"/>
                </div>
              </MainPageContext.Provider>
            </div>;
        }
    }
)

export default MainPage