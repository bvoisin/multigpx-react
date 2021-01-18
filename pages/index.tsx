import React, {useEffect, useState} from 'react';
import Link from 'next/link'
import {DirectoryInfo} from 'lib/api/MongoDao';
import _ from 'lodash';

// noinspection JSUnusedGlobalSymbols
export default function IndexPage() {
    const [dirList, setDirList] = useState<DirectoryInfo[]>([]);

    useEffect(() => {
        fetch(`api/getDirectoryList`)
            .then(res => res.json())
            .then(lst => setDirList(lst));
    }, []);
    return <div>
        MultiGPX Maps for the Paris Sport Club
        <ul>
            {_.sortBy(dirList, d => d.name).map(dir => <li key={dir.name}><Link href={encodeURI(dir.name)}><a>{dir.name} <i>({dir.nbTraces})</i></a></Link></li>)}
        </ul>
    </div>;
}