# Level-Up Gamer - E-Commerce Integrado

Plataforma de comercio electrónico de productos gamer, videojuegos, accesorios y consolas. Sistema completamente integrado compuesto por un **Frontend React Vite** y un **Backend Spring Boot (Java 21)** con base de datos relacional **MySQL 8.0 (puerto 3307)**, seguridad basada en roles mediante **Spring Security + JWT** y documentación interactiva con **OpenAPI / Swagger**.

---

## 👥 Integrantes del Equipo (Duoc UC)
* **Cristián Carvajal**
* **Sebastián Castillo**

**Repositorio Frontend:** https://github.com/Criss-019/Level-Up-Gamer.git  
**Repositorio Backend:** https://github.com/Criss-019/Level-Up-Gamer-Backend.git  

---

## 🚀 Arquitectura del Sistema

* **Frontend:** React, React Router v7, Bootstrap 5, Vite, Vitest. Cliente HTTP centralizado (`api.js`) con inyección de cabecera `Authorization: Bearer <token>`.
* **Backend:** Spring Boot 4.1.3 / Java 21, Spring Data JPA, Spring Security, JJWT 0.12.6, Springdoc OpenAPI (Swagger UI).
* **Base de Datos:** MySQL / MariaDB (`jdbc:mysql://localhost:3307/level_up_gamer_db`) con script relacional exportable (`schema.sql`).
* **Modelo Relacional (5 tablas):** `USUARIO` $\rightarrow$ `BOLETA` $\rightarrow$ `DETALLE_BOLETA` $\leftarrow$ `PRODUCTO` $\leftarrow$ `CATEGORIA`.

---

## 🔐 Cuentas de Acceso y Roles

El sistema implementa control de acceso basado en roles (RBAC) tanto en Backend como en Frontend:

| Rol | Usuario / Correo | Contraseña | Vistas y Permisos Asociados |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` / `admin@duoc.cl` | `admin123` | **Acceso total**: Dashboard, CRUD completo de Productos, Órdenes/Boletas, Gestión de Usuarios y Respaldos. |
| **Vendedor** | `vendedor` / `vendedor@duoc.cl` | `vendedor123` | **Panel de Ventas**: Visualización y detalle de Productos/Stock, visualización y detalle de Órdenes y Boletas emitidas. Resto de módulos restringidos. |
| **Cliente** | `cliente` / `juan.perez@gmail.com` | `user123` | **Tienda Pública**: Catálogo de productos, carrito de compras, emisión de boletas y gestión de perfil. |

---

## 🛠️ Puesta en Marcha

### 1. Iniciar el Backend (Spring Boot + MySQL)
1. Asegurarse de tener el servicio MySQL iniciado (ej. mediante XAMPP en puerto 3307).
2. Abrir terminal en la carpeta `level-up-gamer-backend`:
   ```bash
   cd "level-up-gamer-backend"
   ```
3. Ejecutar con Maven o mediante el JAR empaquetado:
   ```bash
   mvn spring-boot:run
   # O directamente:
   java -jar target/level-up-gamer-backend-0.0.1-SNAPSHOT.jar
   ```
4. El servidor iniciará en el puerto **8089**:
   * **Swagger UI:** http://localhost:8089/swagger-ui/index.html
   * **Base de Datos:** MySQL `level_up_gamer_db` en `localhost:3307` (Usuario: `root`, Contraseña: vacía)

### 2. Iniciar el Frontend (React + Vite)
1. Abrir terminal en la carpeta `Level-Up Gamer`:
   ```bash
   cd "Level-Up Gamer"
   npm install
   npm run dev
   ```
2. Ingresar a `http://localhost:5173` en el navegador.

---

## 📡 Endpoints Principales de la API REST (`/api/v1`)

* **Autenticación:**
  * `POST /api/v1/auth/login`: Autentica credenciales y emite token JWT con roles.
  * `POST /api/v1/auth/registro`: Registro de nuevos clientes.
  * `GET /api/v1/auth/me`: Perfil del usuario autenticado.
* **Productos:**
  * `GET /api/v1/productos`: Consulta pública del catálogo (abierta a clientes, vendedores y administradores).
  * `GET /api/v1/productos/{id}`: Detalle de producto específico.
  * `POST /api/v1/productos`: Creación de producto (*Solo Admin*).
  * `PUT /api/v1/productos/{id}`: Actualización de producto (*Solo Admin*).
  * `DELETE /api/v1/productos/{id}`: Eliminación de producto (*Solo Admin*).
* **Categorías:**
  * `GET /api/v1/categorias`: Listar categorías.
  * `POST /api/v1/categorias`: Crear categoría (*Solo Admin*).
* **Boletas y Órdenes:**
  * `POST /api/v1/boletas`: Emitir compra, descontar stock de inventario y registrar boleta.
  * `GET /api/v1/boletas`: Listar boletas (*Admin* y *Vendedor* ven todas; *Cliente* ve solo sus órdenes).
  * `GET /api/v1/boletas/{id}`: Detalle de boleta con desglose de productos.
* **Usuarios:**
  * `GET /api/v1/usuarios`: Lista de usuarios registrados (*Solo Admin*).
  * `PUT /api/v1/usuarios/{id}`: Modificación de datos y roles (*Solo Admin*).
  * `DELETE /api/v1/usuarios/{id}`: Baja de usuario (*Solo Admin*).
