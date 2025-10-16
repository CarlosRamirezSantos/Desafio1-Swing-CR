import { Evento } from './Evento.js';

export class Clase extends Evento {
  constructor({ nivel, ...eventoAtributos }) {
    super(eventoAtributos);
    this.nivel = nivel;                   
  }
}
