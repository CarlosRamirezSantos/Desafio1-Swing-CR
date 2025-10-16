document.addEventListener('DOMContentLoaded', function() {

  const radioClase = document.getElementById('radioClase');
  const radioActividad = document.getElementById('radioActividad');
  const formEvento = document.querySelector('.form-evento');
  const descripcion = document.getElementById('descripcion');
  const campoNivel = Array.from(document.querySelectorAll('.form-evento__grupo')).find(g => g.textContent.includes('Nivel'));
  const campoTipoActividad = Array.from(document.querySelectorAll('.form-evento__grupo')).find(g => g.textContent.includes('Tipo de actividad'));
  const campoBanda = Array.from(document.querySelectorAll('.form-evento__grupo')).find(g => g.textContent.includes('Banda'));
  const profesorCheckbox = formEvento.querySelector('input[type="checkbox"]:nth-of-type(1)');
  const duracionInput = document.getElementById('duracion');

  const diaSelect = document.getElementById('dia');
  const horaSelect = document.getElementById('hora');
  const ubicacionSelect = document.getElementById('ubicacion');

  function setDisabledField(grupo, disabled) {
    if (grupo) {
      const inputs = grupo.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input !== profesorCheckbox && input !== duracionInput) {
          input.disabled = disabled;
        }
      });
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

  radioClase.addEventListener('change', actualizarCampos);
  radioActividad.addEventListener('change', actualizarCampos);

  actualizarCampos();
});