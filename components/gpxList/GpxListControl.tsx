import React, {useContext, useLayoutEffect} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Collapse, createStyles, IconButton, makeStyles, Theme, Typography} from '@material-ui/core';
import {MainPageContext} from 'lib/mainPageContext';
import clsx from 'clsx';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {GpxTraceDetails} from 'components/gpxList/GpxTraceDetails';
import {TraceDataWithXml} from 'lib/io/getTraces';
import {reparseGpxFile} from 'lib/io/reparseGpxFile';
import ReplayIcon from '@material-ui/icons/Replay';

export interface GpxListControlProps {
    fileList: TraceDataWithXml[];
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: 345,
            border: '2px solid rgba(0, 0, 0, 0.2)',
            'background-clip': 'padding-box',
            padding: 5,
            'border-radius': 5,
            background: '#fff'
        },
        expand: {
            transform: 'rotate(0deg)',
            marginLeft: 'auto',
            transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest,
            })
        },
        expandOpen: {
            transform: 'rotate(180deg)'
        },
        traceAccordion: {
            '&.MuiAccordion-root.Mui-expanded': {
                background: 'lightgrey'
            },
            '& .MuiAccordionSummary-root': {
                'min-height': 25,
                '& .MuiAccordionSummary-content': {
                    margin: 0,
                    overflow: 'auto'
                },
                '& .MuiIconButton-root': {
                    padding: 0
                }
            }
        },
        traceName: {
            fontSize: theme.typography.pxToRem(12),
            fontWeight: theme.typography.fontWeightRegular,
            'text-overflow': 'ellipsis',
            'overflow-x': 'hidden'
        },
        distance: {
            fontSize: theme.typography.pxToRem(12),
            fontWeight: theme.typography.fontWeightRegular,
            fontStyle: 'italic'
        }, elevationGain: {
            fontSize: theme.typography.pxToRem(12),
            fontWeight: theme.typography.fontWeightRegular,
            fontStyle: 'italic'
        },
        header: {
            '& button': {
                padding: 2
            }
        },
        traceList: {
            maxHeight: '70vh',
            overflowY: 'auto'
        },
        details: {}
    }),
);

export function GpxListControl({fileList}: GpxListControlProps) {
    // Memoize the content so it's not affected by position changes
    const {selectedFileId, selectFile} = useContext(MainPageContext)
    const [opened, setOpened] = React.useState(false);
    const classes = useStyles();
    const selectedTraceRef = React.useRef<Element>(null);

    const content = <div className={classes.root} onWheel={event => event.stopPropagation()} onWheelCapture={event => event.stopPropagation()}>
        <div
            className={classes.header}
            onClick={e => {
                if (e.isTrusted) { // in DevTools/ mobileDevice simulator we receive 2 events ???
                    e.stopPropagation();
                    setOpened(!opened);
                }
            }}>
            <span>Trace List</span>
            <IconButton
                className={clsx(classes.expand, {
                    [classes.expandOpen]: opened,
                })}

                aria-expanded={opened}
                aria-label="show list"
            >
                <ExpandMoreIcon/>
            </IconButton>
        </div>
        <Collapse in={opened} timeout="auto" unmountOnExit className={classes.traceList}>
            {opened && fileList.map(f => {
                    const selected = f._id === selectedFileId;
                    return <Accordion key={'info' + f._id}
                                      ref={selected ? selectedTraceRef : undefined}
                                      className={classes.traceAccordion}
                                      expanded={selected}
                                      onChange={(e, expanded) => {
                                          if (e.isTrusted) { // in DevTools/ mobileDevice simulator we receive 2 events ???
                                              e.stopPropagation();
                                              selectFile(expanded && f);
                                          }
                                      }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography className={classes.traceName}>{f.traceName}</Typography>
                            {f.distance && <Typography className={classes.distance}> {f.distance.toLocaleString(undefined, {maximumFractionDigits: 0})}km</Typography>}
                            {f.elevationGain && <Typography className={classes.elevationGain}> ∆{f.elevationGain.toLocaleString(undefined, {maximumFractionDigits: 0})}m</Typography>}
                            {(window.location.href as string).startsWith('http://localhost') &&
                            <a onClick={() => reparseGpxFile(f._id).then()}><ReplayIcon style={{fontSize: '0.8rem'}}/></a>
                            }
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <GpxTraceDetails trace={f}/>
                        </AccordionDetails>
                    </Accordion>;
                }
            )
            }
        </Collapse>
    </div>;

    useLayoutEffect(() => {
        if (selectedTraceRef.current) {
            selectedTraceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    })

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className="leaflet-control">{content}</div>
        </div>
    )
}