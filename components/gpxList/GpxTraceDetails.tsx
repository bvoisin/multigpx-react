import {GpxFileInfo} from 'lib/gpx/gpxFileInfo';
import {Form, Formik} from 'formik';
import {TextField} from '@material-ui/core';
import {downloadXml} from 'lib/io/downloadInMemoryFile';
import React, {useContext} from 'react';
import {updateGpxMetaInfo} from 'lib/gpx/parseToGpxFileInfo';
import {MainPageContext} from 'lib/mainPageContext';

export function GpxTraceDetails({gpxFileInfo}: { gpxFileInfo: GpxFileInfo }) {
    const {drawFile} = useContext(MainPageContext)
    return <Formik initialValues={{...gpxFileInfo}}
                   onSubmit={values => {
                       return updateGpxMetaInfo(gpxFileInfo, values).then(f => {
                           drawFile(f);
                       });
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
            <a href="#" onClick={() => downloadXml(gpxFileInfo.fileName, gpxFileInfo.doc)}>GPX</a>
        </Form>}
    </Formik>;
}