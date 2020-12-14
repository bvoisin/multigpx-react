import React from 'react';
import {Dialog, DialogContent, DialogTitle, TextField} from '@material-ui/core';
import {Form, Formik} from 'formik';
import {updateGpxMetaInfo} from 'lib/parseToGpxFileInfo';
import {GpxFileInfo} from 'pages/gpxFileInfo';
import {DroppedMapsContext} from 'pages/droppedMapsContext';

export type FilePopupProps = { file: GpxFileInfo, closePopup?: () => void };


export default class FilePopup extends React.Component<FilePopupProps, { file: GpxFileInfo }> {

    constructor(props) {
        super(props);
        this.state = {file: props.file};
    }

    render() {
        const f = this.props.file
        if (!f) {
            return null;
        }
        console.log('FilePopup', f)
        return <DroppedMapsContext.Consumer>
            {({newGpxFilesToDraw$, showFileInfo, newGpxFileToDraw}) =>
                <Formik initialValues={{...f}}
                        onSubmit={values => {
                            this.save(f, values).then(fileInfo => newGpxFileToDraw(fileInfo));
                        }}>
                    {props =>
                        <Dialog onClose={e => this.props.closePopup()} open={true} aria-labelledby="form-dialog-title">
                            <DialogTitle id="simple-dialog-title">{f.traceName}</DialogTitle>
                            <DialogContent>
                                <Form onSubmit={props.handleSubmit}>
                                    <TextField
                                        id="traceName"
                                        name="traceName"
                                        label="Trace Name"
                                        fullWidth
                                        value={props.values.traceName}
                                        onChange={props.handleChange}/>
                                    <TextField
                                        id="athleteName"
                                        name="athleteName"
                                        label="Athlete Name"
                                        type="text"
                                        fullWidth
                                        value={props.values.athleteName}
                                        onChange={props.handleChange}/>
                                    <TextField
                                        id="link"
                                        name="link"
                                        type="text"
                                        label="Link (Strava or other)"
                                        fullWidth
                                        value={props.values.link}
                                        onChange={props.handleChange}/>
                                    <button type="submit">Save</button>
                                </Form>
                            </DialogContent>
                        </Dialog>

                    }
                </Formik>
            }</DroppedMapsContext.Consumer>
    }

    private async save(f: GpxFileInfo, values: Partial<GpxFileInfo>) {
        return updateGpxMetaInfo(f, values);
    }
}