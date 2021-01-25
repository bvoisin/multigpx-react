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

    it('parseChantilly', async function () {
        const fileContent = await fsPromises.readFile('test/CC_Paris_Chantilly_120k-truncated.gpx', {encoding: 'utf8'})
        const d = parseToGpxFileInfo(fileContent, 'someDirectory', 'test.gpx');
        expect(d.traceName).toEqual('CC Paris Chantilly 120k')
        expect(d.athleteName).toBeUndefined()
        expect(d.link).toBeUndefined()
    })
})