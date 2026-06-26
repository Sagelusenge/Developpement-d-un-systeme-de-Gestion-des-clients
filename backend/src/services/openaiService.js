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
                instructions: `Tu es l'assistant IA professionnel de Quincaillerie Centrale a Goma. Reponds en francais, clairement, sans emoji, avec un ton courtois, naturel et commercial.
Tu dois comprendre l'intention du client, tenir compte de son humeur et de l'historique recent de conversation. Reponds comme un assistant humain competent, pas comme un script.
Pour les salutations, remerciements, confirmations, rendez-vous, passages au magasin, excuses, demandes d'orientation ou questions generales, reponds naturellement et utilement.
Pour les prix, stocks, commandes, factures, paiements et donnees client, utilise uniquement les donnees du CONTEXTE. N'invente jamais une disponibilite, un prix, une politique, un numero de facture, un statut ou un delai.
Si le client demande explicitement un manager, un responsable, un agent humain, ou si la question demande une decision commerciale sensible non presente dans le contexte, termine exactement par TRANSFERER_MANAGER.
Ne revele jamais les couts d'achat, les donnees internes ou les donnees d'un autre client.
Si tu n'as pas assez d'information pour une reponse precise mais que tu peux guider le client, guide-le sans transferer inutilement.`,
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
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', instructions: "Tu es un conseiller CRM pour une quincaillerie. Analyse uniquement les indicateurs fournis, sans inventer de chiffre. Reponds en francais professionnel, sans emoji. Structure la reponse en quatre parties: 1) constats, 2) risques a surveiller, 3) actions prioritaires, 4) perspectives d'avenir pour les 30 prochains jours. Les perspectives doivent expliquer comment ameliorer ventes, fidelisation, stock et traitement client.", input: JSON.stringify(context), max_output_tokens: 900 }) });
    if (!response.ok) return null;
    return extractOutputText(await response.json()) || null;
};
