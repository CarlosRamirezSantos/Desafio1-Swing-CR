import { Clase } from "./models/Clase.js";
import { Actividad } from "./models/Actividad.js";
import {
  ubicaciones,
  diasConNombre,
  horasDisponibles,
} from "./configEventos.js";

document.addEventListener("DOMContentLoaded", function () {
  // Obtenemos referencias a los elementos del formulario
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

  // Selects del formulario
  const diaSelect = document.getElementById("dia");
  const horaSelect = document.getElementById("hora");
  const ubicacionSelect = document.getElementById("ubicacion");
  const estiloSelect = document.getElementById("estilo");
  const nivelSelect = document.getElementById("nivel");
  const tipoActividadSelect = document.getElementById("tipoActividad");
  const mensajeEvento = document.getElementById("mensajeEvento");

  // Listas de opciones predefinidas
  const estilos = ["Lindy Hop", "Shag", "Solo Jazz"];
  const niveles = ["Básico", "Intermedio", "Avanzado"];
  const tiposActividad = ["Taster", "Social", "Concierto", "Mix & Match"];
  // Quitamos la hora "15:00" porque es la hora de la comida y no se pueden programar eventos
  const horasUsables = horasDisponibles.filter((h) => h !== "15:00");

  // Función para vaciar un select y añadir una opción inicial desactivada (por ejemplo: "--Selecciona...")
  const agregarOpcionPorDefecto = (select, texto) => {
    select.innerHTML = "";
    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = texto;
    optionDefault.selected = true;
    optionDefault.disabled = true;
    select.appendChild(optionDefault);
  };

  // Muestra u oculta campos del formulario según si el usuario elige "Clase" o "Actividad"
  const actualizarCampos = function () {
    if (radioClase.checked) {
      // Si es una clase, no se necesita descripción ni tipo de actividad
      descripcion.value = "";
      tipoActividadSelect.value = "";
      bandaCheckbox.checked = false;

      // Mostramos el campo de nivel y lo hacemos obligatorio
      grupoNivel.style.display = "";
      grupoTipoActividad.style.display = "none";
      nivelSelect.required = true;
      tipoActividadSelect.required = false;

      // Ocultamos la descripción y la opción de banda
      descripcion.style.display = "none";
      const labelDescripcion = document.querySelector('label[for="descripcion"]');
      if (labelDescripcion) labelDescripcion.style.display = "none";

      grupoBanda.style.display = "";
      const labelBanda = bandaCheckbox.closest("label");
      if (labelBanda) labelBanda.style.display = "none";
    } else if (radioActividad.checked) {
      // Si es una actividad, no se necesita nivel
      nivelSelect.value = "";
      grupoNivel.style.display = "none";
      grupoTipoActividad.style.display = "";
      tipoActividadSelect.required = true;
      nivelSelect.required = false;

      // Mostramos la descripción y la opción de banda
      descripcion.style.display = "";
      const labelDescripcion = document.querySelector('label[for="descripcion"]');
      if (labelDescripcion) labelDescripcion.style.display = "";

      grupoBanda.style.display = "";
      const labelBanda = bandaCheckbox.closest("label");
      if (labelBanda) labelBanda.style.display = "";
    }
  };

  // Rellena el desplegable de días con solo los días que tienen al menos una hora libre
  const actualizarSelectDia = function () {
    const valorPrevio = diaSelect.value;
    const diasLibres = obtenerDiasConHorasLibres(); // Obtiene los días con disponibilidad

    // Limpiamos el select y añadimos solo los días disponibles
    diaSelect.innerHTML = "";
    diasConNombre
      .filter((dia) => diasLibres.includes(dia.numero))
      .forEach((dia) => {
        let option = document.createElement("option");
        option.value = dia.numero;
        option.textContent = dia.nombre;
        diaSelect.appendChild(option);
      });

    // Intentamos mantener el día seleccionado si sigue estando disponible
    if (diasLibres.includes(Number(valorPrevio))) {
      diaSelect.value = valorPrevio;
    } else if (diasLibres.length > 0) {
      diaSelect.value = diasLibres[0]; // Si no, seleccionamos el primero
    }

    // Actualizamos las horas disponibles para el día elegido
    actualizarSelectHora();
  };

  // Rellena el desplegable de horas según el día seleccionado
  const actualizarSelectHora = function () {
    const horasLibres = obtenerHorasConSalasLibres();

    // Si no hay horas libres, desactivamos el select
    if (horasLibres.length === 0) {
      horaSelect.disabled = true;
      actualizarSelectUbicacion();
      actualizarSelectDuracion();
      return;
    }

    // Añadimos cada hora libre como una opción
    horaSelect.innerHTML = "";
    horasLibres.forEach((hora) => {
      let option = document.createElement("option");
      option.value = hora;
      option.textContent = hora;
      horaSelect.appendChild(option);
    });

    // Seleccionamos la primera hora disponible y habilitamos el select
    horaSelect.value = horasLibres[0];
    horaSelect.disabled = false;

    // Actualizamos los selects que dependen de la hora elegida
    actualizarSelectUbicacion();
    actualizarSelectDuracion();
  };

  // Rellena el desplegable de ubicaciones según la disponibilidad en el día y hora seleccionados
  const actualizarSelectUbicacion = function () {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const dia = parseInt(diaSelect.value, 10);
    const hora = horaSelect.value;

    // Si no hay día o hora seleccionados, desactivamos el select
    if (!dia || !hora) {
      agregarOpcionPorDefecto(ubicacionSelect, "--Selecciona una ubicación--");
      ubicacionSelect.disabled = true;
      return;
    }

    // Buscamos las ubicaciones ya ocupadas en esa hora (y en la siguiente si el evento dura 2 horas)
    let ubicacionesOcupadas = [];
    for (let evento of eventos) {
      if (evento.dia === dia) {
        let indiceEventoHora = horasUsables.indexOf(evento.hora);
        let siguienteHora = null;
        if (indiceEventoHora >= 0 && indiceEventoHora < horasUsables.length - 1) {
          siguienteHora = horasUsables[indiceEventoHora + 1];
        }

        // La ubicación está ocupada si hay un evento en esa misma hora
        if (evento.hora === hora) {
          ubicacionesOcupadas.push(evento.ubicacion);
        }

        // También está ocupada si hay un evento de 2 horas que incluye esta hora
        if (
          evento.duracion === 120 &&
          siguienteHora !== null &&
          (siguienteHora === hora || evento.hora === hora)
        ) {
          ubicacionesOcupadas.push(evento.ubicacion);
        }
      }
    }

    // Filtramos solo las ubicaciones libres
    const ubicacionesLibres = ubicaciones.filter(
      (ubic) => !ubicacionesOcupadas.includes(ubic)
    );

    // Rellenamos el select con las ubicaciones disponibles
    agregarOpcionPorDefecto(ubicacionSelect, "--Selecciona una ubicación--");
    ubicacionesLibres.forEach((ubic) => {
      let option = document.createElement("option");
      option.value = ubic;
      option.textContent = ubic;
      ubicacionSelect.appendChild(option);
    });

    // Desactivamos el select si no hay ubicaciones libres
    ubicacionSelect.disabled = ubicacionesLibres.length === 0;

    // Actualizamos la duración posible según la ubicación elegida
    actualizarSelectDuracion();
  };

  // Rellena el desplegable de duración según la hora y ubicación seleccionadas
  const actualizarSelectDuracion = function () {
    const horaSeleccionada = horaSelect.value;
    const ubicacionSeleccionada = ubicacionSelect.value;
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

    // Si falta información, desactivamos el select
    if (!horaSeleccionada || !ubicacionSeleccionada) {
      agregarOpcionPorDefecto(duracionInput, "--Selecciona una duración--");
      duracionInput.disabled = true;
      return;
    }

    // Algunas horas solo permiten eventos de 60 minutos (A las 14:00 porque es la hora antes de comer y la de 23:00 porque es la última hora de la jornada)
    const horasConDuracionRestringida = ["14:00", "23:00"];
    if (horasConDuracionRestringida.includes(horaSeleccionada)) {
      duracionInput.innerHTML = '<option value="60">60</option>';
      duracionInput.disabled = false;
      return;
    }

    // Comprobamos si la siguiente hora está ocupada en la misma sala
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

    // Dependiendo de la disponibilidad, permitimos 60 o 120 minutos
    agregarOpcionPorDefecto(duracionInput, "--Selecciona una duración--");
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

  // Rellena el desplegable de estilos de baile
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

  // Rellena el desplegable de niveles (solo para clases)
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

  // Rellena el desplegable de tipos de actividad (solo para actividades)
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

  // Devuelve las horas libres para un día específico (sin incluir "15:00")
  const obtenerHorasConSalasLibresPorDia = function (dia) {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

    // Definimos qué horas están permitidas según el día
    let rangoPermitido = [];
    if (dia === 10) {
      rangoPermitido = ["20:00", "21:00", "22:00", "23:00"];
    } else if (dia === 12) {
      rangoPermitido = [
        "10:00", "11:00", "12:00", "13:00", "14:00",
        "16:00", "17:00", "18:00", "19:00", "20:00"
      ];
    } else {
      rangoPermitido = horasUsables;
    }

    // Filtramos solo las horas que tienen al menos una sala libre
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

            // Marca la ubicación como ocupada si hay un evento en esa hora
            if (evento.hora === hora) {
              ubicacionesOcupadas.push(evento.ubicacion);
            }

            // También si hay un evento de 2 horas que incluye esta hora
            if (evento.duracion === 120 && siguienteHora === hora) {
              ubicacionesOcupadas.push(evento.ubicacion);
            }
          }
        }

        // Si hay al menos una sala libre, incluimos la hora
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

  // Devuelve los números de los días que tienen al menos una hora libre
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

  // Devuelve las horas libres para el día actualmente seleccionado en el formulario
  const obtenerHorasConSalasLibres = function () {
    const diaSeleccionado = parseInt(diaSelect.value, 10);
    if (!diaSeleccionado || isNaN(diaSeleccionado)) return [];
    return obtenerHorasConSalasLibresPorDia(diaSeleccionado);
  };

  // Escuchamos cambios en los botones de tipo de evento y actualizamos
  radioClase.addEventListener("change", actualizarCampos);
  radioActividad.addEventListener("change", actualizarCampos);

  // Escuchamos cambios en los selects para actualizar los siguientes campos
  diaSelect.addEventListener("change", actualizarSelectHora);
  horaSelect.addEventListener("change", actualizarSelectUbicacion);
  ubicacionSelect.addEventListener("change", actualizarSelectDuracion);

  // Inicializamos los selects al cargar la página
  actualizarSelectEstilo();
  actualizarSelectNivel();
  actualizarSelectTipoActividad();
  actualizarSelectDia();
  actualizarCampos(); 


  // Manejamos el envío del formulario
  formEvento.addEventListener("submit", function (e) {
    e.preventDefault(); // Evitamos que la página se recargue

    // Recogemos los datos comunes a clases y actividades
    const datosComunes = {
      id: Date.now(), // ID único basado en la fecha actual
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
      // Creamos una instancia de Clase
      evento = new Clase({ ...datosComunes, nivel: nivelSelect.value });
    } else {
      // Creamos una instancia de Actividad
      evento = new Actividad({
        ...datosComunes, //muy chulo los ...
        tipo: tipoActividadSelect.value,
        banda: bandaCheckbox.checked,
        descripcion: descripcion.value.trim(),
      });
    }

    // Guardamos el evento en localStorage
    const eventosGuardados = JSON.parse(localStorage.getItem("eventos")) || [];
    eventosGuardados.push(evento);
    localStorage.setItem("eventos", JSON.stringify(eventosGuardados));

    // Mostramos un mensaje de confirmación cuando se registra un evento
    mensajeEvento.textContent = "Evento guardado correctamente";
    mensajeEvento.style.color = "green";
    setTimeout(() => (mensajeEvento.textContent = ""), 3000);

    // Reiniciamos el formulario y actualizamos los campos visibles
    formEvento.reset();
    actualizarCampos();    
    actualizarSelectDia();   
    actualizarSelectNivel(); 
    actualizarSelectEstilo(); 
   
  });
});