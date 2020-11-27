import Head from 'next/head'
import React from 'react';
import dynamic from 'next/dynamic';

const MyMap = dynamic(
    () => import('../components/myMap'),
    {ssr: false}
);

export default function Home() {
    // const {data: fileList, error} = useSWR<GpxFileList>(`api/getList`)

    const position = [48.864716, 2.349014] as [number, number]
    const zoom = 13
    return (
        <div>
            <Head>
                <title>1km PSC</title>
            </Head>
            <div>
                <MyMap center={position} zoom={zoom} style={{height: '100vh', width: '100vw'}}/>
            </div>
        </div>
    )
}