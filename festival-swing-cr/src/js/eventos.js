import {
  ubicaciones,
  diasConNombre,
  horasDisponibles,
} from "./configEventos.js";

// Esta función devuelve las horas en las que se pueden programar eventos según el día.
const obtenerHorasPermitidasPorDia = function (dia) {
  if (dia === 10) {
    // Viernes: solo noche
    return ["20:00", "21:00", "22:00", "23:00"];
  } else if (dia === 12) {
    // Domingo: horario amplio (sin 15:00)
    return [
      "10:00", "11:00", "12:00", "13:00", "14:00",
      "16:00", "17:00", "18:00", "19:00", "20:00"
    ];
  } else {
    // Otros días: usamos la lista general de horas disponibles
    return horasDisponibles;
  }
};

// Esta función se encarga de dibujar el tablón de eventos (el horario por días y salas).
// Lee los eventos guardados en localStorage y los muestra en una tabla para cada día.
const mostrarTablonEventos = function () {
  // Cargamos los eventos guardados en el navegador (si no hay ninguno, usamos un array vacío)
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

  // Recorremos cada día definido en la configuración (lunes, martes, etc.)
  diasConNombre.forEach((diaObj) => {
    // Buscamos la tabla correspondiente a ese día en el HTML (por ejemplo: tabla-dia-9)
    const tabla = document.getElementById(`tabla-dia-${diaObj.numero}`);
    if (!tabla) return; // Si no existe la tabla, no hacemos nada

    // Vaciamos el cuerpo de la tabla para redibujarla desde cero
    const tbody = tabla.querySelector("tbody");
    tbody.innerHTML = "";

    // Obtenemos las horas permitidas para este día (puede variar según el día)
    const horasAMostrar = obtenerHorasPermitidasPorDia(diaObj.numero);

    // Creamos un objeto para controlar celdas combinadas (rowspan) cuando un evento dura 2 horas
    const rowspanMap = {};
    ubicaciones.forEach((ubic) => {
      rowspanMap[ubic] = 0; // Inicialmente, ninguna sala tiene celdas combinadas
    });

    // Por cada hora del día, creamos una fila en la tabla
    horasAMostrar.forEach((hora) => {
      const fila = document.createElement("tr");

      // Primera celda: la hora
      const celdaHora = document.createElement("td");
      celdaHora.textContent = hora;
      celdaHora.className = "tablon-eventos__celda-hora";
      fila.appendChild(celdaHora);

      // Por cada sala (ubicación), creamos una celda
      ubicaciones.forEach((ubic) => {
        // Si esta sala ya está ocupada por un evento de 2 horas que empezó antes,
        // no creamos una celda nueva (la anterior ya ocupa 2 filas)
        if (rowspanMap[ubic] > 0) {
          rowspanMap[ubic]--;
          return;
        }

        // Buscamos si hay un evento programado en esta hora, día y sala
        const evento = eventos.find(
          (ev) =>
            Number(ev.dia) === diaObj.numero &&
            ev.hora === hora &&
            ev.ubicacion === ubic
        );

        if (evento) {
          // Si hay un evento, creamos una celda ocupada
          const celda = document.createElement("td");
          celda.className = "tablon-eventos__celda-ocupada";
          celda.dataset.dia = diaObj.numero;
          celda.dataset.hora = hora;
          celda.dataset.ubicacion = ubic;

          // Calculamos cuántas horas dura el evento (60 min = 1 hora, 120 min = 2 horas)
          let duracionHoras = 1;
          if (evento.duracion === 120) {
            duracionHoras = 2;
          }

          // Si dura 2 horas, combinamos dos filas con rowspan
          if (duracionHoras > 1) {
            celda.rowSpan = duracionHoras;
            rowspanMap[ubic] = duracionHoras - 1; // La próxima hora no tendrá celda
          }

          // Creamos una "tarjeta" visual para el evento
          const tarjeta = document.createElement("div");
          tarjeta.className = "tarjeta-evento";
          tarjeta.draggable = true; // Permite arrastrar el evento
          tarjeta.dataset.eventoId = evento.id; // Guardamos el ID del evento

          // Mostramos el nombre y el estilo del evento dentro de la tarjeta
          tarjeta.innerHTML = `
            <div class="tarjeta-evento__titulo">${evento.nombre}</div>
            <div class="tarjeta-evento__titulo">${evento.estilo}</div>
          `;

          // Al hacer clic en la tarjeta, se abre un modal con los detalles del evento
          tarjeta.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que el clic se propague a la celda
            abrirModalEvento(evento);
          });

          // Eventos para permitir arrastrar el evento (drag and drop)
          tarjeta.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", String(evento.id)); // Enviamos el ID al soltar
            tarjeta.classList.add("tarjeta-evento--arrastrando"); // Efecto visual
          });

          tarjeta.addEventListener("dragend", () => {
            tarjeta.classList.remove("tarjeta-evento--arrastrando"); // Quitamos el efecto
          });

          celda.appendChild(tarjeta);
          fila.appendChild(celda);
        } else {
          // Si no hay evento, creamos una celda libre (donde se pueden soltar eventos)
          const celda = document.createElement("td");
          celda.className = "tablon-eventos__celda-libre";
          celda.dataset.dia = diaObj.numero;
          celda.dataset.hora = hora;
          celda.dataset.ubicacion = ubic;

          // Permitimos soltar eventos en esta celda
          celda.addEventListener("dragover", (e) => {
            e.preventDefault(); // Necesario para que el drop funcione
            celda.classList.add("tablon-eventos__celda-libre--sobre"); 

            // Desplazamiento automático si arrastramos hacia arriba o hacia abajo cerca del borde
            const margin = 80;
            const scrollSpeed = 15;
            if (e.clientY < margin) {
              window.scrollBy(0, -scrollSpeed);
            } else if (e.clientY > window.innerHeight - margin) {
              window.scrollBy(0, scrollSpeed);
            }
          });

          celda.addEventListener("dragleave", () => {
            celda.classList.remove("tablon-eventos__celda-libre--sobre");
          });

          // Cuando se suelta un evento en esta celda, intentamos moverlo
          celda.addEventListener("drop", (e) => {
            e.preventDefault();
            celda.classList.remove("tablon-eventos__celda-libre--sobre");

            // Recuperamos el ID del evento que se está moviendo
            const eventoIdStr = e.dataTransfer.getData("text/plain");
            if (!eventoIdStr) return;

            const eventoId = Number(eventoIdStr);
            const eventosActuales = JSON.parse(localStorage.getItem("eventos")) || [];
            const evento = eventosActuales.find((ev) => ev.id === eventoId);
            if (!evento) return;

            // Obtenemos la nueva posición (día, hora, sala)
            const nuevoDia = parseInt(celda.dataset.dia, 10);
            const nuevaHora = celda.dataset.hora;
            const nuevaUbicacion = celda.dataset.ubicacion;
            const duracionOriginal = evento.duracion;

            // Verificamos que la nueva hora está permitida en ese día
            const horasPermitidasDestino = obtenerHorasPermitidasPorDia(nuevoDia);
            if (!horasPermitidasDestino.includes(nuevaHora)) {
              return; // No se permite mover aquí
            }

            // Buscamos el índice de la nueva hora en la lista completa de horas
            let indiceInicio = -1;
            for (let i = 0; i < horasDisponibles.length; i++) {
              if (horasDisponibles[i] === nuevaHora) {
                indiceInicio = i;
                break;
              }
            }
            if (indiceInicio === -1) return; // Hora no encontrada

            // Calculamos cuantas celdas necesitamos (1 o 2, según la duración)
            let celdasNecesarias = duracionOriginal === 120 ? 2 : 1;
            let espacioSuficiente = true;

            // Comprobamos que todas las celdas necesarias estén libres
            for (let i = 0; i < celdasNecesarias; i++) {
              // Verificamos que no nos salimos del horario
              if (indiceInicio + i >= horasDisponibles.length) {
                espacioSuficiente = false;
                break;
              }

              const horaActual = horasDisponibles[indiceInicio + i];

              // La hora debe estar permitida en ese día
              if (!horasPermitidasDestino.includes(horaActual)) {
                espacioSuficiente = false;
                break;
              }

              // Comprobamos si hay otro evento ocupando esta celda
              let ocupada = false;
              for (const ev of eventosActuales) {
                if (ev.id === eventoId) continue; // Ignoramos el evento que estamos moviendo

                // ¿Hay un evento en esta misma celda?
                if (
                  ev.dia === nuevoDia &&
                  ev.ubicacion === nuevaUbicacion &&
                  ev.hora === horaActual
                ) {
                  ocupada = true;
                }

                // ¿O hay un evento de 2 horas que ocupa esta celda desde la hora anterior?
                if (!ocupada && ev.duracion === 120) {
                  let idxEv = -1;
                  for (let j = 0; j < horasDisponibles.length; j++) {
                    if (horasDisponibles[j] === ev.hora) {
                      idxEv = j;
                      break;
                    }
                  }
                  if (idxEv !== -1 && idxEv + 1 < horasDisponibles.length) {
                    const siguienteHora = horasDisponibles[idxEv + 1];
                    if (
                      ev.dia === nuevoDia &&
                      ev.ubicacion === nuevaUbicacion &&
                      siguienteHora === horaActual
                    ) {
                      ocupada = true;
                    }
                  }
                }
              }

              if (ocupada) {
                espacioSuficiente = false;
                break;
              }
            }

            // Si no hay espacio suficiente, cancelamos el movimiento
            if (!espacioSuficiente) {
              return;
            }

            // Actualizamos la posición del evento
            evento.dia = nuevoDia;
            evento.hora = nuevaHora;
            evento.ubicacion = nuevaUbicacion;

            // Guardamos los cambios en localStorage
            localStorage.setItem("eventos", JSON.stringify(eventosActuales));

            // Notificamos a otras pestañas o componentes de que los datos cambiaron
            window.dispatchEvent(new Event("storage"));
          });

          fila.appendChild(celda);
        }
      });

      // Añadimos la fila completa al cuerpo de la tabla
      tbody.appendChild(fila);
    });
  });
};

// Abre una ventana modal (un cuadro emergente) con los detalles de un evento
const abrirModalEvento = function (evento) {
  document.getElementById("modal-evento").style.display = "flex";

  // Rellenamos cada campo del modal con los datos del evento
  document.getElementById("modal-id").textContent = evento.id;
  document.getElementById("modal-nombre").textContent = evento.nombre;
  document.getElementById("modal-descripcion").textContent = evento.descripcion || "—";
  document.getElementById("modal-dia").textContent = evento.dia;
  document.getElementById("modal-hora").textContent = evento.hora;
  document.getElementById("modal-ubicacion").textContent = evento.ubicacion;
  document.getElementById("modal-duracion").textContent = evento.duracion;
  document.getElementById("modal-estilo").textContent = evento.estilo;
  document.getElementById("modal-profesor").textContent = evento.profesor ? "Sí" : "No";
  document.getElementById("modal-nivel").textContent = evento.nivel || "—";
  document.getElementById("modal-tipo-actividad").textContent = evento.tipo || "—";
  document.getElementById("modal-banda").textContent = evento.banda ? "Sí" : "No";
};

// Cerrar el modal al hacer clic en la X
document.getElementById("cerrar-modal").onclick = () => {
  document.getElementById("modal-evento").style.display = "none";
};

// También se cierra si se hace clic fuera del contenido del modal
document.getElementById("modal-evento").onclick = (e) => {
  if (e.target === e.currentTarget) {
    e.target.style.display = "none";
  }
};

// Al pulsar el botón Borrar evento, eliminamos el evento del localStorage
document.getElementById("btn-borrar-evento").addEventListener("click", () => {
  const eventoId = Number(document.getElementById("modal-id").textContent);
  if (!eventoId) return;

  // Cargamos todos los eventos, quitamos el que tiene ese ID y guardamos el resto
  let eventos = JSON.parse(localStorage.getItem("eventos")) || [];
  eventos = eventos.filter((evento) => evento.id !== eventoId);
  localStorage.setItem("eventos", JSON.stringify(eventos));

  // Cerramos el modal y actualizamos el tablón
  document.getElementById("modal-evento").style.display = "none";
  mostrarTablonEventos();
});

// Cuando la página termina de cargar, mostramos el tablón de eventos
document.addEventListener("DOMContentLoaded", mostrarTablonEventos);
window.addEventListener("storage", mostrarTablonEventos);