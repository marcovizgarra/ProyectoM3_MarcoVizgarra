import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";

import { generateT800Reply } from "../server/gemini.js";
import { T800_SYSTEM_PROMPT } from "../server/t800Prompt.js";

const messages = [
    { role: "user", text: "Hola" },
    { role: "assistant", text: "Hola, humano." },
    { role: "user", text: "¿Quién sos?" }
];

// Simula una respuesta de la API de Gemini.
function mockGeminiResponse(body, status = 200) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: vi.fn().mockResolvedValue(body)
    });

    vi.stubGlobal("fetch", fetchMock);

    return fetchMock;
}

// Configura una clave ficticia antes de cada test.
beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-api-key");
});

// Restaura las modificaciones después de cada test.
afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe("generateT800Reply", () => {

    it("envía correctamente el historial y el prompt a Gemini", async () => {
        const fetchMock = mockGeminiResponse({
            candidates: [{
                content: {
                    parts: [{ text: "Soy el T-800." }]
                }
            }]
        });

        const result = await generateT800Reply(messages);

        expect(result).toBe("Soy el T-800.");
        expect(fetchMock).toHaveBeenCalledTimes(1);

        const [url, options] = fetchMock.mock.calls[0];

        expect(url).toBe(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
        );

        expect(options.method).toBe("POST");

        expect(options.headers).toEqual({
            "Content-Type": "application/json",
            "x-goog-api-key": "test-api-key"
        });

        const body = JSON.parse(options.body);

        expect(body.system_instruction).toEqual({
            parts: [{ text: T800_SYSTEM_PROMPT }]
        });

        expect(body.contents).toEqual([
            {
                role: "user",
                parts: [{ text: "Hola" }]
            },
            {
                role: "model",
                parts: [{ text: "Hola, humano." }]
            },
            {
                role: "user",
                parts: [{ text: "¿Quién sos?" }]
            }
        ]);
    });

    it("combina las partes de una respuesta y elimina espacios externos", async () => {
        mockGeminiResponse({
            candidates: [{
                content: {
                    parts: [
                        { text: "  Soy un " },
                        { text: "organismo cibernético.  " }
                    ]
                }
            }]
        });

        const result = await generateT800Reply(messages);

        expect(result).toBe("Soy un organismo cibernético.");
    });

    it("rechaza la petición si falta la API key", async () => {
        vi.stubEnv("GEMINI_API_KEY", "");

        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await expect(generateT800Reply(messages))
            .rejects.toThrow(
                "GEMINI_API_KEY no está configurada."
            );

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([429, 500])(
        "propaga correctamente un error HTTP %i",
        async (status) => {
            vi.spyOn(console, "error").mockImplementation(() => {});

            mockGeminiResponse({
                error: {
                    message: "Error de Gemini"
                }
            }, status);

            await expect(generateT800Reply(messages))
                .rejects.toMatchObject({
                    message: "No se pudo obtener una respuesta de Gemini.",
                    status
                });
        }
    );

    it("rechaza una respuesta sin candidatos", async () => {
        mockGeminiResponse({
            candidates: []
        });

        await expect(generateT800Reply(messages))
            .rejects.toThrow(
                "Gemini no devolvió una respuesta válida."
            );
    });

    it("rechaza una respuesta que contiene solamente espacios", async () => {
        mockGeminiResponse({
            candidates: [{
                content: {
                    parts: [{ text: "   " }]
                }
            }]
        });

        await expect(generateT800Reply(messages))
            .rejects.toThrow(
                "Gemini no devolvió una respuesta válida."
            );
    });

    it("maneja una respuesta JSON inválida", async () => {
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

        await expect(generateT800Reply(messages))
            .rejects.toThrow(
                "Gemini no devolvió una respuesta válida."
            );
    });

    it("propaga errores de conexión con Gemini", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockRejectedValue(
                new Error("Error de conexión")
            )
        );

        await expect(generateT800Reply(messages))
            .rejects.toThrow("Error de conexión");
    });

});