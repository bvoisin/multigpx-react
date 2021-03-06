import {useLeafletContext} from '@react-leaflet/core';
import {createLeafletGpx} from 'lib/3rdParty/leafletgpx';
import {Path} from 'leaflet';
import {getIndexedColor} from 'lib/colors';
import {MainPageContext} from 'lib/mainPageContext';
import React, {useContext, useEffect, useState} from 'react';
import {TraceDataWithXml} from 'lib/io/getTraces';


export interface GpxTraceProps {
    trace: TraceDataWithXml;
    flashPeriodFactor?: number
}

export default function GpxTrace({trace, flashPeriodFactor = 1}: GpxTraceProps) {
    const leafletContext = useLeafletContext()
    const mainPageContext = useContext(MainPageContext)
    const [lgpx, setLgpx] = useState(null);

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

        const loadedLgpx = createLeafletGpx(trace.xml, gpxOptions)
        loadedLgpx['on']('loaded', function (e) {
            const gpx = e.target;
            mainPageContext.flyToRequest(e.target.getBounds(), {}, true)
            const tracePath: Path = gpx.getLayers()[0] as Path;
            const traceEl = tracePath.getElement();

            if (displayMode == 'xmas' || displayMode == 'xmas2') {
                traceEl.classList.add('flashingTrace')
            }

            gpx.on('click', () => {
                mainPageContext.selectFile(trace);
            })
            gpx.bindTooltip(() => {
                // const link = gpxFileInfo.link;
                let author = trace.athleteName;
                return `<div><b>${trace.traceName}</b>` +
                    (author ? `<br/><b><i>${author}</i></b>` : '') +
                    // (link ? `<br/><a href=${link}>Link</a>` : '') +
                    '</div>';
            });
        }).addTo(leafletContext.map);
        setLgpx(loadedLgpx)
        return () => {
            leafletContext.map.removeLayer(loadedLgpx);
            setLgpx(null);
        };
    }, [trace.athleteName, trace.traceName]);

    // flashing (XMax)
    useEffect(() => {
        let i = 0;
        let currentTimer: NodeJS.Timeout;

        function flash() {
            i++;
            const layer = lgpx && (lgpx as any).getLayers()[0];
            if (layer) {
                const traceEl = layer.getElement();
                if (i % 2) {
                    traceEl.classList.remove('flashingTraceA')
                    traceEl.classList.add('flashingTraceB')
                } else {
                    traceEl.classList.remove('flashingTraceB')
                    traceEl.classList.add('flashingTraceA')
                }
            } else {
                console.warn('no layer??', lgpx);
            }

            if (lgpx) {
                const ms = (i !== 0 ? 3000 : 0) + Math.random() * 4000 * flashPeriodFactor;
                currentTimer = setTimeout(flash, ms); // callback
            }
        }

        if (lgpx && (mainPageContext.displayMode == 'xmas' || mainPageContext.displayMode == 'xmas2')) {
            flash();
        }
        return () => {
            if (currentTimer) {
                clearTimeout(currentTimer);
            }
        }
    })

    // selection
    useEffect(() => {
        const layer = lgpx && (lgpx as any).getLayers()[0];
        if (layer) {
            const traceEl = layer.getElement();
            const setClass = (className: string, value: boolean) => {
                if (value) {
                    traceEl.classList.add(className)
                } else {
                    traceEl.classList.remove(className)
                }
            }
            setClass('notTheSelectedTrace', mainPageContext.selectedFileId && mainPageContext.selectedFileId !== trace._id)
            setClass('selectedTrace', mainPageContext.selectedFileId === trace._id)
        }

    });

    return null;
}
