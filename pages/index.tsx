import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';
import {uploadGpx} from '../lib/upload';

const MyMap = dynamic(
    () => import('../components/myMap'),
    {ssr: false}
);

export default function Home() {
    const position = [48.864716, 2.349014] as [number, number]
    const zoom = 13

    async function dropHandler(event: React.DragEvent<HTMLDivElement>) {
        console.log('File(s) dropped ', {event, f: event.dataTransfer.files[0]});
        event.preventDefault();
        await uploadGpx(event.dataTransfer.files[0]);
    }

    function dragOverHandler(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    return (
        <div>
            <Head>
                <title>1km PSC</title>
            </Head>
            <div onDrop={dropHandler} onDragOver={dragOverHandler}>
                <MyMap center={position} zoom={zoom} style={{height: '100vh', width: '100vw'}}/>
            </div>
        </div>
    )
}