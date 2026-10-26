import { initRouter } from "./router.js";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("No se encontró el contenedor de la aplicación.");
}

initRouter(app);