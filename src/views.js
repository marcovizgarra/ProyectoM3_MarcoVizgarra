

export function renderHome() {
  return `
    <section class="view home-view">

      <div class="home-intro">
        <p class="eyebrow">CYBERDYNE SYSTEMS</p>

        <h1>Comunicate con el T-800</h1>

        <p class="home-lead">
          Interactuá con el organismo cibernético
          de Terminator 2 mediante inteligencia artificial.
        </p>
      </div>

      <img
        src="/img/t800_banner_home.jpg"
        alt="El T-800 sobre una motocicleta"
        class="home-banner"
        width="2048"
        height="857"
      />

      <div class="home-features"
           aria-label="Características del sistema">

        <article class="home-feature">
          <span class="home-feature__number">01</span>
          <div>
            <h2>Identidad T-800</h2>
            <p>
              Personalidad inspirada en el organismo
              cibernético de Terminator 2.
            </p>
          </div>
        </article>

        <article class="home-feature">
          <span class="home-feature__number">02</span>
          <div>
            <h2>IA conversacional</h2>
            <p>
              Interactuá mediante respuestas generadas
              con la API de Gemini.
            </p>
          </div>
        </article>

        <article class="home-feature">
          <span class="home-feature__number">03</span>
          <div>
            <h2>Contexto de sesión</h2>
            <p>
              La conversación conserva su historial
              y utiliza los últimos 21 mensajes.
            </p>
          </div>
        </article>

      </div>

      <a href="/chat"
         data-link
         class="button home-cta">
        Iniciar conversación
      </a>

    </section>
  `;
}



export function renderAbout() {
  return `
    <section class="view about-view">

      <header class="about-header">
        <p class="eyebrow">PROYECTO INTEGRADOR | HENRY M3</p>

        <h1>Acerca del proyecto</h1>

        <p class="about-description">
          Una experiencia conversacional inspirada en
          Terminator 2: El juicio final, que combina
          desarrollo web moderno e inteligencia
          artificial generativa.
        </p>
      </header>

      <div class="about-grid">

        <article class="about-card">
          <span class="about-card__number">01</span>

          <h2>El personaje</h2>

          <p>
            El T-800 de Terminator 2, reinterpretado
            como un asistente conversacional que
            conserva su personalidad lógica,
            directa y característica.
          </p>
        </article>

        <article class="about-card">
          <span class="about-card__number">02</span>

          <h2>Desarrollo</h2>

          <p>
            Aplicación de página única (SPA)
            desarrollada con HTML, CSS y JavaScript,
            utilizando Vite y un sistema de
            navegación mediante rutas.
          </p>
        </article>

        <article class="about-card">
          <span class="about-card__number">03</span>

          <h2>Inteligencia artificial</h2>

          <p>
            Integración con la API de Gemini mediante
            una función serverless, instrucciones
            de personalidad y manejo del contexto
            conversacional.
          </p>
        </article>

        <article class="about-card">
          <span class="about-card__number">04</span>

          <h2>Propósito académico</h2>

          <p>
            Proyecto Integrador del Módulo 3 de Henry,
            orientado a aplicar conceptos de
            desarrollo frontend, asincronía,
            consumo de APIs y despliegue web.
          </p>
        </article>

      </div>


      <section class="about-technologies"
              aria-labelledby="technologies-title">

        <h2 id="technologies-title">
          Tecnologías utilizadas
        </h2>

        <div class="about-tech-grid">

      <div class="about-tech-item">
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"
          alt="HTML5"
          class="about-tech-icon"
        />
        <span>HTML5</span>
      </div>

      <div class="about-tech-item">
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg"
          alt="CSS3"
          class="about-tech-icon"
        />
        <span>CSS3</span>
      </div>

      <div class="about-tech-item">
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"
          alt="JavaScript"
          class="about-tech-icon"
        />
        <span>JavaScript</span>
      </div>

      <div class="about-tech-item">
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg"
          alt="Vite"
          class="about-tech-icon"
        />
        <span>Vite</span>
      </div>

      <div class="about-tech-item">
        <img
          src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/google-gemini.svg"
          alt="Gemini API"
          class="about-tech-icon"
        />
        <span>Gemini API</span>
      </div>

      <div class="about-tech-item">
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg"
          alt="Vercel"
          class="about-tech-icon about-tech-icon--light"
        />
        <span>Vercel</span>
      </div>

      <div class="about-tech-item">
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
          alt="GitHub"
          class="about-tech-icon about-tech-icon--light"
        />
        <span>GitHub</span>
      </div>

      <div class="about-tech-item">
        <img
          src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/openai-chatgpt/default.svg"
          alt="ChatGPT"
          class="about-tech-icon about-tech-icon--light"
        />
        <span>ChatGPT</span>
      </div>
      </div>
     </section>

      <div class="about-actions">
        <a href="/chat" data-link class="button">
          Conversar con el T-800
        </a>

        <a
          href="https://github.com/marcovizgarra/ProyectoM3_MarcoVizgarra"
          target="_blank"
          rel="noopener noreferrer"
          class="about-source"
        >
          Ver código fuente
        </a>
      </div>
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
