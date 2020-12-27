import {useLeafletContext} from '@react-leaflet/core';
import {createLeafletGpx} from 'lib/3rdParty/leafletgpx';
import {Layer, Path} from 'leaflet';
import {getIndexedColor} from 'lib/colors';
import {DisplayMode} from 'lib/mainPageContext';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import React, {useEffect} from 'react';


export interface GpxTraceProps {
    gpxFileInfo: GpxFileInfo
    displayMode: DisplayMode
}

const layersByGpxFileName = new Map<string, Layer>();

export default function GpxTrace({gpxFileInfo, displayMode}: GpxTraceProps) {
    const context = useLeafletContext()
    useEffect(() => {

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
            context.map.removeLayer(previousLayer);
            layersByGpxFileName.delete(gpxFileInfo.fileName)
        }

        const lgpx = createLeafletGpx(gpxFileInfo.doc, gpxOptions)
        lgpx['on']('loaded', function (e) {
            const gpx = e.target;
            // TODO flyToRequest(e.target.getBounds(), {}, true)

            if (displayMode == 'xmas' || displayMode == 'xmas2') {
                const tracePath: Path = gpx.getLayers()[0] as Path;
                const traceEl = tracePath.getElement();
                traceEl.classList.add('flashingTrace')
                // const delayOffset = Math.floor(Math.random() * 8);
                // traceEl.classList.add('flashingTrace_delay_' + delayOffset)
                // const durationOffset = Math.floor(Math.random() * 8);
                // traceEl.classList.add('flashingTrace_duration_' + durationOffset)
            }
            gpx.on('click', () => {
                // TODO showFile(gpxFileInfo);

                console.log('lgpx ', {layers: lgpx.getLayers(), lgpx})
                // lgpx.setStyle({color: 'white'})
            })
            gpx.bindTooltip(() => {
                // const link = gpxFileInfo.link;
                let author = gpxFileInfo.athleteName;
                return `<div><b>${gpxFileInfo.traceName}</b>` +
                    (author ? `<br/><b><i>${author}</i></b>` : '') +
                    // (link ? `<br/><a href=${link}>Link</a>` : '') +
                    '</div>';
            });
        }).addTo(context.map);
        layersByGpxFileName.set(gpxFileInfo.fileName, lgpx as Layer);
        return () => context.map.removeLayer(lgpx);
    })
    return null;
}
