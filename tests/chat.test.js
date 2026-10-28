/**
 * @vitest-environment jsdom
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

// Mock compartido con el módulo del chat.
const { getChatReplyMock } = vi.hoisted(() => ({
    getChatReplyMock: vi.fn()
}));

vi.mock("../src/services/chatApi.js", () => ({
    getChatReply: getChatReplyMock
}));

let form;
let input;
let button;
let messagesContainer;
let errorContainer;

// Simula el envío del formulario.
function sendMessage(text) {
    input.value = text;

    form.dispatchEvent(new Event("submit", {
        bubbles: true,
        cancelable: true
    }));
}

beforeEach(async () => {
    vi.resetModules();
    getChatReplyMock.mockReset();

    let nextId = 0;

    vi.stubGlobal("crypto", {
        randomUUID: () => `test-id-${++nextId}`
    });

    const { renderChat, initChat } =
        await import("../src/chat.js");

    document.body.innerHTML = `
        <main id="app">
            ${renderChat()}
        </main>
    `;

    const container = document.querySelector("#app");

    initChat(container);

    form = document.querySelector("#chat-form");
    input = document.querySelector("#chat-input");
    button = document.querySelector("#send-button");
    messagesContainer = document.querySelector("#chat-messages");
    errorContainer = document.querySelector("#chat-error");
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
});

describe("Chat UI", () => {

    it("inicializa correctamente la interfaz", () => {
        expect(form).not.toBeNull();
        expect(input).not.toBeNull();
        expect(button).not.toBeNull();

        expect(input.disabled).toBe(false);
        expect(button.disabled).toBe(false);
        expect(button.textContent).toBe("Enviar");

        expect(messagesContainer.children).toHaveLength(0);
    });

    it("rechaza mensajes que contienen solamente espacios", () => {
        const validationSpy = vi.spyOn(
            input,
            "reportValidity"
        );

        sendMessage("   ");

        expect(getChatReplyMock).not.toHaveBeenCalled();
        expect(input.value).toBe("");
        expect(validationSpy).toHaveBeenCalledOnce();
    });

    it("envía el mensaje y muestra la respuesta del T-800", async () => {
        getChatReplyMock.mockResolvedValue(
            "Objetivo completado."
        );

        sendMessage("  Hola T-800  ");

        expect(getChatReplyMock).toHaveBeenCalledWith([
            { role: "user", text: "Hola T-800" }
        ]);

        expect(input.disabled).toBe(true);
        expect(button.disabled).toBe(true);

        await vi.waitFor(() => {
            expect(
                messagesContainer.querySelectorAll(
                    ".message--assistant"
                )
            ).toHaveLength(1);
        });

        expect(
            messagesContainer.querySelector(".message--user")
                .textContent
        ).toBe("Hola T-800");

        expect(
            messagesContainer.querySelector(".message--assistant")
                .textContent
        ).toBe("Objetivo completado.");

        expect(
            messagesContainer.querySelector(".message-avatar")
        ).not.toBeNull();

        expect(input.disabled).toBe(false);
        expect(button.disabled).toBe(false);
    });

    it("impide enviar dos solicitudes simultáneas", async () => {
        let resolveReply;

        getChatReplyMock.mockImplementation(() =>
            new Promise(resolve => {
                resolveReply = resolve;
            })
        );

        sendMessage("Primer mensaje");
        sendMessage("Segundo mensaje");

        expect(getChatReplyMock).toHaveBeenCalledTimes(1);

        resolveReply("Recibido.");

        await vi.waitFor(() => {
            expect(button.disabled).toBe(false);
        });
    });

    it("cambia el indicador a Procesando después de 3,2 segundos", async () => {
        vi.useFakeTimers();

        let resolveReply;

        getChatReplyMock.mockImplementation(() =>
            new Promise(resolve => {
                resolveReply = resolve;
            })
        );

        sendMessage("Analizá esta información");

        const indicator = () =>
            messagesContainer.querySelector(
                ".typing-indicator__label"
            );

        expect(indicator().textContent)
            .toBe("T-800 está escribiendo...");

        await vi.advanceTimersByTimeAsync(3199);

        expect(indicator().textContent)
            .toBe("T-800 está escribiendo...");

        await vi.advanceTimersByTimeAsync(1);

        expect(indicator().textContent)
            .toBe("Procesando...");

        expect(
            messagesContainer.querySelector(
                ".typing-indicator__spinner"
            )
        ).not.toBeNull();

        resolveReply("Análisis completado.");

        await Promise.resolve();
        await Promise.resolve();

        expect(indicator()).toBeNull();
        expect(button.disabled).toBe(false);
    });

    it("muestra el error cuando falla la solicitud", async () => {
        getChatReplyMock.mockRejectedValue(
            new Error("Límite de solicitudes alcanzado.")
        );

        sendMessage("Hola");

        await vi.waitFor(() => {
            expect(errorContainer.textContent).toBe(
                "Límite de solicitudes alcanzado."
            );
        });

        expect(
            errorContainer.classList.contains(
                "chat-error--visible"
            )
        ).toBe(true);

        expect(button.disabled).toBe(false);
        expect(input.disabled).toBe(false);

        expect(
            messagesContainer.querySelectorAll(
                ".message--assistant"
            )
        ).toHaveLength(0);
    });

    it("excluye del historial los mensajes fallidos", async () => {
        getChatReplyMock
            .mockRejectedValueOnce(
                new Error("Error temporal")
            )
            .mockResolvedValueOnce(
                "Conexión restablecida."
            );

        sendMessage("Primer intento");

        await vi.waitFor(() => {
            expect(errorContainer.textContent)
                .toBe("Error temporal");
        });

        sendMessage("Segundo intento");

        await vi.waitFor(() => {
            expect(
                messagesContainer.querySelectorAll(
                    ".message--assistant"
                )
            ).toHaveLength(1);
        });

        expect(getChatReplyMock).toHaveBeenNthCalledWith(
            2,
            [
                { role: "user", text: "Segundo intento" }
            ]
        );

        expect(errorContainer.textContent).toBe("");
    });

    it("envía solamente los últimos 21 mensajes del historial", async () => {
        getChatReplyMock.mockResolvedValue("Recibido.");

        for (let i = 1; i <= 12; i++) {
            sendMessage(`Mensaje ${i}`);

            await vi.waitFor(() => {
                expect(
                    messagesContainer.querySelectorAll(
                        ".message--assistant"
                    )
                ).toHaveLength(i);
            });
        }

        const lastHistory =
            getChatReplyMock.mock.lastCall[0];

        expect(getChatReplyMock).toHaveBeenCalledTimes(12);
        expect(lastHistory).toHaveLength(21);

        expect(lastHistory[0]).toEqual({
            role: "user",
            text: "Mensaje 2"
        });

        expect(lastHistory.at(-1)).toEqual({
            role: "user",
            text: "Mensaje 12"
        });
    });

    it("muestra el texto de Gemini sin interpretarlo como HTML", async () => {
        const unsafeText = "<script>alert('test')</script>";

        getChatReplyMock.mockResolvedValue(unsafeText);

        sendMessage("Hola");

        await vi.waitFor(() => {
            expect(
                messagesContainer.querySelector(
                    ".message--assistant"
                )?.textContent
            ).toBe(unsafeText);
        });

        expect(
            messagesContainer.querySelector("script")
        ).toBeNull();
    });

});