import { NextRequest, NextResponse } from "next/server"
import * as PDFParse from "pdf-parse"

import { connectDB } from "@/lib/mongodb"
import Elector, { IElector } from "@/models/Elector"
import { getUserFromToken } from "@/lib/getUser"

// ─────────────────────────────────────────────────────────────
// POST
// Procesar archivo PDF y guardar electores
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // ─── Obtener token ─────────────────────────────
    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "No autorizado",
        },
        { status: 401 }
      )
    }

    // ─── Validar token ─────────────────────────────
    const user = getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Token inválido",
        },
        { status: 401 }
      )
    }

    // ─── Leer FormData (Archivo) ───────────────────
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        {
          ok: false,
          error: "No se subió ningún archivo bajo la clave 'file'",
        },
        { status: 400 }
      )
    }

    // ─── Convertir archivo a Buffer ────────────────
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ─── Procesar PDF ──────────────────────────────
    const pdfData = await (PDFParse as any)(buffer)
    const textoCompleto = pdfData.text

    // ─── Extraer cabecera ──────────────────────────
    const infoCabecera = extraerCabecera(textoCompleto)

    if (!infoCabecera) {
      return NextResponse.json(
        {
          ok: false,
          error: "No se pudo interpretar la cabecera del padrón",
        },
        { status: 400 }
      )
    }

    // ─── Parsear electores ─────────────────────────
    const electoresExtraidos = parsearElectores(
      textoCompleto,
      infoCabecera
    )

    if (electoresExtraidos.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "No se encontraron registros válidos de electores",
        },
        { status: 422 }
      )
    }

    // ─── Guardar en MongoDB ────────────────────────
    try {
      await Elector.insertMany(electoresExtraidos, {
        ordered: false,
      })
    } catch (bulkError) {
      console.log(
        "Padrón procesado: registros duplicados omitidos."
      )
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          mensaje: `Mesa ${infoCabecera.mesa} procesada con éxito`,
          registrosProcesados: electoresExtraidos.length,
          cabecera: infoCabecera,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        ok: false,
        error: "Error al procesar el padrón",
      },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES
// ─────────────────────────────────────────────────────────────

function extraerCabecera(texto: string) {
  const distritoMatch = texto.match(
    /DISTRITO\s+(\d+\s*-\s*[^_]+?)(?=\n|\s{2})/i
  )

  const seccionMatch = texto.match(
    /SECCIÓN\s+(\d+\s*-\s*[^_]+?)(?=\n|\s{2})/i
  )

  const circuitoMatch = texto.match(
    /CIRCUITO\s+(\d+\s*-\s*[^_]+?)(?=\n|\s{2})/i
  )

  const mesaMatch = texto.match(
    /MESA\s*N°\s*(\d+)/i
  )

  if (!seccionMatch || !circuitoMatch || !mesaMatch) {
    return null
  }

  return {
    distrito: distritoMatch
      ? `DISTRITO ${distritoMatch[1].trim()}`
      : "DISTRITO 22 - SANTIAGO DEL ESTERO",

    seccion: seccionMatch[1].trim(),
    circuito: circuitoMatch[1].trim(),
    mesa: mesaMatch[1].trim(),
  }
}

function parsearElectores(
  texto: string,
  cabecera: any
): IElector[] {
  const electores: IElector[] = []

  const lineas = texto.split("\n")

  // Regex para filas del padrón
  const electorRegex =
    /^(\d{3})\s+([A-ZÁÉÍÓÚÑ\s,]+?)\s+([^.\n]*?)\s+DOC:\s+([\d.]+)\s+([A-Z0-9-]+)\s+(\d{4})\s*(Votó)?$/i

  for (const linea of lineas) {
    const limpia = linea.trim()

    const match = limpia.match(electorRegex)

    if (match) {
      const [
        ,
        nOrden,
        apellidoNombre,
        domicilio,
        dniNro,
        dniTipo,
        anioNacimiento,
      ] = match

      electores.push({
        distrito: cabecera.distrito,
        seccion: cabecera.seccion,
        circuito: cabecera.circuito,
        mesa: cabecera.mesa,

        nOrden: parseInt(nOrden, 10),

        apellidoNombre: apellidoNombre.trim(),

        domicilio:
          domicilio.trim() || "SIN DOMICILIO",

        documento: {
          nro: parseInt(
            dniNro.replace(/\./g, ""),
            10
          ),

          tipo: dniTipo.trim(),
        },

        anioNacimiento: parseInt(
          anioNacimiento,
          10
        ),

        voto: false,
      })
    }
  }

  return electores
}