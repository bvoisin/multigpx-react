import * as React from 'react'
import {parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';
import {promises as fsPromises} from 'fs';

describe('GpxParsing', () => {
    it('parse', async function () {
        const fileContent = await fsPromises.readFile('test/test.gpx', {encoding: 'utf8'})
        const d = parseToGpxFileInfo(fileContent, 'someDirectory', 'test.gpx');
        expect(d.traceName).toEqual('Small trace')
        expect(d.athleteName).toEqual('Benoit Voisin')
        expect(d.link).toEqual('https://test/url')
    })
})