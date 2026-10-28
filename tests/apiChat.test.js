import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

import handler from "../api/chat.js";
import { generateT800Reply } from "../server/gemini.js";

// Sustituimos la función real por una función simulada.
vi.mock("../server/gemini.js", () => ({
    generateT800Reply: vi.fn()
}));

const messages = [
    { role: "user", text: "Hola" },
    { role: "assistant", text: "Hola, humano." },
    { role: "user", text: "¿Quién sos?" }
];

// Construye una solicitud POST para nuestro endpoint.
function createRequest(body) {
    return new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}

beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(generateT800Reply)
        .mockResolvedValue("Soy el T-800.");
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("API /api/chat", () => {

    it("devuelve 200 y la respuesta de Gemini", async () => {
        const request = createRequest({ messages });

        const response = await handler.fetch(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            reply: "Soy el T-800."
        });

        expect(generateT800Reply)
            .toHaveBeenCalledExactlyOnceWith(messages);
    });

    it("rechaza métodos distintos de POST", async () => {
        const request = new Request(
            "http://localhost/api/chat",
            { method: "GET" }
        );

        const response = await handler.fetch(request);
        const data = await response.json();

        expect(response.status).toBe(405);
        expect(data.error).toBe("Método no permitido.");

        expect(generateT800Reply).not.toHaveBeenCalled();
    });

    it("rechaza un JSON malformado", async () => {
        const request = new Request(
            "http://localhost/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: "{invalid"
            }
        );

        const response = await handler.fetch(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            "El JSON recibido es inválido."
        );

        expect(generateT800Reply).not.toHaveBeenCalled();
    });

    it.each([
        {
            description: "falta la propiedad messages",
            body: {}
        },
        {
            description: "messages es null",
            body: { messages: null }
        },
        {
            description: "el historial está vacío",
            body: { messages: [] }
        },
        {
            description: "el rol es inválido",
            body: {
                messages: [
                    { role: "system", text: "Hola" }
                ]
            }
        },
        {
            description: "el texto está vacío",
            body: {
                messages: [
                    { role: "user", text: "" }
                ]
            }
        },
        {
            description: "el texto no es un string",
            body: {
                messages: [
                    { role: "user", text: 123 }
                ]
            }
        },
        {
            description: "el último mensaje no es del usuario",
            body: {
                messages: [
                    { role: "user", text: "Hola" },
                    { role: "assistant", text: "Hola, humano." }
                ]
            }
        }
    ])("rechaza el historial cuando $description", async ({ body }) => {
        const request = createRequest(body);

        const response = await handler.fetch(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            "Historial de conversación inválido."
        );

        expect(generateT800Reply).not.toHaveBeenCalled();
    });

    it("devuelve 429 cuando Gemini alcanza su cuota", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        const error = new Error("Quota exceeded");
        error.status = 429;

        vi.mocked(generateT800Reply)
            .mockRejectedValue(error);

        const response = await handler.fetch(
            createRequest({ messages })
        );

        const data = await response.json();

        expect(response.status).toBe(429);

        expect(data.error).toBe(
            "Los sistemas de comunicación de Cyberdyne han alcanzado su límite operativo diario. Intentá nuevamente más tarde."
        );
    });

    it("devuelve 502 ante un error inesperado de Gemini", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(generateT800Reply)
            .mockRejectedValue(
                new Error("Error inesperado")
            );

        const response = await handler.fetch(
            createRequest({ messages })
        );

        const data = await response.json();

        expect(response.status).toBe(502);

        expect(data.error).toBe(
            "No se pudo generar la respuesta. Intentá nuevamente."
        );
    });

});