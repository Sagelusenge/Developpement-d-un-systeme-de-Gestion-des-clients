import nodemailer from 'nodemailer';

const APP_NAME = 'Quincaillerie Centrale';

const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT || 465),
        secure: String(process.env.EMAIL_SECURE || 'true') !== 'false',
        family: Number(process.env.EMAIL_IP_FAMILY || 4),
        connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT || 15000),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const isMailReady = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const sendMail = async ({ to, subject, text, html, replyTo, fromName }) => {
    const transporter = getTransporter();

    if (!transporter) {
        return { skipped: true, message: 'Configuration email absente' };
    }

    const info = await transporter.sendMail({
        from: `"${fromName || APP_NAME}" <${process.env.EMAIL_USER}>`,
        ...(replyTo ? { replyTo } : {}),
        to,
        subject,
        text,
        html
    });

    return { skipped: false, messageId: info.messageId };
};

export const getMailErrorMessage = (error) => {
    const rawMessage = String(error?.message || '');
    const rawCode = String(error?.code || '');
    const text = `${rawCode} ${rawMessage}`;

    if (/ENETUNREACH|ETIMEDOUT|Connection timeout|ECONNECTION/i.test(text)) {
        return "Le serveur n'arrive pas a joindre Gmail. Verifiez EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=465, EMAIL_SECURE=true et EMAIL_IP_FAMILY=4 dans Render, puis redeployez.";
    }

    if (/EAUTH|Invalid login|Username and Password not accepted|535/i.test(text)) {
        return "Gmail refuse l'identifiant ou le mot de passe d'application. Verifiez EMAIL_USER et EMAIL_PASS dans Render.";
    }

    return rawMessage || "Impossible d'envoyer l'email pour le moment.";
};

export const sendWelcomeUserEmail = async ({ to, name, role, password, company }) => {
    if (!to) return { skipped: true, message: 'Destinataire absent' };

    const displayName = name || 'cher utilisateur';
    const displayRole = role || 'utilisateur';
    const displayCompany = company || 'votre entreprise';
    const subject = `Vos acces ${APP_NAME}${company ? ` - ${company}` : ''}`;
    const text = [
        `Bonjour ${displayName},`,
        '',
        `Votre compte ${APP_NAME} pour ${displayCompany} a ete cree avec succes.`,
        '',
        'Voici vos informations de connexion :',
        `Identifiant : ${to}`,
        `Role : ${displayRole}`,
        password ? `Mot de passe temporaire : ${password}` : '',
        '',
        'Pour votre securite, veuillez vous connecter puis remplacer ce mot de passe temporaire par un mot de passe personnel.',
        '',
        `${APP_NAME} centralise les clients, factures, paiements et stocks de votre entreprise.`,
        '',
        'Cordialement,',
        `Equipe ${APP_NAME}`
    ].filter(Boolean).join('\n');

    const html = `
        <div style="margin:0;background:#f4f6fb;padding:24px;font-family:Arial,sans-serif;color:#111827;line-height:1.6">
            <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d8deea;border-radius:10px;overflow:hidden">
                <div style="background:#002b67;color:#ffffff;padding:22px 26px">
                    <h1 style="margin:0;font-size:22px">Bienvenue sur ${APP_NAME}</h1>
                    <p style="margin:6px 0 0;color:#dbeafe">Votre espace de gestion est pret.</p>
                </div>
                <div style="padding:26px">
                    <p>Bonjour <strong>${escapeHtml(displayName)}</strong>,</p>
                    <p>Votre compte ${APP_NAME} pour <strong>${escapeHtml(displayCompany)}</strong> a ete cree avec succes.</p>
                    <div style="background:#f8fafc;border:1px solid #d8deea;border-radius:8px;padding:16px;margin:20px 0">
                        <p style="margin:0 0 8px"><strong>Identifiant :</strong> ${escapeHtml(to)}</p>
                        <p style="margin:0 0 8px"><strong>Role :</strong> ${escapeHtml(displayRole)}</p>
                        ${password ? `<p style="margin:0"><strong>Mot de passe temporaire :</strong> ${escapeHtml(password)}</p>` : ''}
                    </div>
                    <p style="margin:0 0 12px">Pour votre securite, connectez-vous puis remplacez ce mot de passe temporaire par un mot de passe personnel.</p>
                    <p style="margin:0">${APP_NAME} vous permet de centraliser les clients, factures, paiements et stocks de votre entreprise.</p>
                    <p style="margin:24px 0 0">Cordialement,<br><strong>Equipe ${APP_NAME}</strong></p>
                </div>
            </div>
        </div>
    `;

    return sendMail({ to, subject, text, html });
};
