import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Productos from './Productos';

const mockAgregarAlCarrito = vi.fn();
vi.mock('../context/CarritoContext', () => ({
  useCarrito: () => ({
    agregarAlCarrito: mockAgregarAlCarrito,
  }),
}));

const mockProductos = [
  {
    codigo: 'JM001',
    nombre: 'Catan',
    categoria: 'Juegos de Mesa',
    precio: 29990,
    stock: 10,
    stockCritico: 3,
    descripcion: 'Juego de estrategia para colonizar Catan.',
    activo: true,
  },
  {
    codigo: 'CO001',
    nombre: 'PlayStation 5',
    categoria: 'Consolas',
    precio: 549990,
    stock: 5,
    stockCritico: 2,
    descripcion: 'Consola de última generación Sony.',
    activo: true,
  },
  {
    codigo: 'MS001',
    nombre: 'Mouse Gamer Logitech G502',
    categoria: 'Mouse',
    precio: 49990,
    stock: 0,
    stockCritico: 2,
    descripcion: 'Mouse de alta precisión.',
    activo: true,
  },
];

vi.mock('../js/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: mockProductos })),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Página <Productos />', () => {
  beforeEach(() => {
    localStorage.setItem('productos', JSON.stringify(mockProductos));
    vi.clearAllMocks();
  });

  it('1. Renderiza el catálogo y muestra los productos disponibles', async () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    );

    expect(await screen.findByText('Catan')).toBeInTheDocument();
    expect(screen.getByText('PlayStation 5')).toBeInTheDocument();
    expect(screen.getByText('Mouse Gamer Logitech G502')).toBeInTheDocument();
  });

  it('2. Filtra productos por término de búsqueda en tiempo real', async () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    );

    await screen.findByText('Catan');

    const inputBuscar = screen.getByPlaceholderText(/Ej: PlayStation, Mouse.../i);
    fireEvent.change(inputBuscar, { target: { value: 'PlayStation' } });

    expect(screen.getByText('PlayStation 5')).toBeInTheDocument();
    expect(screen.queryByText('Catan')).not.toBeInTheDocument();
  });

  it('3. Filtra productos por categoría seleccionada', async () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    );

    await screen.findByText('Catan');

    const selectCategoria = screen.getByRole('combobox');
    fireEvent.change(selectCategoria, { target: { value: 'Consolas' } });

    expect(screen.getByText('PlayStation 5')).toBeInTheDocument();
    expect(screen.queryByText('Catan')).not.toBeInTheDocument();
  });

  it('4. Permite agregar un producto con stock al carrito', async () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    );

    await screen.findByText('Catan');

    const botones = screen.getAllByRole('button', { name: /añadir al carrito/i });
    fireEvent.click(botones[0]); // Catan

    expect(mockAgregarAlCarrito).toHaveBeenCalledWith(
      expect.objectContaining({ codigo: 'JM001', nombre: 'Catan' })
    );
  });
});
