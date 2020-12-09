import Dialog from '@material-ui/core/Dialog';
import React from 'react';
import {DialogTitle} from '@material-ui/core';
import {GpxFileInfo} from 'pages';

export type FilePopupProps = { file: GpxFileInfo, closePopup?: () => void };

export default class FilePopup extends React.Component<FilePopupProps> {
    close() {
        console.log('Close');
        this.props.closePopup();
    }

    render() {

        return (
            <Dialog onClose={e => this.close()} open={!!this.props.file}>
                <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle>
                TODO
            </Dialog>
        );
    }
}