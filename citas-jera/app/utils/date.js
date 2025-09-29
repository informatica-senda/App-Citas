// Función para formatear la fecha en formato dd/mm/yyyy
export const formatDate = (dateString) => {
  if (!dateString) return "Sin fecha";
  
  // Usar new Date() con YYYY-MM-DD puede dar problemas de timezone. 
  // Al crear la fecha como UTC y usar métodos UTC, nos aseguramos de mostrar el día correcto.
  const date = new Date(dateString + 'T00:00:00Z');
  
  if (isNaN(date.getTime())) return "Sin fecha";

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

// Función para formatear la hora en formato HH:MM
export const formatTime = (dateString) => {
  if (!dateString) return "Sin hora";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "Sin hora";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Función para formatear una fecha de Firestore (Timestamp) a 'YYYY-MM-DD'
export const formatFirestoreDate = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return null;
  }
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para extraer la hora 'HH:MM' de una fecha de Firestore (Timestamp)
export const extractTime = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return "Sin hora";
  }
  const date = timestamp.toDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
