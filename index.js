const express = require('express')
const soap = require('soap')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const app = express()
const PORT = process.env.PORT || 3000

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}-${m}-${y}`
}

function calcularProductos(productos, hoyISO) {
  const hoy = new Date(hoyISO)
  const porVencer = []
  const vencidos = []

  productos.forEach(producto => {
    const fechaVencimiento = new Date(producto.customerData.FechaVencimiento)
    const diasRetiro = producto.customerData.DiasRetiro || 0
    const diasRestantes = Math.floor((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))
    const fechaRetiro = new Date(fechaVencimiento)
    fechaRetiro.setDate(fechaRetiro.getDate() - diasRetiro)

    let estado
    if (diasRestantes < 0) {
      estado = 'VENCIDO'
    } else if (hoy >= fechaRetiro) {
      estado = 'CRITICO'
    } else {
      estado = 'NORMAL'
    }

    const productoCalculado = {
      ...producto,
      calculado: {
        diasRestantes,
        fechaRetiro: formatDate(fechaRetiro),
        fechaVencimientoFormateada: formatDate(fechaVencimiento),
        estado
      }
    }

    if (diasRestantes < 0) {
      vencidos.push(productoCalculado)
    } else if (hoy >= fechaRetiro) {
      porVencer.push(productoCalculado)
    }
  })

  return { porVencer, vencidos }
}

function normalizarProductos(raw) {
    if (Array.isArray(raw)) return raw
  
    if (typeof raw === 'string') {
      // Intentar como JSON primero
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : Object.values(parsed)
      } catch (e) {
        // Es CSV, parsearlo
        const rows = parse(raw, {
          delimiter: ';',
          columns: true,
          skip_empty_lines: true
        })
        return rows.map(row => ({
          _id: row._id,
          customerData: JSON.parse(row.customerData.replace(/""/g, '"')),
          mbData: JSON.parse(row.mbData.replace(/""/g, '"'))
        }))
      }
    }
  
    if (typeof raw === 'object' && raw !== null) return Object.values(raw)
  
    throw new Error('Formato no reconocido')
  }

const serviceObject = {
  ProductosService: {
    ProductosPort: {
      calcularProductos: function (args) {
        try {
          console.log('[SOAP] args.productosJson tipo:', typeof args.productosJson)
          console.log('[SOAP] args.productosJson valor:', JSON.stringify(args.productosJson).substring(0, 200))

          const productos = normalizarProductos(args.productosJson)
          const hoyISO = args.hoyISO

          console.log(`[SOAP] calcularProductos → ${productos.length} productos, hoy: ${hoyISO}`)

          const resultado = calcularProductos(productos, hoyISO)

          console.log(`[SOAP] porVencer: ${resultado.porVencer.length} | vencidos: ${resultado.vencidos.length}`)

          return { return: resultado }
        } catch (err) {
          console.error('[SOAP] Error:', err.message)
          return { return: JSON.stringify({ error: err.message }) }
        }
      }
    }
  }
}

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'soap-productos', wsdl: '/productos?wsdl' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)

  try {
    const wsdlPath = path.join(__dirname, 'productos.wsdl')
    console.log(`[SOAP] Cargando WSDL desde: ${wsdlPath}`)
    const wsdl = fs.readFileSync(wsdlPath, 'utf8')
    console.log(`[SOAP] WSDL cargado OK`)

    soap.listen(app, '/productos', serviceObject, wsdl, (err) => {
      if (err) {
        console.error(`[SOAP] Error al montar:`, err.message)
        console.error(err.stack)
      } else {
        console.log(`[SOAP] Servicio montado correctamente en /productos`)
      }
    })

    console.log(`[SOAP] soap.listen ejecutado`)
  } catch (err) {
    console.error(`[SOAP] Error:`, err.message)
    console.error(err.stack)
  }
})