//localStorage.clear();

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

  function setDisabledField(grupo, disabled) {
    if (!grupo) return;
    const inputs = grupo.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input !== profesorCheckbox && input !== duracionInput) {
        input.disabled = disabled;
      }
    });
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

  radioClase.addEventListener('change', actualizarCampos);
  radioActividad.addEventListener('change', actualizarCampos);

  actualizarCampos();

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
      profesor: profesorCheckbox.checked,
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

    alert('Evento guardado correctamente');
    formEvento.reset();
    actualizarCampos();
  });
});
