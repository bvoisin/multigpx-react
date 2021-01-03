import L, {LatLngExpression} from 'leaflet';
import {useLeafletContext} from '@react-leaflet/core';
import {useEffect} from 'react';

export function Square(props: { center: LatLngExpression, size: number }) {
    const context = useLeafletContext()

    useEffect(() => {
        const bounds = L.latLng(props.center).toBounds(props.size)
        const square = new L.Rectangle(bounds)
        const container = context.layerContainer || context.map
        container.addLayer(square)

        return () => {
            container.removeLayer(square)
        }
    })

    return null
}