import React from 'react'
import dynamic from 'next/dynamic';

const DynamicTestMap = dynamic(
    () => import('components/testMap'),
    {ssr: false}
);


export default function main() {
    return <DynamicTestMap/>
}