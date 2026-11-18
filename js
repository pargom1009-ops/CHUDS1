/** Preferencias de objetivo y dieta, guardadas aparte del estado de la aplicación. */
(() => {
  const KEY = "planeadorPreferenciasAlimentacion";
  const objetivos = [...document.querySelectorAll("[data-objetivo]")];
  const filtros = [
    ...document.querySelectorAll('input[name="filtro-dieta"]')
  ];
  const estadoObjetivo = document.getElementById("estado-objetivo");
  const estadoDieta = document.getElementById("estado-dieta");

  function leer() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {
        objetivo: "",
        dietas: []
      };
    } catch {
      return { objetivo: "", dietas: [] };
    }
  }

  function guardar(preferencias) {
    try {
      localStorage.setItem(KEY, JSON.stringify(preferencias));
    } catch {
      // La interfaz sigue funcionando si el navegador bloquea el almacenamiento.
    }
  }

  const preferencias = leer();

  objetivos.forEach((boton) => {
    const seleccionado = boton.dataset.objetivo === preferencias.objetivo;
    boton.setAttribute("aria-pressed", String(seleccionado));

    boton.addEventListener("click", () => {
      objetivos.forEach((opcion) => {
        opcion.setAttribute("aria-pressed", String(opcion === boton));
      });

      preferencias.objetivo = boton.dataset.objetivo;
      guardar(preferencias);
      estadoObjetivo.textContent =
        `Objetivo guardado: ${boton.querySelector("strong").textContent}.`;
    });
  });

  const objetivoActual = objetivos.find(
    (boton) => boton.dataset.objetivo === preferencias.objetivo
  );

  if (objetivoActual) {
    estadoObjetivo.textContent =
      `Objetivo guardado: ${objetivoActual.querySelector("strong").textContent}.`;
  }

  filtros.forEach((filtro) => {
    filtro.checked = preferencias.dietas.includes(filtro.value);

    filtro.addEventListener("change", () => {
      preferencias.dietas = filtros
        .filter((item) => item.checked)
        .map((item) => item.value);

      guardar(preferencias);

      estadoDieta.textContent = preferencias.dietas.length
        ? `Filtros guardados: ${
            filtros
              .filter((item) => item.checked)
              .map((item) => item.parentElement.textContent.trim())
              .join(", ")
          }. Las cifras son orientativas y no sustituyen una recomendación nutricional personalizada.`
        : "Las cifras son orientativas y no sustituyen una recomendación nutricional personalizada.";
    });
  });

  if (preferencias.dietas.length) {
    estadoDieta.textContent = `Filtros guardados: ${
      filtros
        .filter((item) => item.checked)
        .map((item) => item.parentElement.textContent.trim())
        .join(", ")
    }. Las cifras son orientativas y no sustituyen una recomendación nutricional personalizada.`;
  }
})();
