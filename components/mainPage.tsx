import Head from 'next/head'
import React, {useMemo, useState} from 'react';
import dynamic from 'next/dynamic';
import {merge, Subject} from 'rxjs';
import {reduceGpx} from 'lib/gpx/reduceGpx';
import {concatMap, debounceTime, filter, scan, shareReplay} from 'rxjs/operators';
import {parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';
import {uploadGpx} from 'lib/io/upload';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {DisplayMode, DroppedMapsContextType, FlyToCommand, MainPageContext} from 'lib/mainPageContext';
import {LatLngBounds, PanOptions} from 'leaflet';
import {createStyles, makeStyles} from '@material-ui/core';

const DynamicMyMap = dynamic(
    () => import('components/myMap'),
    {ssr: false}
);

const useStyles = makeStyles(() =>
    createStyles({
        root: {},
        dropZone: {
            height: '100vh',
            width: '100vw'
        },
        mapContainer: {
            height: '100%'
        }
    }));

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
function MainPage(props: MainPageProps) {
    const classes = useStyles();

    const droppedGpxFile$ = useMemo(() => new Subject<File>(), undefined);
    const otherGpxFilesToDraw$$ = useMemo(() => new Subject<GpxFileInfo>(), undefined);

    const newGpxFilesToDraw$ = useMemo(
        () => merge(
            droppedGpxFile$.pipe(
                concatMap(file =>
                    reduceGpx(file)
                        .then(gpxDoc => parseToGpxFileInfo(gpxDoc, props.fileDirectory, file.name))
                        .then(fileInfo => uploadGpx(fileInfo, state.droppedMapsContext.fileDirectory).then(() => fileInfo))
                )
            ),
            otherGpxFilesToDraw$$
        ), [droppedGpxFile$]);

    const boundsRequest$ = useMemo(() => new Subject<BoundsRequest>(), undefined);

    const bounds$ = useMemo(() => boundsRequest$.pipe(
        scan<BoundsRequest, FlyToCommand>((lastCmd, request) => {
            const newBounds = request.extend && lastCmd.bounds ? lastCmd.bounds.extend(request.bounds) : request.bounds;
            const newOptions = {...lastCmd.options, ...request.options}
            const newCmd: FlyToCommand = {bounds: newBounds, options: newOptions};
            // console.log('mergedCmd', {request, newCmd});
            return newCmd;
        }, {}),
        filter(b => !!b.bounds), // ignore null bounds : we receive extends=false but no bounds to clear the scan
        debounceTime(300),
        shareReplay(1)
    ), undefined);


    function selectFile(selectedFile: GpxFileInfo) {
        setState(s => ({...s, droppedMapsContext: {...s.droppedMapsContext, selectedFileName: selectedFile?.fileName}}));
    }

    async function dropHandler(event: React.DragEvent<HTMLDivElement>) {
        const files = Array.from(event.dataTransfer.files);
        console.log('File(s) dropped ', {event, f: files});
        event.preventDefault();

        files.forEach(f => droppedGpxFile$.next(f));
    }

    function dragOverHandler(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    const [state, setState] = useState<MainPageState>({
        droppedMapsContext: {
            newGpxFilesToDraw$: newGpxFilesToDraw$,
            drawFile: f => otherGpxFilesToDraw$$.next(f),
            selectFile: f => selectFile(f),
            selectedFileName: null,
            fileDirectory: props.fileDirectory,
            flyToCommand$: bounds$,
            flyToRequest: (bounds: LatLngBounds, options: PanOptions, extend: boolean) => {
                boundsRequest$.next({bounds: bounds, extend: extend, options})
            },
            displayMode: props.displayMode
        },
        position: [48.864716, 2.4],
        zoom: 13,
    });

    return <div className={classes.root}>
        <Head>
            <title>{state.droppedMapsContext.fileDirectory}</title>
        </Head>
        <MainPageContext.Provider value={state.droppedMapsContext}>
            <div onDrop={e => dropHandler(e)} onDragOver={e => dragOverHandler(e)} className={classes.dropZone}>
                <DynamicMyMap center={state.position} zoom={state.zoom} className={classes.mapContainer}/>
            </div>
        </MainPageContext.Provider>
    </div>;
}

export default MainPage