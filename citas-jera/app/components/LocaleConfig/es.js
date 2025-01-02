import { LocaleConfig } from 'react-native-calendars';

const es = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Sept.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  dayNamesShort: ['Lun.', 'Mar.', 'Mier.', 'Jue.', 'Vier.', 'sab.', 'Dom.'],
  today: 'Hoy'
};

LocaleConfig.locales['es'] = es;
export default es;