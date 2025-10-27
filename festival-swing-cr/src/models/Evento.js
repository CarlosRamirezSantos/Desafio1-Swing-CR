export class Evento {
  constructor({ id, nombre, ubicacion, estilo, dia, hora, duracion, profesor }) {
    this.id = id;
    this.nombre = nombre;
    this.ubicacion = ubicacion;
    this.estilo = estilo; 
    this.dia = dia;
    this.hora = hora;
    this.duracion = duracion;
    this.profesor = !!profesor;
  }
}