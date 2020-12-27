import {DisplayMode} from 'lib/mainPageContext';

export const stdColors = [
    '#d34f00',
    '#b96500',
    '#a57000',
    '#937800',
    '#817f00',
    '#6c8500',
    '#4f8a00',
    '#009004',
    '#008f42',
    '#008e5d',
    '#008d6f',
    '#008c7d',
    '#008b89',
    '#008a94',
    '#00899f',
    '#0088aa',
    '#0086b7',
    '#0084c7',
    '#0081dc',
    '#007afe',
    '#606fff',
    '#8f5dff',
    '#bc3afc',
    '#db00dd',
    '#e400b5',
    '#e90096',
    '#ed007a',
    '#f0005e',
    '#f2003f',
    '#f30011'
]
const xmasColors = [
    '#FFFF00',
    '#00FFFF',
    '#FF00FF',
    '#00FF00',
    '#0000FF',
    '#FF0000'
]
let colorIndex = 0;

export function getIndexedColor(displayMode: DisplayMode) {
    const colors = displayMode == 'def' ? stdColors : xmasColors;
    return colors[((colorIndex++) * 37) % colors.length];
}