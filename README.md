# 💰 Aplicación de Finanzas Personales

Una aplicación web completa para gestionar tus finanzas personales con sincronización entre dispositivos a través de GitHub.

## ✨ Características Principales

### 📅 Calendario Interactivo
- Selecciona cualquier día para ver y gestionar tus movimientos financieros
- Visualización rápida de días con movimientos (puntos de color)
- Navegación intuitiva entre meses

### 💸 Registro de Movimientos
- **Ingresos y Egresos**: Categorización clara de tus finanzas
- **Descripción Personalizada**: Describe cada movimiento libremente
- **Registro Automático**: Fecha y hora se guardan automáticamente
- **Vista por Día**: Solo ves los movimientos del día seleccionado

### 📊 Resumen Financiero
- **Balance Total**: Cálculo automático de ingresos - egresos
- **Último Movimiento**: Información del movimiento más reciente
- **Indicadores Visuales**: Colores que diferencian ingresos (verde) y egresos (rojo)

### 🔍 Sistema de Filtros Avanzado
- **Filtro por Monto**: Busca movimientos mayores o menores a un valor
- **Búsqueda por Descripción**: Encuentra movimientos por palabras clave
- **Búsqueda Case-Insensitive**: No importa si usas mayúsculas o minúsculas
- **Resultados Instantáneos**: Filtros que se aplican en tiempo real

### 📋 Gestión de Deudas Completa
#### 🏦 Sección "Debo"
- Registro de deudas que tienes con otras personas
- Campos: Nombre, Monto, Fecha de deuda, Fecha de vencimiento, Descripción opcional
- Sistema de abonos para reducir el total adeudado
- Reajuste automático de fechas de vencimiento

#### 💰 Sección "Me Deben"
- Control de dinero que otros te deben
- Misma funcionalidad que "Debo" pero para cobrar
- Organización por proximidad de vencimiento

### 🔄 Sincronización Multi-dispositivo
- **GitHub OAuth**: Autenticación segura con tu cuenta GitHub
- **Sincronización Automática**: Mantén tus datos actualizados en todos los dispositivos
- **Acceso Universal**: Funciona en PC, tablet y móvil
- **Backup en la Nube**: GitHub como repositorio seguro de tus datos

### 📱 Diseño Responsive
- **Interfaz Moderna**: Diseño limpio y profesional
- **Adaptable**: Funciona perfectamente en todos los tamaños de pantalla
- **Navegación Móvil**: Menú inferior optimizado para dispositivos táctiles
- **Componentes Interactivos**: Animaciones suaves y feedback visual

## 🚀 Instalación y Configuración

### Opción 1: Uso Directo (Recomendado)
1. Sube los archivos a tu repositorio de GitHub
2. Activa GitHub Pages en la configuración del repositorio
3. Accede a tu aplicación desde cualquier navegador

### Opción 2: Servidor Local
1. Clona o descarga los archivos
2. Abre `index.html` en tu navegador
3. ¡Listo para usar! (sin sincronización GitHub)

## 🔧 Configuración de GitHub OAuth (Para Sincronización)

### Paso 1: Crear una Aplicación OAuth en GitHub
1. Ve a GitHub → Settings → Developer settings → OAuth Apps
2. Click en "New OAuth App"
3. Completa los datos:
   - **Application name**: "Finanzas Personales"
   - **Homepage URL**: La URL de tu aplicación
   - **Authorization callback URL**: `tu-url/callback.html`

### Paso 2: Configurar la Aplicación
1. Copia el **Client ID** de tu aplicación OAuth
2. En el archivo `script.js`, línea 74, reemplaza:
   ```javascript
   const clientId = 'YOUR_GITHUB_CLIENT_ID';
   ```
   Por tu Client ID real

### Paso 3: Subir a GitHub
1. Crea un nuevo repositorio en GitHub
2. Sube todos los archivos (`index.html`, `styles.css`, `script.js`, `callback.html`)
3. Ve a Settings → Pages
4. Selecciona "Deploy from a branch"
5. Elige "main" branch y "/ (root)"
6. ¡Tu app estará disponible en la URL proporcionada!

## 📖 Guía de Uso

### Agregar Movimientos
1. Selecciona un día en el calendario
2. Click en "Agregar Movimiento"
3. Elige "Ingreso" o "Egreso"
4. Ingresa monto y descripción
5. La fecha se pre-llena con el día seleccionado
6. Click "Guardar"

### Gestionar Deudas
1. Ve a la pestaña "Deudas"
2. Selecciona "Debo" o "Me Deben"
3. Click "Nueva Deuda" o "Nueva Deuda de Otros"
4. Completa los datos obligatorios
5. Para abonar: Click "Abonar" en la deuda correspondiente

### Aplicar Filtros
1. Ve a la pestaña "Filtros"
2. Define rango de montos (opcional)
3. Ingresa texto para buscar en descripciones
4. Click "Aplicar Filtros"
5. Click "Limpiar" para resetear

### Sincronizar Datos
1. Click en "Sincronizar" en la esquina superior derecha
2. Si no estás autenticado, se abrirá el modal de GitHub
3. Inicia sesión con tu cuenta GitHub
4. Autoriza la aplicación
5. Tus datos se sincronizarán automáticamente

## 🎨 Características de Diseño

### Paleta de Colores
- **Azul Primario**: #3B82F6 (Botones, enlaces, elementos activos)
- **Verde Éxito**: #10B981 (Ingresos, estados positivos)
- **Rojo Alerta**: #EF4444 (Egresos, estados negativos)
- **Ámbar Advertencia**: #F59E0B (Deudas, advertencias)
- **Grises**: Escala de neutrales para texto y fondos

### Tipografía
- **Fuente**: Inter (profesional y legible)
- **Tamaños**: Escala tipográfica consistente
- **Números**: Tabular figures para alineación perfecta

### Animaciones
- **Transiciones**: 300ms para interacciones suaves
- **Estados Hover**: Elevación sutil de elementos
- **Loading States**: Indicadores de carga elegantes

## 🔒 Seguridad y Privacidad

- **Datos Locales**: Toda la información se almacena localmente por defecto
- **GitHub OAuth**: Autenticación segura sin manejo de contraseñas
- **Sin Servidor Propio**: No necesitas configurar un backend complejo
- **Código Abierto**: Revisa el código para verificar la seguridad

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Diseño**: CSS Grid, Flexbox, Custom Properties
- **Iconos**: Lucide Icons (SVG)
- **Fuente**: Google Fonts (Inter)
- **Sincronización**: GitHub API + OAuth
- **Almacenamiento**: LocalStorage + GitHub Gists

## 📱 Compatibilidad

- ✅ Chrome/Edge (últimas 2 versiones)
- ✅ Firefox (últimas 2 versiones)
- ✅ Safari (últimas 2 versiones)
- ✅ Chrome Mobile
- ✅ Safari Mobile
- ✅ Responsive: 320px - 2560px

## 🐛 Solución de Problemas

### La sincronización no funciona
1. Verifica que configuraste el Client ID de GitHub correctamente
2. Asegúrate de que la URL de callback coincide con tu dominio
3. Revisa la consola del navegador para errores

### Los datos no se guardan
1. Verifica que LocalStorage esté habilitado en tu navegador
2. No uses modo incógnito/privado
3. Asegúrate de que el sitio tiene permisos de almacenamiento

### La aplicación se ve mal en móvil
1. Verifica que viewport está configurado correctamente
2. Limpia la caché del navegador
3. Prueba en modo responsive de DevTools

## 📝 Estructura de Datos

### Movimientos
```javascript
{
  id: "timestamp",
  type: "income|expense",
  amount: 150.00,
  description: "Descripción del movimiento",
  date: "2025-12-19",
  timestamp: "2025-12-19T02:07:15.000Z"
}
```

### Deudas
```javascript
{
  id: "timestamp",
  person: "Nombre de la persona",
  amount: 1000.00,
  paidAmount: 250.00,
  description: "Descripción opcional",
  dueDate: "2025-12-25",
  createdAt: "2025-12-19T02:07:15.000Z",
  type: "debo|meDeben"
}
```

## 🤝 Contribuir

¿Te gustaría mejorar la aplicación? ¡Las contribuciones son bienvenidas!

1. Fork del repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo libremente para proyectos personales y comerciales.

## 👨‍💻 Autor

Desarrollado por MiniMax Agent

---

**¡Disfruta gestionando tus finanzas de manera inteligente! 💰📊**