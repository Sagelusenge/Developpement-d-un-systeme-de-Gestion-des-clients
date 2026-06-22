const extractOutputText = (payload) => payload?.output_text || (payload?.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text)
    .join('\n')
    .trim();

export const generateBusinessReply = async ({ question, clientName, context }) => {
    const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
    if (!apiKey) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                instructions: `Tu es l'assistant professionnel de Quincaillerie Centrale a Goma. Reponds en francais, clairement, en 2 a 5 phrases. Utilise uniquement les donnees du CONTEXTE pour les prix, stocks, commandes et factures. N'invente jamais une disponibilite, un prix, une politique ou un delai. Si le contexte ne permet pas une reponse fiable, termine exactement par TRANSFERER_MANAGER. Ne revele jamais les couts d'achat ni les donnees d'un autre client.`,
                input: `CLIENT: ${clientName || 'Client'}\nQUESTION: ${question}\nCONTEXTE:\n${JSON.stringify(context)}`,
                max_output_tokens: 260
            })
        });
        if (!response.ok) return null;
        return extractOutputText(await response.json()) || null;
    } catch {
        return null;
    } finally { clearTimeout(timeout); }
};

export const generateManagerAnalysis = async (context) => {
    const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
    if (!apiKey) return null;
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', instructions: "Tu es un conseiller CRM pour une quincaillerie. Analyse uniquement les indicateurs fournis. Donne cinq constats courts et cinq actions prioritaires, sans inventer de chiffre. Reponds en francais professionnel, sans emoji.", input: JSON.stringify(context), max_output_tokens: 700 }) });
    if (!response.ok) return null;
    return extractOutputText(await response.json()) || null;
};
