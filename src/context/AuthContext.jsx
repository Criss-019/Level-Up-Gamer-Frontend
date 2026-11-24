import React, { createContext, useContext, useState, useEffect } from "react";
import { USUARIOS_INICIALES } from "../js/data";
import api from "../js/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. Cargar usuarios guardados en localStorage (con fallback)
  const [usuariosBD, setUsuariosBD] = useState(() => {
    try {
      const guardados = localStorage.getItem("usuarios");
      if (guardados) {
        return JSON.parse(guardados);
      }
      localStorage.setItem("usuarios", JSON.stringify(USUARIOS_INICIALES));
      return USUARIOS_INICIALES;
    } catch (error) {
      console.error("Error al leer 'usuarios' de localStorage:", error);
      return USUARIOS_INICIALES || [];
    }
  });

  // 2. Token JWT
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token") || "";
    } catch {
      return "";
    }
  });

  // 3. Cargar la sesión actual desde localStorage (persistencia ante recargas de página)
  const [usuario, setUsuario] = useState(() => {
    try {
      const sesion = localStorage.getItem("usuarioSesion") || localStorage.getItem("usuarioActual");
      return sesion ? JSON.parse(sesion) : null;
    } catch (error) {
      console.error("Error al leer sesión de localStorage:", error);
      return null;
    }
  });

  const [mostrarModalSalir, setMostrarModalSalir] = useState(false);

  // Sincronizar Base de Datos local con localStorage
  useEffect(() => {
    try {
      localStorage.setItem("usuarios", JSON.stringify(usuariosBD));
    } catch (error) {
      console.error("Error al guardar usuarios en localStorage:", error);
    }
  }, [usuariosBD]);

  // Sincronizar Sesión activa y Token con localStorage
  useEffect(() => {
    if (usuario) {
      try {
        localStorage.setItem("usuarioSesion", JSON.stringify(usuario));
        localStorage.setItem("usuarioActual", JSON.stringify(usuario));
      } catch (error) {
        console.error("Error al guardar sesión:", error);
      }
    } else {
      localStorage.removeItem("usuarioSesion");
      localStorage.removeItem("usuarioActual");
    }
  }, [usuario]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Mapear rol de Spring Security a nombre legible del frontend
  const normalizarRol = (rolBackend) => {
    if (rolBackend === "ROLE_ADMIN" || rolBackend === "Administrador") return "Administrador";
    if (rolBackend === "ROLE_VENDEDOR" || rolBackend === "Vendedor") return "Vendedor";
    return "Cliente";
  };

  // Registrar usuario (Conecta con API Backend Spring Boot + Fallback local)
  const registrarUsuario = async (datos) => {
    const {
      run = "",
      nombre = "",
      apellidos = "",
      correo = "",
      email = "",
      edad = 18,
      fechaNacimiento = "",
      password = "",
      region = "",
      comuna = "",
      direccion = "",
      referido = ""
    } = datos;

    const emailPrincipal = (email || correo || "").trim().toLowerCase();

    // Validación de edad mínima
    if (Number(edad) < 18) {
      return {
        ok: false,
        msj: "Debes ser mayor de 18 años para registrarte en Level-Up Gamer.",
      };
    }

    // Intentar registrar en Backend REST
    try {
      const resp = await api.post("/auth/registro", {
        run: run || `R${Date.now().toString().slice(-8)}`,
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: emailPrincipal,
        username: emailPrincipal,
        password,
        fechaNacimiento,
        region,
        comuna,
        direccion,
        referido
      });
      console.log("Registro exitoso en Backend REST:", resp.data);
    } catch (apiError) {
      console.warn("Backend no disponible o error en registro API, continuando con almacenamiento local:", apiError.message);
    }

    // Verificar en BD local
    const existe = usuariosBD.some(
      (u) => (u.email || u.correo || "").toLowerCase() === emailPrincipal
    );

    if (existe) {
      return { ok: false, msj: "El correo electrónico ya está registrado." };
    }

    const esDuoc =
      emailPrincipal.endsWith("@duocuc.cl") ||
      emailPrincipal.endsWith("@profesor.duoc.cl") ||
      emailPrincipal.endsWith("@duoc.cl");

    const puntosAsignados = referido ? 150 : 50;

    const nuevoUsuario = {
      run: run || `R${Date.now().toString().slice(-8)}`,
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: emailPrincipal,
      correo: emailPrincipal,
      edad: Number(edad) || 18,
      fechaNacimiento,
      password,
      tipoUsuario: "Cliente",
      region,
      comuna,
      direccion,
      puntos: puntosAsignados,
      puntosLevelUp: puntosAsignados,
      esDuoc,
      descuentoDuoc: esDuoc,
      activo: true
    };

    setUsuariosBD((prev) => [...prev, nuevoUsuario]);
    return {
      ok: true,
      msj: "¡Cuenta creada con éxito! Redirigiendo a Iniciar Sesión...",
      usuario: nuevoUsuario
    };
  };

  // Iniciar sesión con JWT y Spring Security
  const iniciarSesion = async (emailOcorreo, password) => {
    const credencialLimpia = (emailOcorreo || "").trim().toLowerCase();

    // 1. Intentar autenticar contra el Backend en Spring Boot
    try {
      const res = await api.post("/auth/login", {
        username: credencialLimpia,
        password: password
      });

      if (res.data && res.data.token) {
        const tokenRecibido = res.data.token;
        setToken(tokenRecibido);
        localStorage.setItem("token", tokenRecibido);

        const tipoUsuarioNormalizado = normalizarRol(res.data.rol);
        const usuarioSesion = {
          id: res.data.id,
          username: res.data.username || credencialLimpia,
          nombre: res.data.nombre || res.data.username || "Usuario",
          apellidos: res.data.apellidos || "",
          email: res.data.email || credencialLimpia,
          correo: res.data.email || credencialLimpia,
          tipoUsuario: tipoUsuarioNormalizado,
          puntos: res.data.puntos ?? 50,
          puntosLevelUp: res.data.puntos ?? 50,
          esDuoc: res.data.esDuoc ?? false,
          descuentoDuoc: res.data.esDuoc ?? false,
          token: tokenRecibido
        };

        setUsuario(usuarioSesion);
        return {
          ok: true,
          msj: `¡Bienvenido ${usuarioSesion.nombre}! (Sesión JWT iniciada)`,
          usuario: usuarioSesion
        };
      }
    } catch (apiError) {
      console.warn("Fallo en login API Spring Boot, verificando almacenamiento local:", apiError.message);
    }

    // 2. Fallback de contingencia local si el backend no está iniciado
    const usuarioExiste = usuariosBD.find(
      (u) => (u.email || u.correo || u.username || "").toLowerCase() === credencialLimpia
    );

    if (!usuarioExiste) {
      return {
        ok: false,
        msj: "El correo o usuario no está registrado. Por favor regístrate.",
      };
    }

    if (usuarioExiste.password !== password) {
      return {
        ok: false,
        msj: "La contraseña es incorrecta.",
      };
    }

    if (usuarioExiste.activo === false) {
      return {
        ok: false,
        msj: "Tu cuenta ha sido dada de baja. Contacta a soporte.",
      };
    }

    const usuarioNormalizado = {
      ...usuarioExiste,
      tipoUsuario: normalizarRol(usuarioExiste.tipoUsuario),
      email: usuarioExiste.email || usuarioExiste.correo,
      correo: usuarioExiste.correo || usuarioExiste.email,
      puntos: usuarioExiste.puntos ?? usuarioExiste.puntosLevelUp ?? 0,
      puntosLevelUp: usuarioExiste.puntosLevelUp ?? usuarioExiste.puntos ?? 0,
      esDuoc: usuarioExiste.esDuoc ?? usuarioExiste.descuentoDuoc ?? false,
      descuentoDuoc: usuarioExiste.descuentoDuoc ?? usuarioExiste.esDuoc ?? false,
    };

    setUsuario(usuarioNormalizado);
    return {
      ok: true,
      msj: `¡Bienvenido ${usuarioNormalizado.nombre}!`,
      usuario: usuarioNormalizado
    };
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    setUsuario(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioSesion");
    localStorage.removeItem("usuarioActual");
    setMostrarModalSalir(false);
  };

  const solicitarCerrarSesion = () => setMostrarModalSalir(true);
  const cancelarCerrarSesion = () => setMostrarModalSalir(false);

  // Sumar puntos LevelUp
  const agregarPuntos = (cantidadPuntos) => {
    if (!usuario) {
      return { ok: false, msj: "Debes iniciar sesión para acumular puntos." };
    }

    const puntosASumar = Number(cantidadPuntos) || 0;
    if (puntosASumar <= 0) {
      return { ok: false, msj: "La cantidad de puntos debe ser mayor a 0." };
    }

    setUsuario((prevUsuario) => {
      if (!prevUsuario) return null;

      const puntosActuales = Number(prevUsuario.puntos || prevUsuario.puntosLevelUp) || 0;
      const nuevosPuntos = puntosActuales + puntosASumar;
      const usuarioActualizado = {
        ...prevUsuario,
        puntos: nuevosPuntos,
        puntosLevelUp: nuevosPuntos
      };

      setUsuariosBD((prevBD) =>
        prevBD.map((u) => {
          const uEmail = (u.email || u.correo || "").toLowerCase();
          const actEmail = (usuarioActualizado.email || usuarioActualizado.correo || "").toLowerCase();
          return uEmail === actEmail ? usuarioActualizado : u;
        })
      );

      return usuarioActualizado;
    });

    return { ok: true, msj: `¡Has acumulado ${puntosASumar} puntos LevelUp!` };
  };

  const esAdmin = usuario?.tipoUsuario === "Administrador";
  const esVendedor = usuario?.tipoUsuario === "Vendedor";
  const esCliente = !esAdmin && !esVendedor;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        usuariosBD,
        esAdmin,
        esVendedor,
        esCliente,
        registrarUsuario,
        iniciarSesion,
        cerrarSesion,
        solicitarCerrarSesion,
        confirmarCerrarSesion: cerrarSesion,
        cancelarCerrarSesion,
        mostrarModalSalir,
        agregarPuntos,
        sumarPuntos: agregarPuntos,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};

export default AuthContext;
