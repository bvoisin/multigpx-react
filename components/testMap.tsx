import {Circle, FeatureGroup, LayerGroup, LayersControl, MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import React from 'react';
import {LatLngExpression} from 'leaflet';

const center: LatLngExpression = [48.864716, 2.4]

export default function TestMap() {
    return <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{height: '100vh', width: '100vw'}}>
        <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap.Mapnik">
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenStreetMap.BlackAndWhite">
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
                />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay name="Marker with popup">
                <Marker position={center}>
                    <Popup>
                        A pretty CSS3 popup. <br/> Easily customizable.
                    </Popup>
                </Marker>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Layer group with circles">
                <LayerGroup>
                    <Circle
                        center={center}
                        pathOptions={{fillColor: 'blue'}}
                        radius={200}
                    />
                    <Circle
                        center={center}
                        pathOptions={{fillColor: 'red'}}
                        radius={100}
                        stroke={false}
                    />
                    <LayerGroup>
                        <Circle
                            center={[48.8564716, 2.4]}
                            pathOptions={{color: 'green', fillColor: 'green'}}
                            radius={100}
                        />
                    </LayerGroup>
                </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Feature group">
                <FeatureGroup pathOptions={{color: 'purple'}}>
                    <Popup>Popup in FeatureGroup</Popup>
                    <Circle center={[48.874716, 2.4]} radius={200}/>
                </FeatureGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Feature group2">
                <FeatureGroup pathOptions={{color: 'purple'}}>
                    <Popup>Popup in FeatureGroup</Popup>
                    <Circle center={[48.864716, 2.42]} radius={200}/>
                </FeatureGroup>
            </LayersControl.Overlay>
        </LayersControl>
    </MapContainer>;
}