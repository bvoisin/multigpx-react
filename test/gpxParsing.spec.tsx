import * as React from 'react'
import {ParsedData, parseToGpxFileInfo} from 'lib/gpx/parseToGpxFileInfo';
import {promises as fsPromises} from 'fs';

import next from "next";

function checkDistance(d: ParsedData, stravaDistance: number) {
    const tolerance = 0.02
    expect(d.distance).toBeGreaterThan(stravaDistance * (1 - tolerance))
    expect(d.distance).toBeLessThan(stravaDistance * (1 + tolerance))
}
function checkElevationGain(d: ParsedData, stravaGain: number, stravaLoss: number) {
    const tolerance = 0.05
    expect(d.elevationGain).toBeGreaterThan(stravaGain * (1 - tolerance))
    expect(d.elevationGain).toBeLessThan(stravaGain * (1 + tolerance))

    expect(d.elevationLoss).toBeGreaterThan(stravaLoss * (1 - tolerance))
    expect(d.elevationLoss).toBeLessThan(stravaLoss * (1 + tolerance))
}

/**
 * mandatory so that .env.test is read
 */
next({});

describe('GpxParsing', () => {
    it('parse', async function () {
        const fileContent = await fsPromises.readFile('test/test.gpx', {encoding: 'utf8'})
        const d = parseToGpxFileInfo(fileContent,  'test.gpx');
        expect(d.traceName).toEqual('Small trace')
        expect(d.athleteName).toEqual('Benoit Voisin')
        expect(d.link).toEqual('https://test/url')

        expect(d.distance).toBeGreaterThan(1)
    })

    it('parseChantilly', async function () {
        const fileContent = await fsPromises.readFile('test/CC_Paris_Chantilly_120k.gpx', {encoding: 'utf8'})
        const d = parseToGpxFileInfo(fileContent,  'test.gpx');
        expect(d.traceName).toEqual('CC Paris Chantilly 120k')
        expect(d.athleteName).toBeUndefined()
        expect(d.link).toBeUndefined()
        console.log('info', d);
        checkDistance(d, 96.14);
    })

    it('external', async function () {
        const fileContent = await fsPromises.readFile('test/Gravel - Paris Sud 60k.gpx', {encoding: 'utf8'})
        const d = parseToGpxFileInfo(fileContent,  'test.gpx');
        console.log('info', d);
        checkDistance(d, 64.65);
        checkElevationGain(d, 378, 378)
    })
})