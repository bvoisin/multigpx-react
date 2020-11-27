import Head from 'next/head'
import Layout, {siteTitle} from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import React from 'react';
import useSWR from 'swr';

export default function Home(props) {
  // async function getList() {
  //   const res = await fetch(`api/getList`)
  //   const json = await res.json();
  //   console.log('getList ', {json});
  //
  //   return json;
  // }

  const {data, error} = useSWR(`api/getList`)

  return (
      <Layout home>
        <Head>
          <title>{siteTitle}</title>
        </Head>
        <section className={utilStyles.headingMd}>
          Data: {data}
          <br/>
          Error: {error}
        </section>
      </Layout>
  )
}