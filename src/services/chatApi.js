export async function getChatReply(messages) {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error ?? `Error HTTP ${response.status}`);
    }

    if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("El servidor devolvió una respuesta inválida.");
    }

    return data.reply;
}