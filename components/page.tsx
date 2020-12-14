import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';
import {merge, Subject} from 'rxjs';
import FilePopup from 'components/filePopup';
import {reduceGpx} from 'lib/reduceGpx';
import {switchMap} from 'rxjs/operators';
import {parseToGpxFileInfo} from 'lib/parseToGpxFileInfo';
import {uploadGpx} from 'lib/upload';
import {GpxFileInfo} from 'pages/gpxFileInfo';
import {DroppedMapsContext, DroppedMapsContextType} from 'pages/droppedMapsContext';

const MyMap = dynamic(
    () => import('components/myMap'),
    {ssr: false}
);

interface PageProps {
    fileDirectory: string;
}

interface PageState {
    droppedMapsContext: DroppedMapsContextType;
    position: [number, number];
    zoom: number;
    shownFile?: GpxFileInfo
}

class Page extends React.Component<PageProps, PageState> {

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
                showFileInfo: f => this.showFileInfo(f),
                fileDirectory: props.fileDirectory
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
        return this.state && <div>
          <Head>
            <title>{this.state.droppedMapsContext.fileDirectory}</title>
          </Head>
          < DroppedMapsContext.Provider value={this.state.droppedMapsContext}>
            <div onDrop={e => this.dropHandler(e)} onDragOver={e => this.dragOverHandler(e)}>
              <MyMap center={this.state.position} zoom={this.state.zoom} style={{height: '100vh', width: '100vw'}}/>
            </div>
            <FilePopup file={this.state.shownFile} closePopup={() => this.showFileInfo(null)}/>
          </DroppedMapsContext.Provider>
        </div>;
    }
}

export default Page;