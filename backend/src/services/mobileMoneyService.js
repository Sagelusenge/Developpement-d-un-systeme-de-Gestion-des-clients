export const initiateMobileMoneyPayment = async ({ invoiceId, operator, phone, amount, clientId }) => {
    const url = String(process.env.MOBILE_MONEY_PROVIDER_URL || '').trim();
    const key = String(process.env.MOBILE_MONEY_PROVIDER_KEY || '').trim();
    if (!url || !key) return null;
    const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId, operator, phone, amount, client_id: clientId, callback_url: process.env.MOBILE_MONEY_CALLBACK_URL || undefined })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Le prestataire Mobile Money a refuse la demande.');
    const status = String(data.status || '').toLowerCase();
    return { reference: String(data.reference || data.transaction_id || '').trim().toUpperCase(), confirmed: ['success', 'successful', 'confirmed', 'completed'].includes(status) };
};
