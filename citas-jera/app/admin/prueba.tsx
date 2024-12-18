function Llorar() {
    let x = 0;  // Declaramos x fuera del bucle para acumular su valor
    for (let i = 0; i < 10; i++) {
        x = i + x;  // Se va acumulando el valor de i en x
    }
    return x;  // Retornamos el valor de x después de 10 iteraciones
}

export default Llorar;  // Exportamos la función
