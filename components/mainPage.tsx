import Head from 'next/head'
import React, {useMemo, useState} from 'react';
import dynamic from 'next/dynamic';
import {Subject} from 'rxjs';
import {debounceTime, filter, scan, shareReplay} from 'rxjs/operators';
import {uploadTrace} from 'lib/io/uploadTrace';
import {DisplayMode, MainPageContextType, FlyToCommand, MainPageContext} from 'lib/mainPageContext';
import {LatLngBounds, PanOptions} from 'leaflet';
import {createStyles, makeStyles} from '@material-ui/core';
import {TraceData} from 'lib/api/MongoDao';
import {getTrace, TraceDataWithXml} from 'lib/io/getTraces';
import {addTraceToList} from 'lib/traceList';

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
    selectedFileId?: string;
}


type BoundsRequest = { bounds: LatLngBounds, extend: boolean, options: PanOptions };


/**
 * The Main page when on a given directory
 * Contains the Map and all the piping
 */
function MainPage(props: MainPageProps) {
    const classes = useStyles();
    const [otherMapsToDraw, setOtherMapsToDraw] = useState<TraceDataWithXml[]>([]);

    function addFileToDraw(newFile: TraceDataWithXml) {
        setOtherMapsToDraw(lst => {
            const lst2 = addTraceToList(lst, newFile);
            console.log('lst2', lst2);
            return lst2;
        });
    }

    const [state, setState] = useState<MainPageState>({});

    const boundsRequest$ = useMemo(() => new Subject<BoundsRequest>(), []);


    const bounds$ = useMemo(() => boundsRequest$.pipe(
        scan<BoundsRequest, FlyToCommand>((lastCmd, request) => {
            const newBounds = request.extend && lastCmd.bounds ? lastCmd.bounds.extend(request.bounds) : request.bounds;
            const newOptions = {...lastCmd.options, ...request.options}
            const newCmd: FlyToCommand = {bounds: newBounds, options: newOptions};
            // console.log('mergedCmd', {request, newCmd, lastCmd});
            return newCmd;
        }, {}),
        filter(b => !!b.bounds), // ignore null bounds : we receive extends=false but no bounds to clear the scan
        debounceTime(300),
        shareReplay(1)
    ), []);

    function selectFile(selectedFile: TraceData) {
        setState({selectedFileId: selectedFile?._id});
    }

    async function dropHandler(event: React.DragEvent<HTMLDivElement>) {
        const files = Array.from(event.dataTransfer.files);
        console.log('File(s) dropped ', {event, f: files});
        event.preventDefault();

        files.forEach(f => {
            uploadTrace(f, props.fileDirectory)
                .then(_id => getTrace(_id))
                .then(t => {
                    console.log('addingFile ', f);
                    addFileToDraw(t)
                })
        });
    }

    function dragOverHandler(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    const mainPageContext = {
        otherMapsToDraw: otherMapsToDraw,
        redrawFile: f => addFileToDraw(f),
        selectFile: f => selectFile(f),
        selectedFileId: state.selectedFileId,
        fileDirectory: props.fileDirectory,
        flyToCommand$: bounds$,
        flyToRequest: (bounds: LatLngBounds, options: PanOptions, extend: boolean) => {
            boundsRequest$.next({bounds: bounds, extend: extend, options})
        },
        displayMode: props.displayMode
    } as MainPageContextType;
    return <div className={classes.root}>
        <Head>
            <title>{props.fileDirectory}</title>
        </Head>
        <MainPageContext.Provider value={mainPageContext}>
            <div onDrop={e => dropHandler(e)} onDragOver={e => dragOverHandler(e)} className={classes.dropZone}>
                <DynamicMyMap center={[48.864716, 2.4]} zoom={13} className={classes.mapContainer}/>
            </div>
        </MainPageContext.Provider>
    </div>;
}

export default MainPage