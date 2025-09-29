// Función para formatear la fecha en formato dd/mm/yyyy
export const formatDate = (dateString) => {
  if (!dateString) return "Sin fecha"

  const date = new Date(dateString)
  // Check if date is valid
  if (isNaN(date.getTime())) return "Sin fecha"

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Función para formatear la hora en formato HH:MM
export const formatTime = (dateString) => {
  if (!dateString) return "Sin hora"

  const date = new Date(dateString)
  // Check if date is valid
  if (isNaN(date.getTime())) return "Sin hora"

  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}
