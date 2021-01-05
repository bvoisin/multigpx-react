import React, {useEffect, useState} from 'react';
import Link from 'next/link'
import {DirectoryInfo} from 'pages/api/getDirectoryList';

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
            {dirList.map(dir => <li key={dir.name}><Link href={encodeURI(dir.name)}><a>{dir.name}</a></Link></li>)}
        </ul>
    </div>;
}