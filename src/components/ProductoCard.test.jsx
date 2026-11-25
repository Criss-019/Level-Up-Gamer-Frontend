import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import ProductoCard from './ProductoCard'

describe('Componente <ProductoCard />', () => {
  const productoPrueba = {
    codigo: 'PR001',
    nombre: 'Mouse Gamer Pro',
    categoria: 'Mouse',
    precio: 29990,
    stock: 5,
    stockCritico: 2,
    descripcion: 'Mouse de alta precisión para gaming.',
  }

  it('1. Renderiza correctamente las props recibidas del producto', () => {
    render(
      <MemoryRouter>
        <ProductoCard producto={productoPrueba} onAgregar={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.getByText('Mouse Gamer Pro')).toBeInTheDocument()
    expect(screen.getByText('Mouse')).toBeInTheDocument()
    expect(screen.getByText('Stock: 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Añadir al Carrito/i })).toBeInTheDocument()
  })

  it('2. Ejecuta la función callback onAgregar al hacer clic en el botón', () => {
    const mockOnAgregar = vi.fn()
    render(
      <MemoryRouter>
        <ProductoCard producto={productoPrueba} onAgregar={mockOnAgregar} />
      </MemoryRouter>
    )

    const btn = screen.getByRole('button', { name: /Añadir al Carrito/i })
    fireEvent.click(btn)

    expect(mockOnAgregar).toHaveBeenCalledTimes(1)
    expect(mockOnAgregar).toHaveBeenCalledWith(productoPrueba)
  })
})
