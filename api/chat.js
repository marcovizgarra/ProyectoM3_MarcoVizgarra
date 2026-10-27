import { generateT800Reply } from "../server/gemini.js";

export default {
    async fetch(request) {
        if (request.method !== "POST") {
            return Response.json(
                { error: "Método no permitido." },
                { status: 405 }
            );
        }

        let body;

        try {
            body = await request.json();
        } catch {
            return Response.json(
                { error: "El JSON recibido es inválido." },
                { status: 400 }
            );
        }

        const messages = body?.messages;

        if (
            !Array.isArray(messages) ||
            messages.length === 0 ||
            !messages.every(
                (message) =>
                    ["user", "assistant"].includes(message?.role) &&
                    typeof message.text === "string" &&
                    message.text.trim().length > 0
            ) ||
            messages.at(-1).role !== "user"
        ) {
            return Response.json(
                { error: "Historial de conversación inválido." },
                { status: 400 }
            );
        }

        try {
            const reply = await generateT800Reply(messages);

            return Response.json({ reply });
        } catch (error) {
            console.error("Error al generar la respuesta:", error);

            return Response.json(
                { error: "No se pudo generar la respuesta. Intentá nuevamente." },
                { status: 502 }
            );
        }
    }
};