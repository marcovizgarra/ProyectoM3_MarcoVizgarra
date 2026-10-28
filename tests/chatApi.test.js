import { afterEach, describe, expect, it, vi } from "vitest";
import { getChatReply } from "../src/services/chatApi.js";

const messages = [
    { role: "user", text: "Hola" },
    { role: "assistant", text: "Hola, humano." },
    { role: "user", text: "¿Quién sos?" }
];

// Simula una respuesta HTTP del servidor.
function mockFetch(body, status = 200) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: vi.fn().mockResolvedValue(body)
    });

    vi.stubGlobal("fetch", fetchMock);

    return fetchMock;
}

// Restaura fetch después de cada test.
afterEach(() => {
    vi.unstubAllGlobals();
});

describe("getChatReply", () => {

    it("envía el historial mediante POST y devuelve la respuesta", async () => {
        const fetchMock = mockFetch({
            reply: "Soy un organismo cibernético."
        });

        const result = await getChatReply(messages);

        expect(fetchMock).toHaveBeenCalledWith("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages })
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result).toBe("Soy un organismo cibernético.");
    });

    it("propaga el mensaje del servidor ante un error 429", async () => {
        mockFetch({
            error: "Los sistemas de Cyberdyne alcanzaron su límite."
        }, 429);

        await expect(getChatReply(messages))
            .rejects.toThrow(
                "Los sistemas de Cyberdyne alcanzaron su límite."
            );
    });

    it("genera un error HTTP genérico si no recibe un mensaje", async () => {
        mockFetch({}, 502);

        await expect(getChatReply(messages))
            .rejects.toThrow("Error HTTP 502");
    });

    it("rechaza una respuesta vacía", async () => {
        mockFetch({ reply: "" });

        await expect(getChatReply(messages))
            .rejects.toThrow(
                "El servidor devolvió una respuesta inválida."
            );
    });

    it("rechaza una respuesta que contiene solamente espacios", async () => {
        mockFetch({ reply: "   " });

        await expect(getChatReply(messages))
            .rejects.toThrow(
                "El servidor devolvió una respuesta inválida."
            );
    });

    it("rechaza una respuesta que no es un string", async () => {
        mockFetch({ reply: 123 });

        await expect(getChatReply(messages))
            .rejects.toThrow(
                "El servidor devolvió una respuesta inválida."
            );
    });

    it("propaga errores de conexión", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockRejectedValue(
                new Error("Error de conexión")
            )
        );

        await expect(getChatReply(messages))
            .rejects.toThrow("Error de conexión");
    });

    it("propaga errores al interpretar el JSON", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockRejectedValue(
                    new SyntaxError("JSON inválido")
                )
            })
        );

        await expect(getChatReply(messages))
            .rejects.toThrow("JSON inválido");
    });

});