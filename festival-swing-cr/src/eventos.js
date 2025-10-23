import {
  ubicaciones,
  diasConNombre,
  horasDisponibles,
} from "./configEventos.js";

const mostrarTablonEventos = function () {
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

  diasConNombre.forEach((diaObj) => {
    const tabla = document.getElementById(`tabla-dia-${diaObj.numero}`);
    if (!tabla) return;

    const tbody = tabla.querySelector("tbody");
    tbody.innerHTML = "";

    const rowspanMap = {};
    ubicaciones.forEach((ubic) => {
      rowspanMap[ubic] = 0;
    });

    horasDisponibles.forEach((hora) => {
      const fila = document.createElement("tr");

      const celdaHora = document.createElement("td");
      celdaHora.textContent = hora;
      celdaHora.className = "tablon-eventos__celda-hora";
      fila.appendChild(celdaHora);

      ubicaciones.forEach((ubic) => {
        if (rowspanMap[ubic] > 0) {
          rowspanMap[ubic]--;
          return;
        }

        const evento = eventos.find(
          (ev) =>
            Number(ev.dia) === diaObj.numero &&
            ev.hora === hora &&
            ev.ubicacion === ubic
        );

        if (evento) {
          const celda = document.createElement("td");
          celda.className = "tablon-eventos__celda-ocupada";
          celda.dataset.dia = diaObj.numero;
          celda.dataset.hora = hora;
          celda.dataset.ubicacion = ubic;

          let duracionHoras = 1;
          if (evento.duracion === 120) {
            duracionHoras = 2;
          }
          if (duracionHoras > 1) {
            celda.rowSpan = duracionHoras;
            rowspanMap[ubic] = duracionHoras - 1;
          }

          const tarjeta = document.createElement("div");
          tarjeta.className = "tarjeta-evento";
          tarjeta.draggable = true;
          tarjeta.dataset.eventoId = evento.id;

          tarjeta.innerHTML = `
            <div class="tarjeta-evento__id">ID: ${evento.id || "?"}</div>
            <div class="tarjeta-evento__titulo">${evento.nombre}</div>
          `;

          // Abrir modal al hacer click en la tarjeta
          tarjeta.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirModalEvento(evento);
          });

          tarjeta.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", String(evento.id));
            tarjeta.classList.add("tarjeta-evento--arrastrando");
          });

          tarjeta.addEventListener("dragend", () => {
            tarjeta.classList.remove("tarjeta-evento--arrastrando");
          });

          celda.appendChild(tarjeta);
          fila.appendChild(celda);
        } else {
          const celda = document.createElement("td");
          celda.className = "tablon-eventos__celda-libre";
          celda.dataset.dia = diaObj.numero;
          celda.dataset.hora = hora;
          celda.dataset.ubicacion = ubic;

          celda.addEventListener("dragover", (e) => {
            e.preventDefault();
            celda.classList.add("tablon-eventos__celda-libre--sobre");
          });

          celda.addEventListener("dragleave", () => {
            celda.classList.remove("tablon-eventos__celda-libre--sobre");
          });

          celda.addEventListener("drop", (e) => {
            e.preventDefault();
            celda.classList.remove("tablon-eventos__celda-libre--sobre");

            const eventoIdStr = e.dataTransfer.getData("text/plain");
            if (!eventoIdStr) return;

            const eventoId = Number(eventoIdStr);
            const eventosActuales =
              JSON.parse(localStorage.getItem("eventos")) || [];
            const evento = eventosActuales.find((ev) => ev.id === eventoId);
            if (!evento) return;

            const nuevoDia = parseInt(celda.dataset.dia, 10);
            const nuevaHora = celda.dataset.hora;
            const nuevaUbicacion = celda.dataset.ubicacion;
            const duracionOriginal = evento.duracion;

            let indiceInicio = -1;
            for (let i = 0; i < horasDisponibles.length; i++) {
              if (horasDisponibles[i] === nuevaHora) {
                indiceInicio = i;
                break;
              }
            }
            if (indiceInicio === -1) return;

            let celdasNecesarias = 1;
            if (duracionOriginal === 120) {
              celdasNecesarias = 2;
            }

            let celdasLibres = 0;
            let espacioSuficiente = true;

            for (let i = 0; i < celdasNecesarias; i++) {
              if (indiceInicio + i >= horasDisponibles.length) {
                espacioSuficiente = false;
              } else {
                const horaActual = horasDisponibles[indiceInicio + i];
                let ocupada = false;

                for (const ev of eventosActuales) {
                  if (ev.id === eventoId) continue;

                  if (
                    ev.dia === nuevoDia &&
                    ev.ubicacion === nuevaUbicacion &&
                    ev.hora === horaActual
                  ) {
                    ocupada = true;
                  }

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
                } else {
                  celdasLibres = celdasLibres + 1;
                }
              }
            }

            if (!espacioSuficiente || celdasLibres < celdasNecesarias) {
              return;
            }

            evento.dia = nuevoDia;
            evento.hora = nuevaHora;
            evento.ubicacion = nuevaUbicacion;

            localStorage.setItem("eventos", JSON.stringify(eventosActuales));
            window.dispatchEvent(new Event("storage"));
          });

          fila.appendChild(celda);
        }
      });

      tbody.appendChild(fila);
    });
  });
};

const abrirModalEvento = function (evento) {
  document.getElementById("modal-evento").style.display = "flex";
  document.getElementById("modal-titulo").textContent = evento.nombre;
  document.getElementById("modal-id").textContent = evento.id;
  document.getElementById("modal-nombre").textContent = evento.nombre;
  document.getElementById("modal-descripcion").textContent = evento.descripcion;
  document.getElementById("modal-dia").textContent = evento.dia;
  document.getElementById("modal-hora").textContent = evento.hora;
  document.getElementById("modal-ubicacion").textContent = evento.ubicacion;
  document.getElementById("modal-duracion").textContent = evento.duracion;
};

document.getElementById("cerrar-modal").onclick = () => {
  document.getElementById("modal-evento").style.display = "none";
};

document.getElementById("modal-evento").onclick = (e) => {
  if (e.target === e.currentTarget) {
    e.target.style.display = "none";
  }
};

document.addEventListener("DOMContentLoaded", mostrarTablonEventos);
window.addEventListener("storage", mostrarTablonEventos);