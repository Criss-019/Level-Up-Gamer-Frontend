import { useState, useEffect } from 'react'
import { useCarrito } from '../context/CarritoContext'
import ProductoCard from '../components/ProductoCard'
import api from '../js/api'
import '../css/styles.css'
import '../css/tienda.css'

function Productos() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [precioMax, setPrecioMax] = useState(1500000)
  const { agregarAlCarrito } = useCarrito()

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/productos')
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const prodsApi = res.data.map(p => ({
            ...p,
            categoria: p.categoriaNombre || p.categoria || 'Gamer',
            activo: p.activo !== false
          }))
          setProductos(prodsApi.filter(p => p.activo))
          return
        }
      } catch (err) {
        console.warn("Cargando productos de contingencia local:", err.message)
      }
      const prods = JSON.parse(localStorage.getItem('productos')) || []
      setProductos(prods.filter(p => p.activo !== false))
    }
    cargar()
  }, [])

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio)
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoria('')
    setPrecioMax(1500000)
  }

  // Filtrar productos
  const productosFiltrados = productos.filter((prod) => {
    const coincideTexto =
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoria === '' || prod.categoria === categoria
    const coincidePrecio = prod.precio <= precioMax
    return coincideTexto && coincideCategoria && coincidePrecio
  })

  return (
    <main className="container my-4">
      <h2 className="brand-font mb-4 text-light">
        Catálogo de <span className="text-neon">Productos Gamer</span>
      </h2>

      <div className="row g-4">
        {/* SIDEBAR DE FILTROS */}
        <div className="col-lg-3">
          <div className="filter-box">
            <h5 className="brand-font text-electric mb-3">
              <i className="bi bi-funnel"></i> Filtros de Búsqueda
            </h5>

            {/* Búsqueda */}
            <div className="mb-3">
              <label htmlFor="txtBuscarProducto" className="form-label text-muted small">
                Buscar Producto
              </label>
              <input
                type="text"
                id="txtBuscarProducto"
                className="form-control form-control-gamer"
                placeholder="Ej: PlayStation, Mouse..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Categoría */}
            <div className="mb-3">
              <label htmlFor="cboCategoriaFiltro" className="form-label text-muted small">
                Categoría
              </label>
              <select
                id="cboCategoriaFiltro"
                className="form-select form-select-gamer"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Todas las Categorías</option>
                <option value="Juegos de Mesa">Juegos de Mesa</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Consolas">Consolas</option>
                <option value="Computadores Gamers">Computadores Gamers</option>
                <option value="Sillas Gamers">Sillas Gamers</option>
                <option value="Mouse">Mouse</option>
                <option value="Mousepad">Mousepad</option>
                <option value="Poleras Personalizadas">Poleras Personalizadas</option>
                <option value="Polerones Gamers Personalizados">Polerones Gamers</option>
                <option value="Servicio Técnico">Servicio Técnico</option>
              </select>
            </div>

            {/* Rango de Precio */}
            <div className="mb-3">
              <label htmlFor="rangePrecio" className="form-label text-muted small d-flex justify-content-between">
                <span>Precio Máximo:</span>
                <span id="lblPrecioMaxVal" className="text-neon fw-bold">
                  {formatearPrecio(precioMax)}
                </span>
              </label>
              <input
                type="range"
                className="form-range"
                id="rangePrecio"
                min="0"
                max="1500000"
                step="10000"
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
              />
            </div>

            <button onClick={limpiarFiltros} className="btn btn-outline-secondary btn-sm w-100 mt-2">
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="col-lg-9">
          <div className="row" id="grid-productos">
            {productosFiltrados.length === 0 ? (
              <div className="col-12 text-center py-5">
                <h4 className="text-secondary">No se encontraron productos con los criterios seleccionados.</h4>
              </div>
            ) : (
              productosFiltrados.map((prod) => (
                <ProductoCard
                  key={prod.codigo}
                  producto={prod}
                  onAgregar={agregarAlCarrito}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Productos
