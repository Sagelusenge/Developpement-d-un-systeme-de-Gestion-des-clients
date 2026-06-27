import crypto from 'crypto';

const STRIPE_API_URL = 'https://api.stripe.com/v1';

export const isStripeReady = () => Boolean(process.env.STRIPE_SECRET_KEY);

const encodeForm = (data, prefix) => {
    const pairs = [];
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;
        const formKey = prefix ? `${prefix}[${key}]` : key;
        if (Array.isArray(value)) {
            value.forEach((item, index) => pairs.push(...encodeForm(item, `${formKey}[${index}]`)));
        } else if (typeof value === 'object') {
            pairs.push(...encodeForm(value, formKey));
        } else {
            pairs.push([formKey, String(value)]);
        }
    }
    return pairs;
};

export const createStripeCheckoutSession = async ({
    internalReference,
    invoiceId,
    clientId,
    amount,
    currency = 'usd',
    successUrl,
    cancelUrl
}) => {
    if (!isStripeReady()) {
        const error = new Error('Stripe n est pas configure. Ajoutez STRIPE_SECRET_KEY sur le backend.');
        error.statusCode = 503;
        throw error;
    }

    const cents = Math.round(Number(amount) * 100);
    if (!Number.isInteger(cents) || cents <= 0) {
        throw new Error('Montant Stripe invalide.');
    }

    const payload = {
        mode: 'payment',
        success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        client_reference_id: internalReference,
        payment_method_types: ['card'],
        metadata: {
            internal_reference: internalReference,
            invoice_id: invoiceId,
            client_id: clientId
        },
        line_items: [{
            quantity: 1,
            price_data: {
                currency: String(currency || 'usd').toLowerCase(),
                unit_amount: cents,
                product_data: {
                    name: `Paiement facture ${invoiceId}`,
                    description: `Paiement test Stripe pour la facture ${invoiceId}`
                }
            }
        }]
    };

    const body = new URLSearchParams(encodeForm(payload));
    const response = await fetch(`${STRIPE_API_URL}/checkout/sessions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Idempotency-Key': internalReference
        },
        body
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data?.error?.message || 'Stripe a refuse la creation du paiement.');
        error.statusCode = response.status;
        throw error;
    }
    return data;
};

export const verifyStripeSignature = (rawBody, signatureHeader, secret) => {
    if (!secret) return true;
    if (!signatureHeader) return false;
    const parts = Object.fromEntries(String(signatureHeader).split(',').map((part) => {
        const [key, value] = part.split('=');
        return [key, value];
    }));
    const timestamp = parts.t;
    const signatures = String(signatureHeader)
        .split(',')
        .filter((part) => part.startsWith('v1='))
        .map((part) => part.slice(3));
    if (!timestamp || signatures.length === 0) return false;
    const payload = `${timestamp}.${Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '')}`;
    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return signatures.some((signature) => {
        const a = Buffer.from(signature, 'hex');
        const b = Buffer.from(expected, 'hex');
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
};
