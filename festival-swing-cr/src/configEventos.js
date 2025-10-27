export const ubicaciones = [
  "Be Hopper",
  "New Orleans",
  "Savoy",
  "Antiguo Casino",
  "Parque de Gasset",
  "Prado",
];

export const diasConNombre = [
  { numero: 10, nombre: "Viernes 10" },
  { numero: 11, nombre: "Sábado 11" },
  { numero: 12, nombre: "Domingo 12" },
];

// Genera horas en formato "HH:00" desde una hora de inicio hasta una de fin
export const generarHoras = function (inicio, fin) {
  const horas = [];
  for (let h = inicio; h <= fin; h++) {
    let horaStr = h.toString().padStart(2, "0") + ":00";
    horas.push(horaStr);
  }
  return horas;
};

// Horas disponibles para eventos: de 10:00 a 23:00, EXCEPTO 15:00 (hora de la comida)
export const horasDisponibles = generarHoras(10, 23).filter(hora => hora !== "15:00");