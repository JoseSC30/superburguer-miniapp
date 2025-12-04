# Estructura del Proyecto

## 📁 Organización de Carpetas

```
src/
├── components/              # Componentes reutilizables
│   ├── LoadingScreen.js    # Pantalla de carga
│   ├── ErrorScreen.js      # Pantalla de error
│   └── ProductCard.js      # Tarjeta de producto
│
├── pages/                   # Páginas principales (vistas)
│   ├── MenuPage.js         # Vista del menú y carrito
│   └── PaymentQRPage.js    # Vista del QR de pago
│
├── services/                # Servicios de API
│   └── api.js              # Funciones para consumir backend
│
├── utils/                   # Utilidades
│   └── telegram.js         # Configuración de Telegram WebApp
│
├── App.js                   # Router principal
├── App.css                  # Estilos globales
├── index.js                 # Punto de entrada
└── index.css                # Estilos base con Tailwind
```

## 🛣️ Rutas

### 1. Ruta Principal - Menú y Carrito
- **URL**: `/`
- **Componente**: `MenuPage`
- **Función**: 
  - Muestra productos disponibles
  - Permite agregar/quitar del carrito
  - Muestra resumen del pedido
  - **NO** envía la orden al backend
  - **NO** redirige a la vista de pago

### 2. Ruta de Pago con QR
- **URL**: `/pagoqr?orderId=X`
- **Componente**: `PaymentQRPage`
- **Función**:
  - Carga la orden desde el backend
  - Muestra QR de pago
  - Botón para confirmar pago
  - Actualiza estado a CONFIRMED

## 🔄 Flujo de Trabajo

### Flujo Normal del Usuario:
1. Usuario entra a `/` (MenuPage)
2. Navega por productos
3. Agrega items al carrito
4. Presiona MainButton para ver resumen
5. **FIN** - No hay redirección automática

### Flujo de Pago (Iniciado por Backend):
1. Backend crea orden con estado PENDING
2. Backend envía link: `/pagoqr?orderId=123` al usuario
3. Usuario accede al link
4. PaymentQRPage carga la orden
5. Muestra QR y total
6. Usuario confirma pago
7. Estado cambia a CONFIRMED
8. App se cierra

## 🧩 Componentes

### LoadingScreen
```jsx
<LoadingScreen message="Cargando..." />
```
Pantalla de carga reutilizable con spinner.

### ErrorScreen
```jsx
<ErrorScreen message="Error" onRetry={handleRetry} />
```
Pantalla de error con opción de reintentar.

### ProductCard
```jsx
<ProductCard product={product} onAddToCart={addToCart} />
```
Tarjeta para mostrar producto con botón de agregar.

## 🔧 Utilidades

### telegram.js
- `tg`: Objeto de Telegram WebApp API
- `initTelegramApp()`: Inicializa la app
- `getTelegramUserId()`: Obtiene ID del usuario

## 📡 Servicios API

### api.js
- `getProducts()`: Obtiene productos
- `getUserByTelegramId(id)`: Obtiene usuario
- `createOrder(data)`: Crea orden
- `getOrderById(id)`: Obtiene orden
- `confirmOrder(id)`: Confirma pago

## 🎯 Variables de Entorno del Backend

```bash
FRONTEND_URL="https://superburguer-miniapp.vercel.app/"
FRONTEND_QR_URL="https://superburguer-miniapp.vercel.app/pagoqr"
```

Uso en backend:
```javascript
const qrLink = `${process.env.FRONTEND_QR_URL}?orderId=${order.id}`;
// Enviar este link al usuario por Telegram
```
