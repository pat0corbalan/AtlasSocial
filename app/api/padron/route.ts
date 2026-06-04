import { NextRequest, NextResponse } from "next/server"
import PDFParser from "pdf2json"

import { connectDB } from "@/lib/mongodb"
import Elector from "@/models/Elector"
import { getUserFromToken } from "@/lib/getUser"

export const runtime = "nodejs"

interface PDFTextToken {
  x: number
  y: number
  text: string
}

interface Cabecera {
  mesa: string
  seccion: string
  circuito: string
  distrito: string
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // 1. Validar la sesión/token
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 })
    }

    const user = getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 401 })
    }

    // 2. Extraer los query params de la URL
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    // 3. Construir el filtro de búsqueda dinámico y flexible
    let query: any = {}

    if (search.trim() !== "") {
      const cleanSearch = search.trim()

      // Si es un número, buscamos exactamente por DNI, N° de Orden o número de Mesa
      if (!isNaN(Number(cleanSearch))) {
        const numSearch = Number(cleanSearch)
        query.$or = [
          { "documento.nro": numSearch },
          { nOrden: numSearch },
          { mesa: cleanSearch }
        ]
      } else {
        // Si es texto, dividimos la búsqueda por palabras independientes para permitir cualquier orden
        const palabras = cleanSearch.split(/\s+/).filter(Boolean)
        
        if (palabras.length > 0) {
          // El operador $and asegura que el registro contenga todas las palabras ingresadas en apellidoNombre
          query.$and = palabras.map(palabra => ({
            apellidoNombre: { $regex: palabra, $options: "i" }
          }))
        }
      }
    }

    // 4. Realizar la consulta paginada en MongoDB
    const electores = await Elector.find(query)
      .sort({ nOrden: 1 }) // Ordenados por número de orden de mesa por defecto
      .skip(skip)
      .limit(limit)
      .lean()

    // Count total de documentos que coinciden con la búsqueda
    const total = await Elector.countDocuments(query)

    return NextResponse.json({
      ok: true,
      data: {
        electores,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    })

  } catch (error: any) {
    console.error("Error en GET /api/padron:", error)
    return NextResponse.json({ ok: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 })
    }

    const user = getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No se subió ningún archivo bajo la clave 'file'" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfParser = new PDFParser()

    const paginasTokens: PDFTextToken[][] = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError))
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        const paginas = pdfData.Pages.map((page: any) => {
          return page.Texts.map((t: any) => ({
            x: t.x,
            y: t.y,
            text: decodeURIComponent(t.R[0].T).trim()
          }))
        })
        resolve(paginas)
      })

      pdfParser.parseBuffer(buffer)
    })

    if (paginasTokens.length <= 2) {
      return NextResponse.json({ ok: false, error: "El PDF es muy corto" }, { status: 400 })
    }

    let cabecera: Cabecera | null = null
    for (let i = 2; i < paginasTokens.length; i++) {
      cabecera = extraerCabeceraDeTokens(paginasTokens[i])
      if (cabecera) break
    }

    if (!cabecera) {
      return NextResponse.json({ ok: false, error: "No se encontró cabecera" }, { status: 400 })
    }

    const todosLosElectores: any[] = []
    
    for (let i = 2; i < paginasTokens.length; i++) {
      const electoresPagina = parsearPaginaElectoral(paginasTokens[i], cabecera)
      todosLosElectores.push(...electoresPagina)
    }

    if (todosLosElectores.length === 0) {
      return NextResponse.json({ ok: false, error: "No se encontraron electores" }, { status: 422 })
    }

    const batchSize = 1000
    for (let i = 0; i < todosLosElectores.length; i += batchSize) {
      const chunk = todosLosElectores.slice(i, i + batchSize)
      const operations = chunk.map(elector => ({
        updateOne: {
          filter: { "documento.nro": elector.documento.nro, mesa: elector.mesa },
          update: { $set: elector },
          upsert: true
        }
      }))
      await Elector.bulkWrite(operations, { ordered: false })
    }

    return NextResponse.json({
      ok: true,
      data: {
        mensaje: `Mesa ${cabecera.mesa} procesada`,
        registrosProcesados: todosLosElectores.length,
        cabecera,
      },
    })

  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

function parsearPaginaElectoral(tokens: PDFTextToken[], cabecera: Cabecera): any[] {
  const tokensDatos = tokens.filter(t => t.y > 9.5)
  const columnaIzquierda = tokensDatos.filter(t => t.x < 14.8)
  const columnaDerecha = tokensDatos.filter(t => t.x >= 14.8)

  const electores: any[] = []
  procesarColumnaCNE(columnaIzquierda, cabecera, electores)
  procesarColumnaCNE(columnaDerecha, cabecera, electores)

  return electores
}

function procesarColumnaCNE(tokens: PDFTextToken[], cabecera: Cabecera, poolElectores: any[]) {
  tokens.sort((a, b) => (Math.abs(a.y - b.y) < 0.25 ? a.x - b.x : a.y - b.y))

  let textoColumna = tokens.map(t => t.text).join(" ").replace(/\s+/g, " ")
  textoColumna = textoColumna.replace(/N\s*O\s*R\s*D\s*E\s*N/gi, "N ORDEN")

  // FIX: Se cambió 'de' por 'of' y se agregaron tipos
  const bloques: string[] = textoColumna.split(/N ORDEN/i)

  for (const bloque of bloques) {
    const cuerpo: string = bloque.trim()
    if (!cuerpo) continue

    const matchDni = cuerpo.match(/DOC:\s*([\d.]+)/i)
    if (!matchDni) continue

    const dniNro = Number(matchDni[1].replace(/\./g, ""))
    const matchTipo = cuerpo.match(/(?:DOC:[\d.]+\s+)?(DNI[-A-Z0-9]*|L[C|E|T]*|LIBRETA)/i)
    const dniTipo = matchTipo ? matchTipo[1] : "DNI"
    const matchAnio = cuerpo.match(/\b(\d{4})\b/)
    const anioNacimiento = matchAnio ? Number(matchAnio[1]) : 0
    const matchNOrden = cuerpo.match(/\b(\d{1,3})\b(?!\s*[\d.]{5,})/) 
    const nOrden = matchNOrden ? Number(matchNOrden[1]) : 0

    const infoPreviaDni = cuerpo.split(/DOC:/i)[0].trim()
    const partesNombre = infoPreviaDni.match(/^([A-ZÁÉÍÓÚÑ\s,]+?)(?=\s+[a-záéíóúñ0-9°]|\bS\/N\b|\bSIN\b|\bKM\b|\bAV\b|\bC\s*\/\s*|\bBARRIO\b|$)/)
    
    let apellidoNombre = "DESCONOCIDO"
    let domicilio = "SIN DOMICILIO"

    if (partesNombre) {
      apellidoNombre = partesNombre[1].trim()
      domicilio = infoPreviaDni.replace(apellidoNombre, "").trim()
    } else {
      apellidoNombre = infoPreviaDni
    }

    if (dniNro > 0) {
      poolElectores.push({
        distrito: cabecera.distrito,
        seccion: cabecera.seccion,
        circuito: cabecera.circuito,
        mesa: cabecera.mesa,
        nOrden,
        apellidoNombre,
        domicilio: domicilio || "SIN DOMICILIO",
        documento: { nro: dniNro, tipo: dniTipo },
        anioNacimiento,
        voto: false,
      })
    }
  }
}

function extraerCabeceraDeTokens(tokens: PDFTextToken[]): Cabecera | null {
  const tokensSuperiores = tokens.filter(t => t.y < 12)
  tokensSuperiores.sort((a, b) => (Math.abs(a.y - b.y) < 0.2 ? a.x - b.x : a.y - b.y))

  let texto = tokensSuperiores.map(t => t.text).join(" ").replace(/\s+/g, " ").toUpperCase()
  texto = texto.replace(/N\s*[°°ºº]\s*/g, "N° ").replace(/SECCI\s*Ó\s*N/g, "SECCION")

  const mesaMatch = texto.match(/MESA\s*N°\s*(\d+)/i) || texto.match(/MESA\s+(\d+)/i)
  if (!mesaMatch) return null

  const seccionMatch = texto.match(/SECCION\s*(?:ELECTORAL)?\s*:\s*([A-Z0-9.\-\s]+?)(?=CIRCUITO|MESA|$)/i) ||
                       texto.match(/SECCION\s*([A-Z0-9.\-\s]+?)(?=CIRCUITO|MESA|$)/i)
  const circuitoMatch = texto.match(/CIRCUITO\s*:\s*([A-Z0-9.\-\s]+?)(?=MESA|SECCI|$)/i) ||
                        texto.match(/CIRCUITO\s*([A-Z0-9.\-\s]+?)(?=MESA|SECCI|$)/i)
  const distritoMatch = texto.match(/DISTRITO\s*:\s*([A-Z0-9.\-\s]+?)(?=SECCI|CIRCUITO|REPUBLICA|$)/i)

  return {
    mesa: mesaMatch[1].trim(),
    seccion: seccionMatch?.[1]?.trim() || "SIN SECCION",
    circuito: circuitoMatch?.[1]?.trim() || "SIN CIRCUITO",
    distrito: distritoMatch?.[1]?.trim() || "SANTIAGO DEL ESTERO",
  }
}