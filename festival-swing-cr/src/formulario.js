import { Clase } from "./models/Clase.js";
import { Actividad } from "./models/Actividad.js";

// localStorage.clear();

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

  const ubicaciones = [
    "Be Hopper",
    "New Orleans",
    "Savoy",
    "Antiguo Casino",
    "Parque de Gasset",
    "Prado",
  ];

  const diasConNombre = [
    { numero: 10, nombre: "Viernes 10" },
    { numero: 11, nombre: "Sábado 11" },
    { numero: 12, nombre: "Domingo 12" },
  ];

  const generarHoras = function (inicio, fin) {
    const horas = [];
    for (let h = inicio; h <= fin; h++) {
      let horaStr = h.toString().padStart(2, "0") + ":00";
      horas.push(horaStr);
    }
    return horas;
  };
  const horasDisponibles = generarHoras(10, 23);

  const setDisabledField = function (grupo, disabled) {
    if (!grupo) return;
    const inputs = grupo.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.disabled = disabled;
    });
  };

  const actualizarCampos = function () {
    if (radioClase.checked) {
      setDisabledField(grupoNivel, false);
      setDisabledField(grupoTipoActividad, true);
      setDisabledField(grupoBanda, true);
      descripcion.disabled = true;
      profesorCheckbox.disabled = false;
      duracionInput.disabled = false;
    } else if (radioActividad.checked) {
      setDisabledField(grupoNivel, true);
      setDisabledField(grupoTipoActividad, false);
      setDisabledField(grupoBanda, false);
      descripcion.disabled = false;
      profesorCheckbox.disabled = false;
      duracionInput.disabled = false;
    }
  };

  const obtenerHorasConSalasLibresPorDia = function (dia) {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const horasFiltradas = [];
    for (let hora of horasDisponibles) {
      let ubicacionesOcupadas = [];
      for (let evento of eventos) {
        if (evento.dia === dia) {
          let indiceEvento = horasDisponibles.indexOf(evento.hora);
          let siguienteHora = indiceEvento >= 0 && indiceEvento < horasDisponibles.length - 1
            ? horasDisponibles[indiceEvento + 1]
            : null;
          if (evento.hora === hora) {
            ubicacionesOcupadas.push(evento.ubicacion);
          }
          if (evento.duracion === 120 && siguienteHora === hora) {
            ubicacionesOcupadas.push(evento.ubicacion);
          }
        }
      }
      let ubicacionesLibres = [];
      for (let ubicacion of ubicaciones) {
        if (!ubicacionesOcupadas.includes(ubicacion)) {
          ubicacionesLibres.push(ubicacion);
        }
      }
      if (ubicacionesLibres.length > 0) {
        horasFiltradas.push(hora);
      }
    }
    return horasFiltradas;
  };

  const obtenerDiasConHorasLibres = function () {
    const diasFiltrados = [];
    
    const numerosDias = diasConNombre.map(d => d.numero);
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

    diasConNombre
      .filter(dia => diasLibres.includes(dia.numero))
      .forEach(dia => {
        let option = document.createElement("option");
        option.value = dia.numero;        
        option.textContent = dia.nombre;  
        diaSelect.appendChild(option);
      });

    if (diaSelect.children.length === 0) {
      let option = document.createElement("option");
      option.value = "";
      option.textContent = "No hay días disponibles";
      diaSelect.appendChild(option);
    } else if (diasLibres.includes(Number(valorPrevio))) {
      diaSelect.value = valorPrevio;
    } else {
      diaSelect.selectedIndex = 0;
    }
  };

  const obtenerHorasConSalasLibres = function () {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const diaSeleccionado = parseInt(diaSelect.value, 10);
    if (!diaSeleccionado || isNaN(diaSeleccionado)) return [];

    const horasFiltradas = [];
    for (let hora of horasDisponibles) {
      let ubicacionesOcupadas = [];
      for (let evento of eventos) {
        if (evento.dia === diaSeleccionado) {
          let indiceEvento = horasDisponibles.indexOf(evento.hora);
          let siguienteHora = indiceEvento >= 0 && indiceEvento < horasDisponibles.length - 1
            ? horasDisponibles[indiceEvento + 1]
            : null;
          if (evento.hora === hora) {
            ubicacionesOcupadas.push(evento.ubicacion);
          }
          if (evento.duracion === 120 && siguienteHora === hora) {
            ubicacionesOcupadas.push(evento.ubicacion);
          }
        }
      }
      let ubicacionesLibres = [];
      for (let ubicacion of ubicaciones) {
        if (!ubicacionesOcupadas.includes(ubicacion)) {
          ubicacionesLibres.push(ubicacion);
        }
      }
      if (ubicacionesLibres.length > 0) {
        horasFiltradas.push(hora);
      }
    }
    return horasFiltradas;
  };

  const actualizarSelectHora = function () {
    const valorPrevio = horaSelect.value;
    const horasLibres = obtenerHorasConSalasLibres();
    horaSelect.innerHTML = "";
    for (let hora of horasLibres) {
      let option = document.createElement("option");
      option.value = hora;
      option.textContent = hora;
      horaSelect.appendChild(option);
    }
    if (horasLibres.length === 0) {
      let option = document.createElement("option");
      option.value = "";
      option.textContent = "No hay horas disponibles";
      horaSelect.appendChild(option);
    }
    if (horasLibres.includes(valorPrevio)) {
      horaSelect.value = valorPrevio;
    } else {
      horaSelect.selectedIndex = 0;
    }
    actualizarSelectUbicacion();
    actualizarSelectDuracion();
  };

  const actualizarSelectUbicacion = function () {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const dia = parseInt(diaSelect.value, 10);
    const hora = horaSelect.value;

    if (!dia || !hora || hora === "No hay horas disponibles") {
      ubicacionSelect.innerHTML = '<option value="">Selecciona día y hora</option>';
      return;
    }

    let ubicacionesOcupadas = [];
    for (let evento of eventos) {
      if (evento.dia === dia) {
        let indiceEventoHora = horasDisponibles.indexOf(evento.hora);
        if (evento.hora === hora) {
          ubicacionesOcupadas.push(evento.ubicacion);
        }
        if (
          evento.duracion === 120 &&
          indiceEventoHora >= 0 &&
          indiceEventoHora < horasDisponibles.length - 1
        ) {
          let siguienteHora = horasDisponibles[indiceEventoHora + 1];
          if (siguienteHora === hora || evento.hora === hora) {
            ubicacionesOcupadas.push(evento.ubicacion);
          }
        }
      }
    }

    const ubicacionesLibres = ubicaciones.filter(ubic => !ubicacionesOcupadas.includes(ubic));

    ubicacionSelect.innerHTML = "";

    if (ubicacionesLibres.length === 0) {
      let option = document.createElement("option");
      option.value = "";
      option.textContent = "No hay salas libres";
      ubicacionSelect.appendChild(option);
    } else {
      ubicacionesLibres.forEach(ubic => {
        let option = document.createElement("option");
        option.value = ubic;
        option.textContent = ubic;
        ubicacionSelect.appendChild(option);
      });

      let seleccion = null;

      if (ubicacionSeleccionadaPorUsuario !== null && ubicacionesLibres.includes(ubicacionSeleccionadaPorUsuario)) {
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

    if (
      !horaSeleccionada ||
      horaSeleccionada === "No hay horas disponibles" ||
      !ubicacionSeleccionada ||
      ubicacionSeleccionada === "" ||
      ubicacionSeleccionada === "No hay salas libres"
    ) {
      const horasConDuracionRestringida = ["14:00", "23:00"];
      duracionInput.innerHTML = "";
      if (horasConDuracionRestringida.includes(horaSeleccionada)) {
        duracionInput.innerHTML = '<option value="60">60</option>';
      } else {
        duracionInput.innerHTML = `
          <option value="60">60</option>
          <option value="120">120</option>
        `;
      }
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

    duracionInput.innerHTML = "";
    if (esUltimaHora || hayEventoEnSiguienteHoraEnMismaSala) {
      const option = document.createElement("option");
      option.value = "60";
      option.textContent = "60";
      duracionInput.appendChild(option);
    } else {
      const option60 = document.createElement("option");
      option60.value = "60";
      option60.textContent = "60";
      duracionInput.appendChild(option60);

      const option120 = document.createElement("option");
      option120.value = "120";
      option120.textContent = "120";
      duracionInput.appendChild(option120);
    }
  };

  radioClase.addEventListener("change", actualizarCampos);
  radioActividad.addEventListener("change", actualizarCampos);

  diaSelect.addEventListener("change", () => {
    actualizarSelectHora();
  });

  horaSelect.addEventListener("change", () => {
    actualizarSelectUbicacion();
  });

  ubicacionSelect.addEventListener("change", function () {
    ubicacionSeleccionadaPorUsuario = this.value;
    actualizarSelectDuracion();
  });

  actualizarSelectDia();
  actualizarCampos();
  actualizarSelectHora();

  formEvento.addEventListener("submit", function (e) {
    e.preventDefault();

    if (
      !ubicacionSelect.value ||
      ubicacionSelect.value === "No hay salas libres" ||
      ubicacionSelect.value === ""
    ) {
      mensajeEvento.textContent = "Selecciona una ubicación válida";
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
      evento = new Clase({
        ...datosComunes,
        nivel: nivelSelect.value,
      });
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

    ubicacionSeleccionadaPorUsuario = null;

    mensajeEvento.textContent = "Evento guardado correctamente";
    mensajeEvento.style.color = "green";
    setTimeout(() => (mensajeEvento.textContent = ""), 3000);

    formEvento.reset();
    actualizarCampos();
    actualizarSelectDia();
    actualizarSelectHora();
  });
});