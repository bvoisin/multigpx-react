import Head from 'next/head'
import Layout, {siteTitle} from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import React from 'react';
import useSWR from 'swr';
import {GpxFileList} from '../pages/api/getList';

export default function Home() {
    // async function getList() {
    //   const res = await fetch(`api/getList`)
    //   const json = await res.json();
    //   console.log('getList ', {json});
    //
    //   return json;
    // }

    const {data: fileList, error} = useSWR<GpxFileList>(`api/getList`)

    return (
        <Layout home>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <section className={utilStyles.headingMd}>
                Data:
                <ul>
                    {fileList?.map(f => <li key={f.key}>{f.key} <a href={f.url}>Link</a></li>)}
                </ul>
                <br/>
                Error: {error}
            </section>
        </Layout>
    )
}