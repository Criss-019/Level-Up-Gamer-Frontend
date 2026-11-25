import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ItemCarrito from './ItemCarrito'

describe('Componente <ItemCarrito />', () => {
  const itemPrueba = {
    codigo: 'IT001',
    nombre: 'Catan',
    precio: 29990,
    cantidad: 2,
  }

  it('1. Renderiza correctamente los datos del item del carrito', () => {
    render(
      <ItemCarrito
        item={itemPrueba}
        onCambiarCantidad={vi.fn()}
        onEliminar={vi.fn()}
      />
    )

    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/Código: IT001/i)).toBeInTheDocument()
  })

  it('2. Llama a onCambiarCantidad al presionar los botones + y -', () => {
    const mockCambiar = vi.fn()
    render(
      <ItemCarrito
        item={itemPrueba}
        onCambiarCantidad={mockCambiar}
        onEliminar={vi.fn()}
      />
    )

    const btnAumentar = screen.getByRole('button', { name: /Aumentar Catan/i })
    fireEvent.click(btnAumentar)
    expect(mockCambiar).toHaveBeenCalledWith('IT001', 1)

    const btnDisminuir = screen.getByRole('button', { name: /Disminuir Catan/i })
    fireEvent.click(btnDisminuir)
    expect(mockCambiar).toHaveBeenCalledWith('IT001', -1)
  })

  it('3. Llama a onEliminar al presionar el botón de eliminar', () => {
    const mockEliminar = vi.fn()
    render(
      <ItemCarrito
        item={itemPrueba}
        onCambiarCantidad={vi.fn()}
        onEliminar={mockEliminar}
      />
    )

    const btnEliminar = screen.getByRole('button', { name: /Eliminar Catan/i })
    fireEvent.click(btnEliminar)
    expect(mockEliminar).toHaveBeenCalledWith('IT001')
  })
})
