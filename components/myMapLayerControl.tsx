import {LayersControl, TileLayer} from 'react-leaflet';
import React from 'react';
import {tileServers} from 'lib/tileServers';
import {DisplayMode} from 'lib/mainPageContext';

export default function MyLayerControl(props: { displayMode: DisplayMode }) {
    const {displayMode} = props;
    const startupTs = displayMode == 'def' ? 'def' : 'dark';

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