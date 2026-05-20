"use client"

import dynamic from "next/dynamic"

const MapaInteractivoClient = dynamic(
  () => import("./MapaInteractivoClient"),
  {
    ssr: false,
  }
)

export default MapaInteractivoClient