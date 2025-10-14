import { Evento } from './Evento.js';

export class Clase extends Evento {
  constructor({ nivel, estilo, profesores = [], ...eventoAtributos }) {
    super(eventoAtributos); // id, nombre, descripcion, salaId, dia, hora, duracion
    this.nivel = nivel;   // básico, intermedio, avanzado
    this.estilo = estilo; // Lindy Hop, Solo Jazz, etc
    this.profesores = profesores; // array de objetos
  }
}
