import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../js/api'

function AdminProductos() {
  const { esVendedor } = useAuth()
  const [productos, setProductos] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [productoDetalle, setProductoDetalle] = useState(null)

  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    precio: '',
    stock: '',
    stockCritico: '3',
    descripcion: '',
    imagen: 'img/Logo.png'
  })

  const [errores, setErrores] = useState({})

  const cargarProductos = async () => {
    try {
      const res = await api.get('/productos')
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapeados = res.data.map(p => ({
          ...p,
          categoria: p.categoriaNombre || p.categoria || 'Gamer'
        }))
        setProductos(mapeados)
        localStorage.setItem('productos', JSON.stringify(mapeados))
        return
      }
    } catch (err) {
      console.warn("No se pudo cargar desde Spring Boot, cargando localStorage:", err.message)
    }

    const prods = JSON.parse(localStorage.getItem('productos')) || []
    setProductos(prods)
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio || 0)
  }

  const abrirModalNuevo = () => {
    setModoEdicion(false)
    setForm({
      codigo: '',
      nombre: '',
      categoria: '',
      precio: '',
      stock: '',
      stockCritico: '3',
      descripcion: '',
      imagen: 'img/Logo.png'
    })
    setErrores({})
    setMostrarModal(true)
  }

  const abrirModalEditar = (prod) => {
    setModoEdicion(true)
    setForm({
      id: prod.id,
      codigo: prod.codigo,
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: (prod.precio || 0).toString(),
      stock: (prod.stock || 0).toString(),
      stockCritico: (prod.stockCritico || 0).toString(),
      descripcion: prod.descripcion || '',
      imagen: prod.imagen || 'img/Logo.png'
    })
    setErrores({})
    setMostrarModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errores[name]) {
      setErrores({ ...errores, [name]: '' })
    }
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    const err = {}

    if (!form.codigo.trim() || form.codigo.trim().length < 3) {
      err.codigo = 'El código debe tener al menos 3 caracteres.'
    }

    if (!form.nombre.trim() || form.nombre.trim().length > 100) {
      err.nombre = 'El nombre es requerido y máximo 100 caracteres.'
    }

    if (!form.categoria) {
      err.categoria = 'Seleccione una categoría.'
    }

    if (form.precio === '' || isNaN(form.precio) || Number(form.precio) < 0) {
      err.precio = 'Ingrese un precio válido.'
    }

    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) {
      err.stock = 'Ingrese un stock válido.'
    }

    if (form.descripcion && form.descripcion.length > 500) {
      err.descripcion = 'La descripción no puede superar 500 caracteres.'
    }

    if (!modoEdicion) {
      const existe = productos.some(p => p.codigo.toUpperCase() === form.codigo.trim().toUpperCase())
      if (existe) {
        err.codigo = 'Ya existe un producto con este código.'
      }
    }

    if (Object.keys(err).length > 0) {
      setErrores(err)
      return
    }

    const payload = {
      codigo: form.codigo.trim().toUpperCase(),
      nombre: form.nombre.trim(),
      categoriaNombre: form.categoria,
      categoria: form.categoria,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      stockCritico: parseInt(form.stockCritico) || 0,
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim() || 'img/Logo.png',
      activo: true
    }

    // Intentar sincronizar con Backend Spring Boot
    try {
      if (modoEdicion && form.id) {
        await api.put(`/productos/${form.id}`, payload)
      } else {
        await api.post('/productos', payload)
      }
    } catch (apiErr) {
      console.warn("No se pudo guardar en backend API, persistiendo en localStorage:", apiErr.message)
    }

    let nuevosProductos = [...productos]

    if (modoEdicion) {
      nuevosProductos = nuevosProductos.map(p => {
        if (p.codigo === form.codigo) {
          return {
            ...p,
            ...payload
          }
        }
        return p
      })
      alert(`Producto "${form.nombre}" actualizado con éxito.`)
    } else {
      nuevosProductos.push(payload)
      alert(`Producto "${form.nombre}" creado exitosamente.`)
    }

    localStorage.setItem('productos', JSON.stringify(nuevosProductos))
    setProductos(nuevosProductos)
    setMostrarModal(false)
  }

  const alternarEstado = (codigo) => {
    const nuevosProductos = productos.map(p => {
      if (p.codigo === codigo) {
        const nuevoEstado = !p.activo
        alert(`Producto ${p.codigo} ${nuevoEstado ? 'reactivado' : 'dado de baja'}.`)
        return { ...p, activo: nuevoEstado }
      }
      return p
    })
    localStorage.setItem('productos', JSON.stringify(nuevosProductos))
    setProductos(nuevosProductos)
  }

  return (
    <AdminLayout activeTab="productos">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="brand-font text-light mb-0">
            <i className="bi bi-box-seam text-neon"></i> {esVendedor ? 'Catálogo y Stock' : 'Gestión de'} <span className="text-neon">Productos</span>
          </h2>
          <small className="text-muted">
            {esVendedor ? 'Vista de solo lectura y consulta para Vendedores' : 'Panel de control y administración de inventario'}
          </small>
        </div>

        {/* El botón de crear solo está disponible para Administrador */}
        {!esVendedor && (
          <button onClick={abrirModalNuevo} className="btn btn-neon">
            <i className="bi bi-plus-circle-fill me-1"></i> Nuevo Producto
          </button>
        )}
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="card card-gamer p-3">
        <div className="table-responsive">
          <table className="table table-gamer table-hover">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">No hay productos registrados.</td>
                </tr>
              ) : (
                productos.map(p => {
                  let stockTd = `${p.stock}`
                  if (p.stock === 0) {
                    stockTd = <span className="badge bg-danger">Agotado (0)</span>
                  } else if (p.stock <= p.stockCritico) {
                    stockTd = <span className="badge stock-critico-badge">Stock Crítico ({p.stock})</span>
                  }

                  return (
                    <tr key={p.codigo}>
                      <td><strong>{p.codigo}</strong></td>
                      <td>{p.nombre}</td>
                      <td>{p.categoria}</td>
                      <td>{formatearPrecio(p.precio)}</td>
                      <td>{stockTd}</td>
                      <td>
                        {p.activo !== false ? (
                          <span className="badge bg-success">Activo</span>
                        ) : (
                          <span className="badge bg-secondary">Dado de baja</span>
                        )}
                      </td>
                      <td>
                        {/* Si es vendedor: solo ver detalle */}
                        {esVendedor ? (
                          <button
                            onClick={() => setProductoDetalle(p)}
                            className="btn btn-outline-info btn-sm"
                            title="Ver Detalle"
                          >
                            <i className="bi bi-eye-fill me-1"></i> Detalle
                          </button>
                        ) : (
                          /* Si es admin: editar y alternar estado */
                          <>
                            <button
                              onClick={() => abrirModalEditar(p)}
                              className="btn btn-outline-info btn-sm me-1"
                              title="Editar"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              onClick={() => alternarEstado(p.codigo)}
                              className={`btn btn-outline-${p.activo !== false ? 'warning' : 'success'} btn-sm`}
                              title={p.activo !== false ? 'Dar de Baja' : 'Reactivar'}
                            >
                              <i className={`bi bi-${p.activo !== false ? 'dash-circle' : 'check-circle'}`}></i>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLE PARA VENDEDOR */}
      {productoDetalle && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-gamer border-neon text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title brand-font text-neon">
                  <i className="bi bi-info-circle me-2"></i> Detalle del Producto
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setProductoDetalle(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Código:</strong> <span className="text-neon">{productoDetalle.codigo}</span></p>
                <p><strong>Nombre:</strong> {productoDetalle.nombre}</p>
                <p><strong>Categoría:</strong> {productoDetalle.categoria}</p>
                <p><strong>Precio:</strong> <span className="text-neon fw-bold">{formatearPrecio(productoDetalle.precio)}</span></p>
                <p><strong>Stock disponible:</strong> {productoDetalle.stock} unidades</p>
                <p><strong>Stock crítico:</strong> {productoDetalle.stockCritico} unidades</p>
                <p><strong>Descripción:</strong> {productoDetalle.descripcion || 'Sin descripción disponible.'}</p>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setProductoDetalle(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN / EDICIÓN PARA ADMIN */}
      {mostrarModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content modal-content-gamer">
              <div className="modal-header modal-header-gamer">
                <h5 className="modal-title brand-font text-neon">
                  {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarModal(false)}
                ></button>
              </div>
              <form onSubmit={handleGuardar}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Código del Producto *</label>
                      <input
                        type="text"
                        className={`form-control form-control-gamer ${errores.codigo ? 'is-invalid' : ''}`}
                        name="codigo"
                        value={form.codigo}
                        onChange={handleChange}
                        disabled={modoEdicion}
                        placeholder="Ej: JM001"
                      />
                      {errores.codigo && <div className="invalid-feedback">{errores.codigo}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Categoría *</label>
                      <select
                        className={`form-select form-control-gamer ${errores.categoria ? 'is-invalid' : ''}`}
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione una categoría</option>
                        <option value="Juegos de Mesa">Juegos de Mesa</option>
                        <option value="Accesorios">Accesorios</option>
                        <option value="Consolas">Consolas</option>
                        <option value="Computadores Gamers">Computadores Gamers</option>
                        <option value="Sillas Gamers">Sillas Gamers</option>
                        <option value="Mouse">Mouse</option>
                        <option value="Mousepad">Mousepad</option>
                        <option value="Teclados">Teclados</option>
                      </select>
                      {errores.categoria && <div className="invalid-feedback">{errores.categoria}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Nombre del Producto *</label>
                      <input
                        type="text"
                        className={`form-control form-control-gamer ${errores.nombre ? 'is-invalid' : ''}`}
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Teclado Mecánico RGB"
                      />
                      {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Precio ($) *</label>
                      <input
                        type="number"
                        className={`form-control form-control-gamer ${errores.precio ? 'is-invalid' : ''}`}
                        name="precio"
                        value={form.precio}
                        onChange={handleChange}
                        placeholder="Ej: 29990"
                      />
                      {errores.precio && <div className="invalid-feedback">{errores.precio}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Stock Actual *</label>
                      <input
                        type="number"
                        className={`form-control form-control-gamer ${errores.stock ? 'is-invalid' : ''}`}
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        placeholder="Ej: 15"
                      />
                      {errores.stock && <div className="invalid-feedback">{errores.stock}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Stock Crítico *</label>
                      <input
                        type="number"
                        className="form-control form-control-gamer"
                        name="stockCritico"
                        value={form.stockCritico}
                        onChange={handleChange}
                        placeholder="Ej: 3"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control form-control-gamer"
                        name="descripcion"
                        rows="3"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Detalles técnicos y características del producto..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-footer-gamer">
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => setMostrarModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-neon">
                    {modoEdicion ? 'Actualizar Producto' : 'Guardar Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminProductos
