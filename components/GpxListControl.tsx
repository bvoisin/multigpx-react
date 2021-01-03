import React, {useContext} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, TextField, Typography} from '@material-ui/core';
import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {updateGpxMetaInfo} from 'lib/gpx/parseToGpxFileInfo';
import {Form, Formik} from 'formik';
import {downloadXml} from 'lib/io/downloadInMemoryFile';
import {MainPageContext} from 'lib/mainPageContext';

export interface GpxListControlProps {
    fileList: GpxFileInfo[];
}


async function save(f: GpxFileInfo, values: Partial<GpxFileInfo>) {
    return updateGpxMetaInfo(f, values);
}

export function GpxListControl({fileList}: GpxListControlProps) {
    // Memoize the content so it's not affected by position changes
    const {selectedFileName, selectFile} = useContext(MainPageContext)

    const content = <div className="gpxList">
        {
            fileList.map(f =>
                <Accordion expanded={f.fileName === selectedFileName} onChange={() => selectFile(f)} key={'info' + f.fileName}>
                    <AccordionSummary>
                        <Typography>{f.fileName}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
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
    </div>;

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className="leaflet-control leaflet-bar">{content}</div>
        </div>
    )
}