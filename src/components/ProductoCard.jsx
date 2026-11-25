import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../assets/images/Logo.png'

function ProductoCard({ producto, onAgregar }) {
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio)
  }

  let badgeStock = null
  if (producto.stock === 0) {
    badgeStock = (
      <span className="badge bg-danger position-absolute top-0 end-0 m-2">Agotado</span>
    )
  } else if (producto.stock <= (producto.stockCritico || 2)) {
    badgeStock = (
      <span className="badge stock-critico-badge position-absolute top-0 end-0 m-2">
        Stock Crítico ({producto.stock})
      </span>
    )
  }

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-4 mb-4">
      <div className="card card-gamer h-100 position-relative">
        {badgeStock}
        <div className="product-img-container">
          <img
            src={Logo}
            alt={producto.nombre}
            onError={(e) => { e.target.src = Logo }}
          />
        </div>
        <div className="card-body d-flex flex-column">
          <span className="badge bg-secondary mb-2 align-self-start">{producto.categoria}</span>
          <h5 className="card-title brand-font text-truncate" title={producto.nombre}>
            {producto.nombre}
          </h5>
          <p className="card-text text-muted small text-truncate-2 flex-grow-1">
            {producto.descripcion}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="precio-tag">{formatearPrecio(producto.precio)}</span>
            <small className="text-light">Stock: {producto.stock}</small>
          </div>
          <div className="mt-3 d-grid gap-2">
            <Link
              to={`/detalle-producto?codigo=${producto.codigo}`}
              className="btn btn-outline-electric btn-sm"
            >
              Ver Detalle
            </Link>
            <button
              onClick={() => onAgregar && onAgregar(producto)}
              className="btn btn-neon btn-sm"
              disabled={producto.stock === 0}
            >
              <i className="bi bi-cart-plus"></i> Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductoCard
