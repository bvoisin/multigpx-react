export class GpxFileInfo {
    constructor(readonly fileDirectory:string, readonly fileName: string, readonly doc: Document, readonly traceName: string, readonly athleteName: string, readonly link?: string) {
    }
}