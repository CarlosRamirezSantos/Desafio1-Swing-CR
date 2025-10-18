import { Clase } from "./models/Clase.js";
import { Actividad } from "./models/Actividad.js";
// localStorage.clear()
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

  const ubicaciones = [
    "Be Hopper",
    "New Orleans",
    "Savoy",
    "Antiguo Casino",
    "Parque de Gasset",
    "Prado",
  ];

   function generarHoras(inicio, fin) {
    const horas = [];
    for (let h = inicio; h <= fin; h++) {
      let horaStr = h.toString().padStart(2, '0') + ':00';
      horas.push(horaStr);
    }
    return horas;
  }

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

  const actualizarSelectUbicacion = function () {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const dia = parseInt(diaSelect.value, 10);
    const hora = horaSelect.value;

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

    ubicacionSelect.innerHTML = "";
    let ubicacionLibre = false;
    for (let ubicacion of ubicaciones) {
      if (!ubicacionesOcupadas.includes(ubicacion)) {
        let option = document.createElement("option");
        option.value = ubicacion;
        option.textContent = ubicacion;
        ubicacionSelect.appendChild(option);
        ubicacionLibre = true;
      }
    }
    if (!ubicacionLibre) {
      let option = document.createElement("option");
      option.value = "";
      option.textContent = "No hay ubicaciones libres";
      ubicacionSelect.appendChild(option);
    }
  };

  radioClase.addEventListener("change", actualizarCampos);
  radioActividad.addEventListener("change", actualizarCampos);

  diaSelect.addEventListener("change", actualizarSelectUbicacion);
  horaSelect.addEventListener("change", actualizarSelectUbicacion);
  duracionInput.addEventListener("change", actualizarSelectUbicacion);

  actualizarCampos();
  actualizarSelectUbicacion();

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

    mensajeEvento.textContent = "Evento guardado correctamente";
    setTimeout(() => {
      mensajeEvento.textContent = "";
    }, 3000);
    formEvento.reset();
    actualizarCampos();
    actualizarSelectUbicacion();
  });
});
