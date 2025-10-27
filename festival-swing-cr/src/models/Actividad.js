import { Evento } from './Evento.js';

export class Actividad extends Evento {
  constructor({ tipo, banda, descripcion, ...eventoAtributos}) {
    super(eventoAtributos);
    this.tipo = tipo;            
    this.banda = !!banda ? banda : null;        
    this.descripcion = descripcion;
  }
}
