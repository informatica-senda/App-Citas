// locales/index.js
import './es'; // Español
import { LocaleConfig } from 'react-native-calendars';
// Agregar más idiomas aquí si es necesario

// Puedes exportar una función para cambiar el idioma si lo necesitas
export const setLocale = (locale) => {
  LocaleConfig.defaultLocale = locale; 
};
