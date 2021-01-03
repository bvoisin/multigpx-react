import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {Form, Formik} from 'formik';
import {TextField} from '@material-ui/core';
import {downloadXml} from 'lib/io/downloadInMemoryFile';
import React from 'react';
import {updateGpxMetaInfo} from 'lib/gpx/parseToGpxFileInfo';

export function GpxTraceDetails({gpxFileInfo}: { gpxFileInfo: GpxFileInfo }) {
    return <Formik initialValues={{...gpxFileInfo}}
                   onSubmit={values => updateGpxMetaInfo(gpxFileInfo, values)}>
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
            <a href="#" onClick={() => downloadXml(gpxFileInfo.fileName, gpxFileInfo.doc)}>GPX</a>
        </Form>}
    </Formik>;
}