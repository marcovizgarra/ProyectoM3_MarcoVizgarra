
import { renderHome, renderAbout, renderNotFound } from "./views.js";
import { renderChat, initChat } from "./chat.js";

const routes = {
    "/home": renderHome,
    "/chat": renderChat,
    "/about": renderAbout,
};

export function initRouter(container) {

    function render() {
        let path = window.location.pathname;

        if (path === "/") {
            path = "/home";
            history.replaceState(null, "", "/home");
        }

        const renderView = routes[path] ?? renderNotFound;
        container.innerHTML = renderView();

        if (path === "/chat") {
            initChat(container);
        }
  }

    document.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) return;

        const link = event.target.closest("a[data-link]");
        if (!link || event.button !== 0 ||
            event.ctrlKey || event.metaKey ||
            event.shiftKey || event.altKey) {
            return;
        }

        const url = new URL(link.href);
        if (url.origin !== window.location.origin) return;

        event.preventDefault();

        if (url.pathname !== window.location.pathname) {
            history.pushState(null, "", url.pathname);
        }

        render();
    });

    window.addEventListener("popstate", render);
    render();
}