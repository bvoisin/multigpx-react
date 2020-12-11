import React from 'react';
import {GpxFileInfo} from 'pages';
import {Dialog, DialogTitle} from '@material-ui/core';
import {Field, Form, Formik} from 'formik';
import {updateGpxMetaInfo} from 'lib/parseToGpxFileInfo';

export type FilePopupProps = { file: GpxFileInfo, closePopup?: () => void };


export default class FilePopup extends React.Component<FilePopupProps, { file: GpxFileInfo }> {

    constructor(props) {
        super(props);
        this.state = {file: props.file};
    }

    close() {
        console.log('Close');
        this.props.closePopup();
    }

    render() {
        const f = this.props.file
        console.log('FilePopup', f)
        return f ? (
            <Formik initialValues={{...f}}

                    onSubmit={(values => {
                        updateGpxMetaInfo(f, values);
                    })}
            >
                <Dialog onClose={e => this.close()} open={true}>
                    <DialogTitle id="simple-dialog-title">{f.traceName}</DialogTitle>
                    <Form>
                        <Field
                            id="traceName"
                            name="traceName"
                            type="text">
                        </Field>
                        <Field
                            id="athleteName"
                            name="athleteName"
                            type="text">
                        </Field>
                        <Field
                            id="link"
                            name="link"
                            type="text">
                        </Field>
                        <button type="submit">Submit</button>
                    </Form>
                </Dialog>
            </Formik>

        ) : null;
    }
}