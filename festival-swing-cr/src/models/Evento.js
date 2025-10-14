export class Evento {
  constructor({ id, nombre, descripcion, salaId, dia, hora, duracion }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.salaId = salaId;
    this.dia = dia;
    this.hora = hora;
    this.duracion = duracion; // en minutos
  }
}
