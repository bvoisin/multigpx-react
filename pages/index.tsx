import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';

const MyMap = dynamic(
    () => import('../components/myMap'),
    {ssr: false}
);


class Home extends React.Component {

    constructor(props, context) {
        super(props, context);

    }
    position = [48.864716, 2.349014] as [number, number]
    zoom = 13

    async dropHandler(event: React.DragEvent<HTMLDivElement>) {
        let file = event.dataTransfer.files[0];
        console.log('File(s) dropped ', {event, f: file});
        event.preventDefault();

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
            <div onDrop={e => this.dropHandler(e)} onDragOver={e => this.dragOverHandler(e)}>
                <MyMap center={this.position} zoom={this.zoom} style={{height: '100vh', width: '100vw'}}/>
            </div>
        </div>;
    }
}

const indexHome = () => {
    return <Home/>;
}

export default indexHome;