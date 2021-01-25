import {Form, Formik} from 'formik';
import {TextField} from '@material-ui/core';
import {downloadXml, downloadXmlFull} from 'lib/io/download';
import React, {useContext} from 'react';
import {MainPageContext} from 'lib/mainPageContext';
import {updateTrace} from 'lib/io/updateTrace';
import {TraceDataWithXml} from 'lib/io/getTraces';

export function GpxTraceDetails({trace}: { trace: TraceDataWithXml }) {
    const {redrawFile} = useContext(MainPageContext)
    return <Formik initialValues={{...trace}}
                   onSubmit={values => {
                       return updateTrace({...trace, ...values}).then(() => {
                           redrawFile(trace);
                       });
                   }}>
        {props => <Form onSubmit={props.handleSubmit}>
            <TextField
                name="traceName"
                label="Trace Name"
                fullWidth
                value={props.values.traceName || ''}
                onChange={props.handleChange}/>
            <TextField
                name="athleteName"
                label="Athlete Name"
                type="text"
                fullWidth
                value={props.values.athleteName || ''}
                onChange={props.handleChange}/>
            <TextField
                name="link"
                type="text"
                label="Link (Strava or other)"
                fullWidth
                value={props.values.link || ''}
                onChange={props.handleChange}/>
            <button type="submit">Save</button>
            &nbsp;
            {props.values.link && <a href={props.values.link}>Link</a>}
            &nbsp;
            <a href="#" onClick={() => downloadXml(trace)}>GPX Light</a>
            &nbsp;
            <a href="#" onClick={() => downloadXmlFull(trace)}>GPX Full</a>
        </Form>}
    </Formik>;
}