import {useLeafletContext} from '@react-leaflet/core';
import {createLeafletGpx} from 'lib/3rdParty/leafletgpx';
import {Layer, Path} from 'leaflet';
import {getIndexedColor} from 'lib/colors';
import {MainPageContext} from 'lib/mainPageContext';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import React, {useContext, useEffect} from 'react';


export interface GpxTraceProps {
    gpxFileInfo: GpxFileInfo
}

const layersByGpxFileName = new Map<string, Layer>();

export default function GpxTrace({gpxFileInfo}: GpxTraceProps) {
    const leafletContext = useLeafletContext()
    const mainPageContext = useContext(MainPageContext)
    useEffect(() => {
        const displayMode = mainPageContext.displayMode

        const gpxOptions = {
            async: true,
            marker_options: {
                startIconUrl: '', //'img/pin-icon-start.png',
                endIconUrl: '', // 'img/pin-icon-end.png',
                shadowUrl: '' // 'img/pin-shadow.png'
            },
            polyline_options: {
                color: getIndexedColor(displayMode),
                opacity: 0.90,
                weight: 3,
                fill: displayMode == 'def',
                fillOpacity: (displayMode == 'def') && 0.1
            }
        };

        let previousLayer = layersByGpxFileName.get(gpxFileInfo.fileName);
        if (previousLayer) {
            leafletContext.map.removeLayer(previousLayer);
            layersByGpxFileName.delete(gpxFileInfo.fileName)
        }

        const lgpx = createLeafletGpx(gpxFileInfo.doc, gpxOptions)
        lgpx['on']('loaded', function (e) {
            const gpx = e.target;
            mainPageContext.flyToRequest(e.target.getBounds(), {}, true)
            const tracePath: Path = gpx.getLayers()[0] as Path;
            const traceEl = tracePath.getElement();

            if (displayMode == 'xmas' || displayMode == 'xmas2') {
                traceEl.classList.add('flashingTrace')
            }

            gpx.on('click', () => {
                mainPageContext.showFileInfo(gpxFileInfo);
                console.log('lgpx ', {layers: lgpx.getLayers(), lgpx})
            })
            gpx.bindTooltip(() => {
                // const link = gpxFileInfo.link;
                let author = gpxFileInfo.athleteName;
                return `<div><b>${gpxFileInfo.traceName}</b>` +
                    (author ? `<br/><b><i>${author}</i></b>` : '') +
                    // (link ? `<br/><a href=${link}>Link</a>` : '') +
                    '</div>';
            });
        }).addTo(leafletContext.map);
        layersByGpxFileName.set(gpxFileInfo.fileName, lgpx as Layer);
        return () => leafletContext.map.removeLayer(lgpx);
    })
    return null;
}
