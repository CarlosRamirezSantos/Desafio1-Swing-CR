//localStorage.clear()

document.addEventListener('DOMContentLoaded', function() {

  const radioClase = document.getElementById('radioClase');
  const radioActividad = document.getElementById('radioActividad');
  const formEvento = document.querySelector('.form-evento');
  const descripcion = document.getElementById('descripcion');
  const campoNivel = Array.from(document.querySelectorAll('.form-evento__grupo')).find(g => g.textContent.includes('Nivel'));
  const campoTipoActividad = Array.from(document.querySelectorAll('.form-evento__grupo')).find(g => g.textContent.includes('Tipo de actividad'));
  const campoBanda = Array.from(document.querySelectorAll('.form-evento__grupo')).find(g => g.textContent.includes('Banda'));
  const profesorCheckbox = document.getElementById('check_p');
  const bandaCheckbox = document.getElementById('check_b');
  const duracionInput = document.getElementById('duracion');

  const diaSelect = document.getElementById('dia');
  const horaSelect = document.getElementById('hora');
  const ubicacionSelect = document.getElementById('ubicacion');
  const estiloSelect = document.getElementById('estilo');
  const nivelSelect = document.getElementById('nivel');
  const tipoActividadSelect = document.getElementById('tipoActividad');

  const contenedorMensaje = document.getElementById("mensaje-error");

  const horasDisponibles = [
    '10:00', '11:00', '12:00', '13:00', '14:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];
  const ubicaciones = [
      'Be Hopper', 'New Orleans', 'Savoy', 
      'Antiguo Casino', 'Parque de Gasset', 'Prado'
    ];

  function setDisabledField(grupo, disabled) {
    if (!grupo) return;
    const inputs = grupo.querySelectorAll('input, select, textarea');
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (input !== profesorCheckbox && input !== duracionInput) {
        input.disabled = disabled;
      }
    }
  }

  function actualizarCampos() {
    if (radioClase.checked) {
      setDisabledField(campoNivel, false);
      setDisabledField(campoTipoActividad, true);
      setDisabledField(campoBanda, true);
      descripcion.disabled = true;
      profesorCheckbox.disabled = false;
      duracionInput.disabled = false;
    } else if (radioActividad.checked) {
      setDisabledField(campoNivel, true);
      setDisabledField(campoTipoActividad, false);
      setDisabledField(campoBanda, false);
      descripcion.disabled = false;
      profesorCheckbox.disabled = false;
      duracionInput.disabled = false;
    }
  }

  function actualizarSelectUbicacion() {
    
    const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
    const dia = parseInt(diaSelect.value, 10);
    const hora = horaSelect.value;
    const duracion = parseInt(duracionInput.value, 10);

    let indiceHora = -1;
    for (let i = 0; i < horasDisponibles.length; i++) {
      if (horasDisponibles[i] === hora) {
        indiceHora = i;
        break;
      }
    }

    let siguienteHora = null;
    if (duracion === 120 && indiceHora >= 0 && indiceHora < horasDisponibles.length - 1) {
      siguienteHora = horasDisponibles[indiceHora + 1];
    }

    let ubicacionesOcupadas = [];
    let mensajeError = "";

    for (let i = 0; i < eventos.length; i++) {
      let evento = eventos[i];
      if (evento.dia === dia) {
        if (evento.hora === hora) {
          ubicacionesOcupadas.push(evento.ubicacion);
        }
        if (siguienteHora !== null && evento.hora === siguienteHora) {

          ubicacionesOcupadas.push(evento.ubicacion);
          mensajeError = "Error: Ubicación ocupada a la " + siguienteHora + ". Seleccione otra";
        }
      }
    }

    if (mensajeError) {
      contenedorMensaje.textContent = mensajeError;
    } else {
      contenedorMensaje.textContent = "";
    }
  
    ubicacionSelect.innerHTML = '';

    for (let j = 0; j < ubicaciones.length; j++) {
      if (ubicacionesOcupadas.includes(ubicaciones[j]) === -1) {
        let option = document.createElement('option');
        option.value = ubicaciones[j];
        option.textContent = ubicaciones[j];
        ubicacionSelect.appendChild(option);
      }
    }
  }

  radioClase.addEventListener('change', actualizarCampos);
  radioActividad.addEventListener('change', actualizarCampos);

  diaSelect.addEventListener('change', actualizarSelectUbicacion);
  horaSelect.addEventListener('change', actualizarSelectUbicacion);
  duracionInput.addEventListener('change', actualizarSelectUbicacion);

  actualizarCampos();
  actualizarSelectUbicacion();

  formEvento.addEventListener('submit', function(e) {
    e.preventDefault();

    const evento = {
      id: Date.now(),
      tipo: radioClase.checked ? "clase" : "actividad",
      nombre: document.getElementById("nombre").value.trim(),
      ubicacion: ubicacionSelect.value,
      dia: parseInt(diaSelect.value, 10),
      hora: horaSelect.value,
      duracion: parseInt(duracionInput.value, 10),
      estilo: estiloSelect.value,
      descripcion: descripcion.value.trim(),
      profesores: profesorCheckbox.checked,
      banda: bandaCheckbox.checked
    };

    if (radioClase.checked) {
      evento.nivel = nivelSelect.value;
      evento.descripcion = null;
    } else {
      evento.tipoActividad = tipoActividadSelect.value;
    }

    const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
    eventos.push(evento);
    localStorage.setItem('eventos', JSON.stringify(eventos));
    
    alert('Evento guardado en correctamente'); 
    formEvento.reset();
    actualizarCampos();
    actualizarSelectUbicacion();
  });
});