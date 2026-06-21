const subscribers = new Map();

export const subscribeToChat = (entrepriseId, response) => {
    const key = String(entrepriseId);
    const clients = subscribers.get(key) || new Set();
    clients.add(response);
    subscribers.set(key, clients);

    return () => {
        clients.delete(response);
        if (!clients.size) subscribers.delete(key);
    };
};

export const publishChatUpdate = (entrepriseId, payload) => {
    const data = `event: chat-update\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const response of subscribers.get(String(entrepriseId)) || []) {
        response.write(data);
    }
};
