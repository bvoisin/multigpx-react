import {LayersControl, TileLayer} from 'react-leaflet';
import React from 'react';
import {tileServers} from 'lib/tileServers';

export default function MyLayerControl(props: { xmasMode: boolean }) {
    const {xmasMode} = props;
    const startupTs = xmasMode ? 'dark' : 'def';

    return <LayersControl position="topright">
        {tileServers.map(ts => {
                return <LayersControl.BaseLayer checked={ts.code == startupTs} name={ts.name} key={ts.code}>
                    <TileLayer
                        attribution={ts.attribution}
                        url={ts.url}
                    />
                </LayersControl.BaseLayer>;
            }
        )
        }
    </LayersControl>;
}