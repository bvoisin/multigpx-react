import React, {useContext, useLayoutEffect} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Collapse, createStyles, IconButton, makeStyles, Theme, Typography} from '@material-ui/core';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {MainPageContext} from 'lib/mainPageContext';
import clsx from 'clsx';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {GpxTraceDetails} from 'components/gpxList/GpxTraceDetails';

export interface GpxListControlProps {
    fileList: GpxFileInfo[];
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
                    margin: 0
                },
                '& .MuiIconButton-root': {
                    padding: 0
                }
            }
        },
        traceName: {
            fontSize: theme.typography.pxToRem(12),
            fontWeight: theme.typography.fontWeightRegular,
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
    const {selectedFileName, selectFile} = useContext(MainPageContext)
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
                    const selected = f.fileName === selectedFileName;
                    return <Accordion key={'info' + f.fileName}
                                      ref={selected ? selectedTraceRef : undefined}
                                      className={classes.traceAccordion}
                                      expanded={selected}
                                      onChange={(event, expanded) => selectFile(expanded && f)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography className={classes.traceName}>{f.traceName}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <GpxTraceDetails gpxFileInfo={f}/>
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