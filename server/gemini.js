import { T800_SYSTEM_PROMPT } from "./t800Prompt.js";

const MODEL = "gemini-3.5-flash-lite";

export async function generateT800Reply(messages) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY no está configurada.");
    }

    const contents = messages.map(({ role, text }) => ({
        role: role === "assistant" ? "model" : "user",
        parts: [{ text }]
    }));

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: T800_SYSTEM_PROMPT }]
                },
                contents
            })
        }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.error(
            "Error de Gemini:",
            response.status,
            data.error?.message
        );

        const error = new Error(
            "No se pudo obtener una respuesta de Gemini."
        );

        error.status = response.status;

        throw error;
    }

    const reply = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim();

    if (!reply) {
        throw new Error("Gemini no devolvió una respuesta válida.");
    }

    return reply;
}