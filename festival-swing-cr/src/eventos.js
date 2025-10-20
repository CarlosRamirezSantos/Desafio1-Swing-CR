import { ubicaciones, diasConNombre, horasDisponibles } from "./configEventos.js";

function mostrarTablonEventos() {
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

  diasConNombre.forEach(diaObj => {
    const tabla = document.getElementById(`tabla-dia-${diaObj.numero}`);
    if (!tabla) return;

    const tbody = tabla.querySelector("tbody");
    tbody.innerHTML = "";

    horasDisponibles.forEach(hora => {
      const fila = document.createElement("tr");
      
      const celdaHora = document.createElement("td");
      celdaHora.textContent = hora;
      fila.appendChild(celdaHora);

      ubicaciones.forEach(ubic => {
        const celda = document.createElement("td");
        const evento = eventos.find(ev =>
          Number(ev.dia) === diaObj.numero &&
          ev.hora === hora &&
          ev.ubicacion === ubic
        );
        if (evento) {
          celda.className = "tablon-eventos__celda-ocupada";
          celda.innerHTML = `
            <div class="tarjeta-evento">
              <div class="tarjeta-evento__id">ID: ${evento.id || "?"}</div>
              <div class="tarjeta-evento__titulo">${evento.nombre}</div>
            </div>
          `;
        } else {
          celda.className = "tablon-eventos__celda-libre";
          celda.textContent = "";
        }
        fila.appendChild(celda);
      });

      tbody.appendChild(fila);
    });
  });
}

document.addEventListener("DOMContentLoaded", mostrarTablonEventos);

window.addEventListener("storage", mostrarTablonEventos);
