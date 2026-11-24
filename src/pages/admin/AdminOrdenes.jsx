import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../js/api'

function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState([])
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargarOrdenes = async () => {
    setCargando(true)
    try {
      const res = await api.get('/boletas')
      if (res.data && Array.isArray(res.data)) {
        setOrdenes(res.data)
        setCargando(false)
        return
      }
    } catch (err) {
      console.warn("No se pudo cargar órdenes desde API Spring Boot, usando pedidos locales:", err.message)
    }

    // Fallback local si backend está desconectado
    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos')) || []
    setOrdenes(pedidosLocales)
    setCargando(false)
  }

  useEffect(() => {
    cargarOrdenes()
  }, [])

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio || 0)
  }

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A'
    try {
      const d = new Date(fechaStr)
      return d.toLocaleDateString('es-CL') + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return fechaStr
    }
  }

  return (
    <AdminLayout activeTab="ordenes">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="brand-font text-light mb-0">
          <i className="bi bi-receipt text-neon"></i> Órdenes y <span className="text-neon">Boletas</span>
        </h2>
        <button onClick={cargarOrdenes} className="btn btn-outline-neon btn-sm">
          <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
        </button>
      </div>

      <div className="card card-gamer p-3">
        <div className="table-responsive">
          <table className="table table-gamer table-hover">
            <thead>
              <tr>
                <th>N° Boleta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Cargando órdenes desde el backend...</td>
                </tr>
              ) : ordenes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No hay órdenes ni boletas registradas aún.</td>
                </tr>
              ) : (
                ordenes.map((ord, idx) => {
                  const idBoleta = ord.id || ord.numeroOrden || `BOL-00${idx + 1}`
                  const clienteNombre = ord.usuarioNombre || ord.nombreCliente || 'Cliente General'
                  const total = ord.total || ord.montoTotal || 0

                  return (
                    <tr key={idBoleta}>
                      <td><strong>#{idBoleta}</strong></td>
                      <td>{formatearFecha(ord.fecha)}</td>
                      <td>{clienteNombre}</td>
                      <td><span className="text-neon fw-bold">{formatearPrecio(total)}</span></td>
                      <td>
                        <span className="badge bg-success">
                          {ord.estado || 'PAGADA'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setOrdenSeleccionada(ord)}
                          className="btn btn-outline-info btn-sm"
                          title="Ver Detalle"
                        >
                          <i className="bi bi-eye-fill me-1"></i> Ver Detalle
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLE DE ORDEN / BOLETA */}
      {ordenSeleccionada && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content card-gamer border-neon">
              <div className="modal-header border-secondary">
                <h5 className="modal-title brand-font text-neon">
                  <i className="bi bi-receipt-cutoff me-2"></i>
                  Detalle de Boleta #{ordenSeleccionada.id || ordenSeleccionada.numeroOrden}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setOrdenSeleccionada(null)}
                ></button>
              </div>
              <div className="modal-body text-light">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Cliente:</strong> {ordenSeleccionada.usuarioNombre || ordenSeleccionada.nombreCliente || 'Cliente General'}</p>
                    <p className="mb-1"><strong>Fecha Emisión:</strong> {formatearFecha(ordenSeleccionada.fecha)}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <p className="mb-1"><strong>Estado:</strong> <span className="badge bg-success">{ordenSeleccionada.estado || 'PAGADA'}</span></p>
                    <p className="mb-1"><strong>Total:</strong> <span className="text-neon fs-5 fw-bold">{formatearPrecio(ordenSeleccionada.total)}</span></p>
                  </div>
                </div>

                <h6 className="brand-font text-muted border-bottom border-secondary pb-2 mb-3">
                  PRODUCTOS ADQUIRIDOS
                </h6>
                <div className="table-responsive">
                  <table className="table table-sm table-dark">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-end">Precio Unit.</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ordenSeleccionada.items || ordenSeleccionada.productos || []).map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.productoNombre || it.nombre}</td>
                          <td className="text-center">{it.cantidad}</td>
                          <td className="text-end">{formatearPrecio(it.precioUnitario || it.precio)}</td>
                          <td className="text-end text-neon">{formatearPrecio(it.subtotal || (it.precio * it.cantidad))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOrdenSeleccionada(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminOrdenes
