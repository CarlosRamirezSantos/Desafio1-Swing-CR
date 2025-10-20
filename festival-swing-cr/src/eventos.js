import {
  ubicaciones,
  diasConNombre,
  horasDisponibles,
} from "./configEventos.js";

function mostrarTablonEventos() {
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
            let duracionHoras;

            if (evento.duracion === 120) {
                duracionHoras = 2;
                if (duracionHoras > 1) {
                    celda.rowSpan = duracionHoras;
                    rowspanMap[ubic] = duracionHoras - 1;
                }
            } else {
                duracionHoras = 1;
            }   
            celda.className = "tablon-eventos__celda-ocupada";
            celda.innerHTML = `
            <div class="tarjeta-evento">
              <div class="tarjeta-evento__id">ID: ${evento.id || "?"}</div>
              <div class="tarjeta-evento__titulo">${evento.nombre}</div>
            </div>
            `;
            fila.appendChild(celda);
        } else {
          const celda = document.createElement("td");
          celda.className = "tablon-eventos__celda-libre";
          fila.appendChild(celda);
        }
      });

      tbody.appendChild(fila);
    });
  });
}

document.addEventListener("DOMContentLoaded", mostrarTablonEventos);
window.addEventListener("storage", mostrarTablonEventos);
