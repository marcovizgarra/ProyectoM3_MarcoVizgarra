/**
 * @vitest-environment jsdom
 * @vitest-environment-options {"url": "http://localhost/"}
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

import { initRouter } from "../src/router.js";
import { initChat } from "../src/chat.js";

// Simulamos el módulo del chat para aislar el router.
vi.mock("../src/chat.js", () => ({
    renderChat: vi.fn(() =>
        '<section class="view chat-view">Chat</section>'
    ),
    initChat: vi.fn()
}));

let app;
let documentAddSpy;
let windowAddSpy;

// Obtiene un enlace de la navegación principal.
function navLink(path) {
    return document.querySelector(
        `.site-header nav a[href="${path}"]`
    );
}

// Inicializa el router en una ruta determinada.
function startRouter(path) {
    window.history.replaceState(null, "", path);
    initRouter(app);
}

// Simula el clic del usuario.
function clickLink(selector) {
    const element = document.querySelector(selector);

    const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0
    });

    element.dispatchEvent(event);

    return event;
}

beforeEach(() => {
    vi.clearAllMocks();

    window.history.replaceState(null, "", "/home");

    document.body.innerHTML = `
        <header class="site-header">
            <nav>
                <a href="/home" data-link>INICIO</a>
                <a href="/chat" data-link>CHAT</a>
                <a href="/about" data-link>ACERCA DE</a>
            </nav>
        </header>

        <main id="app"></main>
    `;

    app = document.querySelector("#app");

    // Registramos los listeners creados por el router.
    documentAddSpy = vi.spyOn(document, "addEventListener");
    windowAddSpy = vi.spyOn(window, "addEventListener");
});

afterEach(() => {
    // Eliminamos los listeners para aislar cada test.
    for (const [type, handler, options] of documentAddSpy.mock.calls) {
        if (type === "click") {
            document.removeEventListener(type, handler, options);
        }
    }

    for (const [type, handler, options] of windowAddSpy.mock.calls) {
        if (type === "popstate") {
            window.removeEventListener(type, handler, options);
        }
    }

    vi.restoreAllMocks();
    document.body.innerHTML = "";
});

describe("SPA Router", () => {

    it("redirige la ruta raíz a /home", () => {
        const replaceSpy = vi.spyOn(
            window.history,
            "replaceState"
        );

        startRouter("/");

        expect(window.location.pathname).toBe("/home");
        expect(replaceSpy).toHaveBeenCalledWith(
            null, "", "/home"
        );

        expect(app.querySelector(".home-view")).not.toBeNull();
    });

    it("renderiza correctamente la página Home", () => {
        startRouter("/home");

        expect(app.querySelector(".home-view")).not.toBeNull();

        expect(app.textContent).toContain(
            "Comunicate con el T-800"
        );

        expect(navLink("/home").classList.contains("active"))
            .toBe(true);

        expect(navLink("/home").getAttribute("aria-current"))
            .toBe("page");
    });

    it("renderiza correctamente la página About", () => {
        startRouter("/about");

        expect(app.querySelector(".about-view")).not.toBeNull();

        expect(app.textContent).toContain(
            "Acerca del proyecto"
        );

        expect(navLink("/about").classList.contains("active"))
            .toBe(true);
    });

    it("renderiza Chat y ejecuta initChat", () => {
        startRouter("/chat");

        expect(app.querySelector(".chat-view")).not.toBeNull();

        expect(initChat).toHaveBeenCalledExactlyOnceWith(app);

        expect(navLink("/chat").getAttribute("aria-current"))
            .toBe("page");
    });

    it("muestra la página 404 ante una ruta inexistente", () => {
        startRouter("/ruta-inexistente");

        expect(app.textContent).toContain("Error 404");

        expect(
            document.querySelector(
                ".site-header nav a.active"
            )
        ).toBeNull();

        expect(initChat).not.toHaveBeenCalled();
    });

    it("navega mediante enlaces internos sin recargar la página", () => {
        startRouter("/home");

        const pushSpy = vi.spyOn(
            window.history,
            "pushState"
        );

        const event = clickLink(
            '.site-header nav a[href="/about"]'
        );

        expect(event.defaultPrevented).toBe(true);

        expect(pushSpy).toHaveBeenCalledWith(
            null, "", "/about"
        );

        expect(window.location.pathname).toBe("/about");
        expect(app.querySelector(".about-view")).not.toBeNull();
    });

    it("permite navegar desde Home hacia Chat", () => {
        startRouter("/home");

        clickLink(".home-cta");

        expect(window.location.pathname).toBe("/chat");
        expect(app.querySelector(".chat-view")).not.toBeNull();

        expect(initChat).toHaveBeenCalledTimes(1);
    });

    it("detecta clics sobre elementos internos de un enlace", () => {
        startRouter("/home");

        navLink("/chat").innerHTML = "<span>CHAT</span>";

        clickLink('.site-header nav a[href="/chat"] span');

        expect(window.location.pathname).toBe("/chat");
        expect(initChat).toHaveBeenCalledTimes(1);
    });

    it("actualiza la vista cuando ocurre popstate", () => {
        startRouter("/home");

        window.history.pushState(null, "", "/about");

        window.dispatchEvent(
            new PopStateEvent("popstate")
        );

        expect(app.querySelector(".about-view")).not.toBeNull();

        window.history.replaceState(null, "", "/home");

        window.dispatchEvent(
            new PopStateEvent("popstate")
        );

        expect(app.querySelector(".home-view")).not.toBeNull();
        expect(navLink("/home").classList.contains("active"))
            .toBe(true);
    });

    it("permite regresar a Home desde la página 404", () => {
        startRouter("/inexistente");

        clickLink('#app a[href="/home"]');

        expect(window.location.pathname).toBe("/home");
        expect(app.querySelector(".home-view")).not.toBeNull();
    });

    it("evita agregar una entrada de historial al navegar a la misma ruta", () => {
        startRouter("/home");

        const pushSpy = vi.spyOn(
            window.history,
            "pushState"
        );

        const event = clickLink(
            '.site-header nav a[href="/home"]'
        );

        expect(event.defaultPrevented).toBe(true);
        expect(pushSpy).not.toHaveBeenCalled();
        expect(window.location.pathname).toBe("/home");
    });

});