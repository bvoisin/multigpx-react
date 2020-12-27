import {useLeafletContext} from '@react-leaflet/core';
import React, {useEffect} from 'react';
import {Observable} from 'rxjs';
import {FlyToCommand} from 'lib/mainPageContext';


export interface FlyToSupportProps {
    flyToCommand$: Observable<FlyToCommand>
}

export default function FlyToSupport({flyToCommand$}: FlyToSupportProps) {
    const context = useLeafletContext()

    useEffect(() => {

        const subscription = flyToCommand$.subscribe(cmd => {
            console.log('Fly To ', cmd)
            context.map.flyToBounds(cmd.bounds, {animate: true, duration: 1, noMoveStart: true, ...cmd.options})
        });
        return () => subscription.unsubscribe();
    })
    return null;
}
