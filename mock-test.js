const productos = [
    {
      "_id": "6997735925890833cf5ad238",
      "customerData": {
        "LoteProducto": "TEST-P01",
        "NombreProducto": "Yogurt Natural",
        "MarcaProducto": "Colun",
        "CategoriaProducto": "Productos Ultra Perecederos",
        "Cantidad": 12,
        "UnidadMedida": "Gr",
        "PesoProducto": 150,
        "FechaVencimiento": "2026-02-22T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 5
      }
    },
    {
      "_id": "6997742c25890833cf5ad23f",
      "customerData": {
        "LoteProducto": "TEST-P02",
        "NombreProducto": "Queso Laminado",
        "MarcaProducto": "Soprole",
        "CategoriaProducto": "Productos Perecederos",
        "Cantidad": 8,
        "UnidadMedida": "Kg",
        "PesoProducto": 500,
        "FechaVencimiento": "2026-02-26T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 10
      }
    },
    {
      "_id": "699774bf6856cbad7b2e081f",
      "customerData": {
        "LoteProducto": "TEST-P04",
        "NombreProducto": "Arroz largo",
        "MarcaProducto": "Carozzi",
        "CategoriaProducto": "Productos de Larga Duración",
        "Cantidad": 20,
        "UnidadMedida": "Gr",
        "PesoProducto": 250,
        "FechaVencimiento": "2026-04-30T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 30
      }
    },
    {
      "_id": "6997752325890833cf5ad24d",
      "customerData": {
        "LoteProducto": "TEST-P05",
        "NombreProducto": "Leche entera",
        "MarcaProducto": "Surlat",
        "CategoriaProducto": "Productos Ultra Perecederos",
        "Cantidad": 30,
        "UnidadMedida": "L",
        "PesoProducto": 1,
        "FechaVencimiento": "2026-02-23T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 5
      }
    },
    {
      "_id": "6998db506856cbad7b2e18de",
      "customerData": {
        "LoteProducto": "TEST-P06",
        "NombreProducto": "Manjar",
        "MarcaProducto": "Nestle",
        "CategoriaProducto": "Productos Perecederos",
        "Cantidad": 12,
        "UnidadMedida": "Gr",
        "PesoProducto": 500,
        "FechaVencimiento": "2026-06-06T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 10
      }
    },
    {
      "_id": "6998db806856cbad7b2e18e0",
      "customerData": {
        "LoteProducto": "TEST-P07",
        "NombreProducto": "Cloro",
        "MarcaProducto": "Clorox",
        "CategoriaProducto": "Productos Especiales",
        "Cantidad": 30,
        "UnidadMedida": "L",
        "PesoProducto": 1,
        "FechaVencimiento": "2026-08-07T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 60
      }
    },
    {
      "_id": "6998dbb969a908ef42333157",
      "customerData": {
        "LoteProducto": "TEST-P08",
        "NombreProducto": "Bebida Coca Cola",
        "MarcaProducto": "Coca-Cola",
        "CategoriaProducto": "Productos de Larga Duración",
        "Cantidad": 20,
        "UnidadMedida": "L",
        "PesoProducto": 3,
        "FechaVencimiento": "2026-08-23T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 30
      }
    },
    {
      "_id": "6998dc5325890833cf5ae34a",
      "customerData": {
        "LoteProducto": "TEST-P09",
        "NombreProducto": "Pan",
        "MarcaProducto": "Ianza",
        "CategoriaProducto": "Productos Ultra Perecederos",
        "Cantidad": 4,
        "UnidadMedida": "Kg",
        "PesoProducto": 3,
        "FechaVencimiento": "2026-02-22T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 5
      }
    },
    {
      "_id": "6997746669a908ef4233204e",
      "customerData": {
        "LoteProducto": "TEST-P03",
        "NombreProducto": "Mantequilla",
        "MarcaProducto": "Colun",
        "CategoriaProducto": "Productos Perecederos",
        "Cantidad": 20,
        "UnidadMedida": "Gr",
        "PesoProducto": 250,
        "FechaVencimiento": "2026-02-15T00:00:00Z",
        "estado": "Activo",
        "DiasRetiro": 10
      }
    }
  ]
  
  const hoyISO = new Date().toISOString()
  
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
  
      // Solo incluir los que YA entraron en ventana de retiro o ya vencieron
      if (diasRestantes < 0) {
        vencidos.push(productoCalculado)
      } else if (hoy >= fechaRetiro) {
        porVencer.push(productoCalculado)
      }
      // NORMAL no se incluye, aún no hay que avisarlo
    })
  
    return { porVencer, vencidos }
  }
  
  console.log('=== MOCK TEST - Productos a notificar ===')
  console.log(`Hoy: ${hoyISO}\n`)
  
  const { porVencer, vencidos } = calcularProductos(productos, hoyISO)
  
  console.log(`--- EN VENTANA DE RETIRO (${porVencer.length}) ---`)
  if (porVencer.length === 0) {
    console.log('Ninguno\n')
  } else {
    porVencer.forEach(p => {
      console.log(`[${p.calculado.estado}] ${p.customerData.LoteProducto} - ${p.customerData.NombreProducto}`)
      console.log(`  Vence: ${p.calculado.fechaVencimientoFormateada} | Días restantes: ${p.calculado.diasRestantes} | Retiro desde: ${p.calculado.fechaRetiro}\n`)
    })
  }
  
  console.log(`--- VENCIDOS (${vencidos.length}) ---`)
  if (vencidos.length === 0) {
    console.log('Ninguno\n')
  } else {
    vencidos.forEach(p => {
      console.log(`[VENCIDO] ${p.customerData.LoteProducto} - ${p.customerData.NombreProducto}`)
      console.log(`  Venció: ${p.calculado.fechaVencimientoFormateada} | Hace: ${Math.abs(p.calculado.diasRestantes)} días\n`)
    })
  }