import {LayersControl, TileLayer} from 'react-leaflet';
import React from 'react';
import {tileServers} from 'lib/tileServers';

export default function MyLayerControl() {
    return <LayersControl position="topright">
        {tileServers.map(ts =>
            <LayersControl.BaseLayer checked={ts.code == 'def'} name={ts.name} key={ts.code}>
                <TileLayer
                    attribution={ts.attribution}
                    url={ts.url}
                />
            </LayersControl.BaseLayer>
        )
        }
    </LayersControl>;
}