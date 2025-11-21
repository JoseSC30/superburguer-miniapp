// Configuración de Telegram WebApp API

export const tg = window.Telegram?.WebApp || {
  initData: '',
  initDataUnsafe: { user: { id: '123', first_name: 'Demo' } },
  MainButton: {
    text: 'Enviar Pedido',
    show: () => console.log('MainButton shown'),
    hide: () => console.log('MainButton hidden'),
    onClick: (fn) => {
      console.log('MainButton clicked');
      if (fn) fn();
    },
    offClick: (fn) => console.log('MainButton offClick')
  },
  close: () => console.log('App closed'),
  ready: () => console.log('App ready'),
  expand: () => console.log('App expanded'),
  BackButton: {
    show: () => console.log('BackButton shown'),
    hide: () => console.log('BackButton hidden'),
    onClick: (fn) => console.log('BackButton onClick'),
    offClick: (fn) => console.log('BackButton offClick')
  }
};

// Inicializar la aplicación
export const initTelegramApp = () => {
  tg.ready();
  tg.expand();
  
  // Configurar colores del tema
  if (tg.setHeaderColor) {
    tg.setHeaderColor('#fb923c'); // orange-400
  }
  if (tg.setBackgroundColor) {
    tg.setBackgroundColor('#fb923c');
  }
};

// Obtener el ID de usuario de Telegram
export const getTelegramUserId = () => {
  return tg.initDataUnsafe?.user?.id?.toString() || '5869516446';
};
