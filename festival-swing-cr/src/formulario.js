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

  const estilos = ["Lindy Hop", "Shag", "Solo Jazz"];
  const niveles = ["Básico", "Intermedio", "Avanzado"];
  const tiposActividad = ["Taster", "Social", "Concierto", "Mix & Match"];
  const horasUsables = horasDisponibles.filter((h) => h !== "15:00");

  const agregarOpcionPorDefecto = (select, texto) => {
    select.innerHTML = "";
    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = texto;
    optionDefault.selected = true;
    optionDefault.disabled = true;
    select.appendChild(optionDefault);
  };

  const actualizarCampos = function () {
    if (radioClase.checked) {
      descripcion.value = "";
      tipoActividadSelect.value = "";
      bandaCheckbox.checked = false;
      grupoNivel.style.display = "";
      grupoTipoActividad.style.display = "none";
      tipoActividadSelect.required = false;
      nivelSelect.required = true;
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
      tipoActividadSelect.required = true;
      nivelSelect.required = false;
      descripcion.style.display = "";
      grupoBanda.style.display = "";
      const labelDescripcion = document.querySelector(
        'label[for="descripcion"]'
      );
      if (labelDescripcion) labelDescripcion.style.display = "";
      const labelBanda = bandaCheckbox.closest("label");
      if (labelBanda) labelBanda.style.display = "";
    }
  };

  const actualizarSelectDia = function () {
    const valorPrevio = diaSelect.value;
    const diasLibres = obtenerDiasConHorasLibres();
    diaSelect.innerHTML = "";
    diasConNombre
      .filter((dia) => diasLibres.includes(dia.numero))
      .forEach((dia) => {
        let option = document.createElement("option");
        option.value = dia.numero;
        option.textContent = dia.nombre;
        diaSelect.appendChild(option);
      });
    if (diasLibres.includes(Number(valorPrevio))) {
      diaSelect.value = valorPrevio;
    } else if (diasLibres.length > 0) {
      diaSelect.value = diasLibres[0];
    }
    actualizarSelectHora();
  };

  const actualizarSelectHora = function () {
    const horasLibres = obtenerHorasConSalasLibres();
    horaSelect.innerHTML = "";

    if (horasLibres.length === 0) {
      horaSelect.disabled = true;
      actualizarSelectUbicacion();
      actualizarSelectDuracion();
      return;
    }

    horasLibres.forEach((hora) => {
      let option = document.createElement("option");
      option.value = hora;
      option.textContent = hora;
      horaSelect.appendChild(option);
    });

    horaSelect.value = horasLibres[0];
    horaSelect.disabled = false;
    actualizarSelectUbicacion();
    actualizarSelectDuracion();
  };

  const actualizarSelectUbicacion = function () {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const dia = parseInt(diaSelect.value, 10);
    const hora = horaSelect.value;
    agregarOpcionPorDefecto(ubicacionSelect, "--Selecciona una ubicación--");
    if (!dia || !hora) {
      ubicacionSelect.disabled = true;
      return;
    }

    let ubicacionesOcupadas = [];
    for (let evento of eventos) {
      if (evento.dia === dia) {
        let indiceEventoHora = horasUsables.indexOf(evento.hora);
        let siguienteHora = null;
        if (
          indiceEventoHora >= 0 &&
          indiceEventoHora < horasUsables.length - 1
        ) {
          siguienteHora = horasUsables[indiceEventoHora + 1];
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
    ubicacionesLibres.forEach((ubic) => {
      let option = document.createElement("option");
      option.value = ubic;
      option.textContent = ubic;
      ubicacionSelect.appendChild(option);
    });
    ubicacionSelect.disabled = ubicacionesLibres.length === 0;
    actualizarSelectDuracion();
  };

  const actualizarSelectDuracion = function () {
    const horaSeleccionada = horaSelect.value;
    const ubicacionSeleccionada = ubicacionSelect.value;
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    agregarOpcionPorDefecto(duracionInput, "--Selecciona una duración--");
    if (!horaSeleccionada || !ubicacionSeleccionada) {
      duracionInput.disabled = true;
      return;
    }

    const horasConDuracionRestringida = ["14:00", "23:00"];
    if (horasConDuracionRestringida.includes(horaSeleccionada)) {
      duracionInput.innerHTML += '<option value="60">60</option>';
      duracionInput.disabled = false;
      return;
    }

    const indiceHoraActual = horasUsables.indexOf(horaSeleccionada);
    const esUltimaHora = indiceHoraActual === horasUsables.length - 1;
    let hayEventoEnSiguienteHoraEnMismaSala = false;

    if (!esUltimaHora) {
      const siguienteHora = horasUsables[indiceHoraActual + 1];
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
      duracionInput.innerHTML += '<option value="60">60</option>';
    } else {
      duracionInput.innerHTML += `
        <option value="60">60</option>
        <option value="120">120</option>
      `;
    }
    duracionInput.disabled = false;
  };

  const actualizarSelectEstilo = function () {
    agregarOpcionPorDefecto(estiloSelect, "--Selecciona un estilo--");
    estilos.forEach((estilo) => {
      let option = document.createElement("option");
      option.value = estilo;
      option.textContent = estilo;
      estiloSelect.appendChild(option);
    });
    estiloSelect.disabled = false;
  };

  const actualizarSelectNivel = function () {
    agregarOpcionPorDefecto(nivelSelect, "--Selecciona un nivel--");
    niveles.forEach((nivel) => {
      let option = document.createElement("option");
      option.value = nivel;
      option.textContent = nivel;
      nivelSelect.appendChild(option);
    });
    nivelSelect.disabled = false;
  };

  const actualizarSelectTipoActividad = function () {
    agregarOpcionPorDefecto(tipoActividadSelect, "--Selecciona un tipo--");
    tiposActividad.forEach((tipo) => {
      let option = document.createElement("option");
      option.value = tipo;
      option.textContent = tipo;
      tipoActividadSelect.appendChild(option);
    });
    tipoActividadSelect.disabled = false;
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
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
      ];
    } else {
      rangoPermitido = horasUsables;
    }

    const horasFiltradas = [];
    for (let hora of rangoPermitido) {
      if (horasUsables.includes(hora)) {
        let ubicacionesOcupadas = [];
        for (let evento of eventos) {
          if (evento.dia === dia) {
            let indiceEvento = horasUsables.indexOf(evento.hora);
            let siguienteHora = null;
            if (indiceEvento >= 0 && indiceEvento < horasUsables.length - 1) {
              siguienteHora = horasUsables[indiceEvento + 1];
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

  const obtenerHorasConSalasLibres = function () {
    const diaSeleccionado = parseInt(diaSelect.value, 10);
    if (!diaSeleccionado || isNaN(diaSeleccionado)) return [];
    return obtenerHorasConSalasLibresPorDia(diaSeleccionado);
  };

  radioClase.addEventListener("change", actualizarCampos);
  radioActividad.addEventListener("change", actualizarCampos);
  diaSelect.addEventListener("change", actualizarSelectHora);
  horaSelect.addEventListener("change", actualizarSelectUbicacion);
  ubicacionSelect.addEventListener("change", actualizarSelectDuracion);

  actualizarSelectEstilo();
  actualizarSelectNivel();
  actualizarSelectTipoActividad();
  actualizarSelectDia();
  actualizarCampos();

  if (radioClase.checked) {
    tipoActividadSelect.required = false;
  } else {
    tipoActividadSelect.required = true;
  }

  formEvento.addEventListener("submit", function (e) {
    e.preventDefault();

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
      evento = new Clase({ ...datosComunes, nivel: nivelSelect.value });
    } else {
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

    mensajeEvento.textContent = "Evento guardado correctamente";
    mensajeEvento.style.color = "green";
    setTimeout(() => (mensajeEvento.textContent = ""), 3000);

    formEvento.reset();
    actualizarCampos();
    actualizarSelectDia();

    actualizarSelectNivel();
    actualizarSelectEstilo();

    if (radioClase.checked) {
      tipoActividadSelect.required = false;
    } else {
      tipoActividadSelect.required = true;
    }
  });
});
