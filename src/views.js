
export function renderHome() {
  return `
    <section class="view">
      <p class="eyebrow">CYBERDYNE SYSTEMS</p>
      <h1>Comunicate con el T-800</h1>
      <p>
        Interactuá con el organismo cibernético
        de Terminator 2 mediante inteligencia artificial.
      </p>
      <a href="/chat" data-link class="button">
        Iniciar conversación
      </a>
    </section>
  `;
}

export function renderAbout() {
  return `
    <section class="view">
      <h1>Acerca del proyecto</h1>
      <p>
        Aplicación desarrollada para el Proyecto
        Integrador del Módulo 3 de Henry.
      </p>
      <p>
        El T-800 es un organismo cibernético
        reprogramado para proteger a John Connor.
      </p>
    </section>
  `;
}

export function renderNotFound() {
  return `
    <section class="view">
      <h1>Error 404</h1>
      <p>La ruta solicitada no existe.</p>
      <a href="/home" data-link class="button">
        Volver al inicio
      </a>
    </section>
  `;
}
