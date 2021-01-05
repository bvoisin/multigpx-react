import React, {useContext} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Collapse, createStyles, IconButton, makeStyles, TextField, Theme, Typography} from '@material-ui/core';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {updateGpxMetaInfo} from 'lib/gpx/parseToGpxFileInfo';
import {Form, Formik} from 'formik';
import {downloadXml} from 'lib/io/downloadInMemoryFile';
import {MainPageContext} from 'lib/mainPageContext';
import clsx from 'clsx';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

export interface GpxListControlProps {
    fileList: GpxFileInfo[];
}


async function save(f: GpxFileInfo, values: Partial<GpxFileInfo>) {
    return updateGpxMetaInfo(f, values);
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
        details: {}
    }),
);

export function GpxListControl({fileList}: GpxListControlProps) {
    // Memoize the content so it's not affected by position changes
    const {selectedFileName, selectFile} = useContext(MainPageContext)
    const [opened, setOpened] = React.useState(false);
    const classes = useStyles();

    const content = <div className={classes.root}>
        <div
            className={classes.header}
            onClick={(e) => {
                console.log('Opening GpxListControl ' + opened + ' ' + e.isTrusted, e)
                if (e.isTrusted) {
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
        <Collapse in={opened} timeout="auto" unmountOnExit>
            {
                fileList.map(f =>
                    <Accordion key={'info' + f.fileName}
                               className={classes.traceAccordion}
                               expanded={f.fileName === selectedFileName}
                               onChange={(event, expanded) => selectFile(expanded && f)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography className={classes.traceName}>{f.traceName}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <Formik initialValues={{...f}}
                                    onSubmit={values => {
                                        save(f, values);
                                    }}>
                                {props => <Form onSubmit={props.handleSubmit}>
                                    <TextField
                                        name="traceName"
                                        label="Trace Name"
                                        fullWidth
                                        value={props.values.traceName}
                                        onChange={props.handleChange}/>
                                    <TextField
                                        name="athleteName"
                                        label="Athlete Name"
                                        type="text"
                                        fullWidth
                                        value={props.values.athleteName}
                                        onChange={props.handleChange}/>
                                    <TextField
                                        name="link"
                                        type="text"
                                        label="Link (Strava or other)"
                                        fullWidth
                                        value={props.values.link}
                                        onChange={props.handleChange}/>
                                    <button type="submit">Save</button>
                                    &nbsp;
                                    {props.values.link && <a href={props.values.link}>Link</a>}
                                    &nbsp;
                                    <a href="#" onClick={() => downloadXml(f.fileName, f.doc)}>GPX</a>
                                </Form>
                                }
                            </Formik>
                        </AccordionDetails>
                    </Accordion>
                )
            }
        </Collapse>
    </div>;

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className="leaflet-control">{content}</div>
        </div>
    )
}