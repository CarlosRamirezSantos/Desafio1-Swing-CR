import { Evento } from './Evento.js';

export class Actividad extends Evento {
  constructor({ tipo, banda = null, profesores = [], estilo = null, ...eventoAtributos }) {
    super(eventoAtributos); 
    this.tipo = tipo; 
    this.banda = banda;
    this.profesores = profesores; 
    this.estilo = estilo;
  }
}
