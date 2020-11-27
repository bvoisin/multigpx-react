import {MapContainer, TileLayer} from 'react-leaflet';
import React from 'react';
import {LatLngExpression} from 'leaflet';

export default function MyMap({children, position, zoom = 10}: { children?: any, position: LatLngExpression, zoom: number }) {
    return (
        <MapContainer center={position} zoom={zoom} style={{height: '100vh', width: '100vw'}}>
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