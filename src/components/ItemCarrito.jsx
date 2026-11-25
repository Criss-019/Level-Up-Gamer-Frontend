import React from 'react'
import Logo from '../assets/images/Logo.png'

function ItemCarrito({ item, onCambiarCantidad, onEliminar }) {
  const itemId = item.codigo || item.id || item.idProducto

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio)
  }

  return (
    <div className="card card-gamer p-3 mb-3">
      <div className="row align-items-center">
        <div className="col-3 col-md-2 text-center">
          <img
            src={Logo}
            alt={item.nombre}
            className="img-fluid rounded"
            style={{ maxHeight: '70px', objectFit: 'contain' }}
            onError={(e) => { e.target.src = Logo }}
          />
        </div>
        <div className="col-9 col-md-4">
          <h6 className="brand-font text-light mb-1">{item.nombre}</h6>
          <small className="text-muted">Código: {itemId}</small>
          <div className="precio-tag d-md-none mt-1">{formatearPrecio(item.precio)}</div>
        </div>
        <div className="col-6 col-md-3 mt-2 mt-md-0 d-flex align-items-center gap-2">
          <button
            onClick={() => onCambiarCantidad && onCambiarCantidad(itemId, -1)}
            className="btn btn-outline-secondary btn-sm"
            aria-label={`Disminuir ${item.nombre}`}
          >
            -
          </button>
          <span className="text-light fw-bold px-2">{item.cantidad}</span>
          <button
            onClick={() => onCambiarCantidad && onCambiarCantidad(itemId, 1)}
            className="btn btn-outline-secondary btn-sm"
            aria-label={`Aumentar ${item.nombre}`}
          >
            +
          </button>
        </div>
        <div className="col-4 col-md-2 text-end d-none d-md-block">
          <span className="precio-tag">{formatearPrecio(item.precio * item.cantidad)}</span>
        </div>
        <div className="col-2 col-md-1 text-end">
          <button
            onClick={() => onEliminar && onEliminar(itemId)}
            className="btn btn-outline-danger btn-sm"
            title="Eliminar"
            aria-label={`Eliminar ${item.nombre}`}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemCarrito
