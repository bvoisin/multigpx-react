import React from 'react';
import {GpxFileInfo} from 'pages';
import {Dialog, DialogTitle} from '@material-ui/core';

export type FilePopupProps = { file: GpxFileInfo, closePopup?: () => void };

export default class FilePopup extends React.Component<FilePopupProps> {
    close() {
        console.log('Close');
        this.props.closePopup();
    }

    render() {
        const f = this.props.file
        console.log('FilePopup', f)
        return f ? (
            <Dialog onClose={e => this.close()} open={true}>
                <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle>
                <div>{f.fileName}</div>
                <div>{f.traceName}</div>
                <div>{f.athleteName}</div>
            </Dialog>
        ) : null;
    }
}