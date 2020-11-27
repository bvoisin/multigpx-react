import {MapContainer, MapContainerProps, TileLayer} from 'react-leaflet';
import React from 'react';

// export default function MyMap({children, position, zoom = 10, whenCreated}: { children?: any, position: LatLngExpression, zoom: number, whenCreated?: (map: LeafletMap) => void }) {
export default function MyMap(opts: MapContainerProps) {
    return (
        <MapContainer {...opts}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/*<Marker position={position}>*/}
            {/*    <Popup>*/}
            {/*        A pretty CSS3 popup. <br/> Easily customizable.*/}
            {/*    </Popup>*/}
            {/*</Marker>*/}
        </MapContainer>
    );
}