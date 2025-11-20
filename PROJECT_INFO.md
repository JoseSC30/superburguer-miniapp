# SuperSuperBurguer Mini App

Mini aplicación de Telegram para pedidos de hamburguesas del local "SuperSuperBurguer".

## 🎯 Descripción

Esta es una aplicación frontend desarrollada con React que funciona como una Telegram Mini App para realizar pedidos de hamburguesas. Consume un backend desarrollado en NestJS.

## 🔧 Configuración del Backend

El frontend consume los siguientes endpoints del backend:

- **Base URL**: `https://be016397f918.ngrok-free.app`

### Endpoints utilizados:

1. **GET /products** - Obtiene todos los productos
   ```json
   [
     {
       "id": 1,
       "name": "Cheeseburger",
       "price": "20.5",
       "imageUrl": "https://example.com/cheese.png",
       "active": true
     }
   ]
   ```

2. **GET /telegram/:telegramId** - Obtiene el usuario por su ID de Telegram
   ```json
   [
     {
       "id": 1,
       "telegramId": "5869673645",
       "name": "José Luis",
       "createdAt": "2025-11-20T16:05:38.218Z"
     }
   ]
   ```

3. **POST /orders** - Crea una nueva orden
   ```json
   {
     "userId": 1,
     "items": [
       { "productId": 1, "quantity": 2 },
       { "productId": 3, "quantity": 1 }
     ]
   }
   ```

## 🚀 Instalación y Uso

### Instalación de dependencias
```bash
npm install
```

### Desarrollo local
```bash
npm start
```

### Compilar para producción
```bash
npm run build
```

## 📱 Funcionalidades

- ✅ Visualización del menú de productos desde el backend
- ✅ Carrito de compras con gestión de cantidades
- ✅ Integración con Telegram WebApp API
- ✅ Envío de órdenes al backend
- ✅ Identificación automática del usuario por Telegram ID
- ✅ Manejo de estados de carga y errores
- ✅ Interfaz responsiva con Tailwind CSS

## 🎨 Tecnologías

- React 19
- Tailwind CSS
- Lucide React (iconos)
- Telegram WebApp API

## 📦 Despliegue

La aplicación está desplegada en Vercel. La configuración en `vercel.json` incluye:

- Reescritura de rutas para SPA
- Headers de seguridad para iframe de Telegram
- Content Security Policy configurado

## 🔐 Notas de Seguridad

⚠️ **Importante**: Este es un proyecto universitario que NO llegará a producción. El endpoint de ngrok es temporal y solo para desarrollo.

## 📝 Estructura del Proyecto

```
src/
├── App.js              # Componente principal
├── services/
│   └── api.js          # Servicio para consumir el backend
├── App.css
├── index.js
└── index.css

public/
├── index.html
└── manifest.json

vercel.json             # Configuración de despliegue
```

## 🤝 Contribución

Este es un proyecto universitario en desarrollo.

## 📄 Licencia

Proyecto educativo - Universidad 2025-02
