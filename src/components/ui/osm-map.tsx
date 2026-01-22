"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js/React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type OsmMapProps = {
    lat: number;
    lng: number;
};

// Component to handle map centering when coords change
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 16);
    }, [lat, lng, map]);
    return null;
}

export default function OsmMap({ lat, lng }: OsmMapProps) {
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} />
            <MapUpdater lat={lat} lng={lng} />
        </MapContainer>
    );
}
