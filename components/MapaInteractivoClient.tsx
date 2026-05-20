// components/MapaInteractivoClient.tsx
"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Solución definitiva al bug de iconos rotos de Leaflet en Next.js
const iconDefault = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = iconDefault

interface MapaInteractivoProps {
  lat: number
  lng: number
  onChangeCoords: (lat: string, lng: string) => void
}

function ActualizarVistaMapa({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])

  return null
}

function ManejadorClicks({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })

  return null
}

export default function MapaInteractivoClient({
  lat,
  lng,
  onChangeCoords,
}: MapaInteractivoProps) {
  const center: [number, number] = useMemo(() => [lat, lng], [lat, lng])

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-border relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ActualizarVistaMapa center={center} />

        <ManejadorClicks
          onClick={(newLat, newLng) =>
            onChangeCoords(newLat.toFixed(6), newLng.toFixed(6))
          }
        />

        <Marker
          position={center}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target
              const position = marker.getLatLng()

              onChangeCoords(
                position.lat.toFixed(6),
                position.lng.toFixed(6)
              )
            },
          }}
        />
      </MapContainer>
    </div>
  )
}