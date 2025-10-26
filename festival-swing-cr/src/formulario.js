import { Clase } from "./models/Clase.js";
import { Actividad } from "./models/Actividad.js";
import {
  ubicaciones,
  diasConNombre,
  horasDisponibles,
} from "./configEventos.js";

document.addEventListener("DOMContentLoaded", function () {
  const radioClase = document.getElementById("radioClase");
  const radioActividad = document.getElementById("radioActividad");
  const formEvento = document.querySelector(".form-evento");
  const descripcion = document.getElementById("descripcion");
  const grupoNivel = document.getElementById("grupo-nivel");
  const grupoTipoActividad = document.getElementById("grupo-tipoActividad");
  const profesorCheckbox = document.getElementById("check_p");
  const bandaCheckbox = document.getElementById("check_b");
  const grupoBanda = document.getElementById("grupo-banda");
  const duracionInput = document.getElementById("duracion");

  const diaSelect = document.getElementById("dia");
  const horaSelect = document.getElementById("hora");
  const ubicacionSelect = document.getElementById("ubicacion");
  const estiloSelect = document.getElementById("estilo");
  const nivelSelect = document.getElementById("nivel");
  const tipoActividadSelect = document.getElementById("tipoActividad");
  const mensajeEvento = document.getElementById("mensajeEvento");

  let ubicacionSeleccionadaPorUsuario = null;

  const actualizarCampos = function () {
    if (radioClase.checked) {
      descripcion.value = "";
      tipoActividadSelect.value = "";
      bandaCheckbox.checked = false;

      grupoNivel.style.display = "";
      nivelSelect.selectedIndex = 0;

      grupoTipoActividad.style.display = "none";
      descripcion.style.display = "none";

      const labelDescripcion = document.querySelector(
        'label[for="descripcion"]'
      );
      if (labelDescripcion) labelDescripcion.style.display = "none";

      grupoBanda.style.display = "";
      const labelBanda = bandaCheckbox.closest("label");
      if (labelBanda) labelBanda.style.display = "none";
    } else if (radioActividad.checked) {
      nivelSelect.value = "";
      grupoNivel.style.display = "none";
      grupoTipoActividad.style.display = "";
      descripcion.style.display = "";
      grupoBanda.style.display = "";

      const labelDescripcion = document.querySelector(
        'label[for="descripcion"]'
      );
      if (labelDescripcion) labelDescripcion.style.display = "";

      const labelBanda = bandaCheckbox.closest("label");
      if (labelBanda) labelBanda.style.display = "";

      tipoActividadSelect.selectedIndex = 0;
    }
  };

  const obtenerHorasConSalasLibresPorDia = function (dia) {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

    let rangoPermitido = [];
    if (dia === 10) {
      rangoPermitido = ["20:00", "21:00", "22:00", "23:00"];
    } else if (dia === 12) {
      rangoPermitido = [
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
      ];
    } else {
      rangoPermitido = horasDisponibles;
    }

    const horasFiltradas = [];
    for (let hora of rangoPermitido) {
      if (horasDisponibles.includes(hora)) {
        let ubicacionesOcupadas = [];
        for (let evento of eventos) {
          if (evento.dia === dia) {
            let indiceEvento = horasDisponibles.indexOf(evento.hora);
            let siguienteHora;
            if (
              indiceEvento >= 0 &&
              indiceEvento < horasDisponibles.length - 1
            ) {
              siguienteHora = horasDisponibles[indiceEvento + 1];
            } else {
              siguienteHora = null;
            }

            if (evento.hora === hora) {
              ubicacionesOcupadas.push(evento.ubicacion);
            }
            if (evento.duracion === 120 && siguienteHora === hora) {
              ubicacionesOcupadas.push(evento.ubicacion);
            }
          }
        }

        let ubicacionesLibres = ubicaciones.filter(
          (ubic) => !ubicacionesOcupadas.includes(ubic)
        );
        if (ubicacionesLibres.length > 0) {
          horasFiltradas.push(hora);
        }
      }
    }

    return horasFiltradas;
  };

  const obtenerDiasConHorasLibres = function () {
    const diasFiltrados = [];
    const numerosDias = diasConNombre.map((d) => d.numero);
    for (let dia of numerosDias) {
      const horasLibres = obtenerHorasConSalasLibresPorDia(dia);
      if (horasLibres.length > 0) {
        diasFiltrados.push(dia);
      }
    }
    return diasFiltrados;
  };

  const actualizarSelectDia = function () {
    const valorPrevio = diaSelect.value;
    const diasLibres = obtenerDiasConHorasLibres();

    diaSelect.innerHTML = "";
    diaSelect.disabled = false;

    diasConNombre
      .filter((dia) => diasLibres.includes(dia.numero))
      .forEach((dia) => {
        let option = document.createElement("option");
        option.value = dia.numero;
        option.textContent = dia.nombre;
        diaSelect.appendChild(option);
      });

    if (diaSelect.children.length === 0) {
      diaSelect.disabled = true;
    } else if (diasLibres.includes(Number(valorPrevio))) {
      diaSelect.value = valorPrevio;
    } else {
      diaSelect.selectedIndex = 0;
    }

    actualizarSelectHora();
  };

  const obtenerHorasConSalasLibres = function () {
    const diaSeleccionado = parseInt(diaSelect.value, 10);
    if (!diaSeleccionado || isNaN(diaSeleccionado)) return [];
    return obtenerHorasConSalasLibresPorDia(diaSeleccionado);
  };
  const actualizarSelectHora = function () {
    const horasLibres = obtenerHorasConSalasLibres();

    horaSelect.innerHTML = "";
    horaSelect.disabled = false;

    if (horasLibres.length === 0) {
      horaSelect.disabled = true;
    } else {
      for (let i = 0; i < horasLibres.length; i++) {
        let hora = horasLibres[i];
        let option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;
        if (i === 0) {
          option.selected = true;
        }
        horaSelect.appendChild(option);
      }
    }

    actualizarSelectUbicacion();
    actualizarSelectDuracion();
  };

  const actualizarSelectUbicacion = function () {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const dia = parseInt(diaSelect.value, 10);
    const hora = horaSelect.value;

    ubicacionSelect.innerHTML = "";
    ubicacionSelect.disabled = false;

    if (!dia || !hora) {
      ubicacionSelect.disabled = true;
      return;
    }

    let ubicacionesOcupadas = [];
    for (let evento of eventos) {
      if (evento.dia === dia) {
        let indiceEventoHora = horasDisponibles.indexOf(evento.hora);
        let siguienteHora;
        if (
          indiceEventoHora >= 0 &&
          indiceEventoHora < horasDisponibles.length - 1
        ) {
          siguienteHora = horasDisponibles[indiceEventoHora + 1];
        } else {
          siguienteHora = null;
        }

        if (evento.hora === hora) {
          ubicacionesOcupadas.push(evento.ubicacion);
        }
        if (
          evento.duracion === 120 &&
          siguienteHora !== null &&
          (siguienteHora === hora || evento.hora === hora)
        ) {
          ubicacionesOcupadas.push(evento.ubicacion);
        }
      }
    }

    const ubicacionesLibres = ubicaciones.filter(
      (ubic) => !ubicacionesOcupadas.includes(ubic)
    );

    if (ubicacionesLibres.length === 0) {
      ubicacionSelect.disabled = true;
    } else {
      ubicacionesLibres.forEach((ubic) => {
        let option = document.createElement("option");
        option.value = ubic;
        option.textContent = ubic;
        ubicacionSelect.appendChild(option);
      });

      let seleccion;
      if (
        ubicacionSeleccionadaPorUsuario !== null &&
        ubicacionesLibres.includes(ubicacionSeleccionadaPorUsuario)
      ) {
        seleccion = ubicacionSeleccionadaPorUsuario;
      } else {
        seleccion = ubicacionesLibres[0];
        ubicacionSeleccionadaPorUsuario = null;
      }
      ubicacionSelect.value = seleccion;
    }

    actualizarSelectDuracion();
  };

  const actualizarSelectDuracion = function () {
    const horaSeleccionada = horaSelect.value;
    const ubicacionSeleccionada = ubicacionSelect.value;
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

    duracionInput.innerHTML = "";
    duracionInput.disabled = false;

    if (!horaSeleccionada || !ubicacionSeleccionada) {
      duracionInput.disabled = true;
      return;
    }

    const horasConDuracionRestringida = ["14:00", "23:00"];
    if (horasConDuracionRestringida.includes(horaSeleccionada)) {
      duracionInput.innerHTML = '<option value="60">60</option>';
      return;
    }

    const indiceHoraActual = horasDisponibles.indexOf(horaSeleccionada);
    const esUltimaHora = indiceHoraActual === horasDisponibles.length - 1;

    let hayEventoEnSiguienteHoraEnMismaSala = false;
    if (!esUltimaHora) {
      const siguienteHora = horasDisponibles[indiceHoraActual + 1];
      for (let evento of eventos) {
        if (
          evento.dia === parseInt(diaSelect.value, 10) &&
          evento.hora === siguienteHora &&
          evento.ubicacion === ubicacionSeleccionada
        ) {
          hayEventoEnSiguienteHoraEnMismaSala = true;
          break;
        }
      }
    }

    if (esUltimaHora || hayEventoEnSiguienteHoraEnMismaSala) {
      duracionInput.innerHTML = '<option value="60">60</option>';
    } else {
      duracionInput.innerHTML = `
        <option value="60">60</option>
        <option value="120">120</option>
      `;
    }
  };

  radioClase.addEventListener("change", actualizarCampos);
  radioActividad.addEventListener("change", actualizarCampos);

  diaSelect.addEventListener("change", actualizarSelectHora);
  horaSelect.addEventListener("change", actualizarSelectUbicacion);
  ubicacionSelect.addEventListener("change", function () {
    ubicacionSeleccionadaPorUsuario = this.value;
    actualizarSelectDuracion();
  });

  actualizarSelectDia();
  actualizarCampos();

  formEvento.addEventListener("submit", function (e) {
    e.preventDefault();

    if (
      !diaSelect.value ||
      !horaSelect.value ||
      !ubicacionSelect.value ||
      !duracionInput.value ||
      !estiloSelect.value ||
      !document.getElementById("nombre").value.trim()
    ) {
      mensajeEvento.textContent = "Completa todos los campos obligatorios";
      mensajeEvento.style.color = "red";
      setTimeout(() => (mensajeEvento.textContent = ""), 3000);
      return;
    }

    const datosComunes = {
      id: Date.now(),
      nombre: document.getElementById("nombre").value.trim(),
      ubicacion: ubicacionSelect.value,
      estilo: estiloSelect.value,
      dia: parseInt(diaSelect.value, 10),
      hora: horaSelect.value,
      duracion: parseInt(duracionInput.value, 10),
      profesor: profesorCheckbox.checked,
    };

    let evento;
    if (radioClase.checked) {
      if (!nivelSelect.value) {
        mensajeEvento.textContent = "Selecciona un nivel";
        mensajeEvento.style.color = "red";
        setTimeout(() => (mensajeEvento.textContent = ""), 3000);
        return;
      }
      evento = new Clase({ ...datosComunes, nivel: nivelSelect.value });
    } else {
      if (!tipoActividadSelect.value || !descripcion.value.trim()) {
        mensajeEvento.textContent = "Completa tipo y descripción";
        mensajeEvento.style.color = "red";
        setTimeout(() => (mensajeEvento.textContent = ""), 3000);
        return;
      }
      evento = new Actividad({
        ...datosComunes,
        tipo: tipoActividadSelect.value,
        banda: bandaCheckbox.checked,
        descripcion: descripcion.value.trim(),
      });
    }

    const eventosGuardados = JSON.parse(localStorage.getItem("eventos")) || [];
    eventosGuardados.push(evento);
    localStorage.setItem("eventos", JSON.stringify(eventosGuardados));

    ubicacionSeleccionadaPorUsuario = null;

    mensajeEvento.textContent = "Evento guardado correctamente";
    mensajeEvento.style.color = "green";
    setTimeout(() => (mensajeEvento.textContent = ""), 3000);

    formEvento.reset();
    actualizarCampos();
    actualizarSelectDia();
  });
});