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

export const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const brandedEmail = ({ eyebrow = 'QUINCAILLERIE CENTRALE', title, greeting, intro, content = '', notice = '', closing = 'L’equipe Quincaillerie Centrale' }) => `
<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f2f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent">${escapeHtml(intro || title)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f5f9;padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dce4ee;border-radius:16px;overflow:hidden;box-shadow:0 12px 35px rgba(6,38,74,.08)">
      <tr><td style="background:#06264a;padding:28px 34px;border-bottom:5px solid #f5b942">
        <div style="color:#8ec8ff;font-size:11px;font-weight:700;letter-spacing:2px">${escapeHtml(eyebrow)}</div>
        <h1 style="color:#ffffff;font-size:25px;line-height:1.25;margin:9px 0 0">${escapeHtml(title)}</h1>
      </td></tr>
      <tr><td style="padding:34px">
        <p style="font-size:16px;line-height:1.7;margin:0 0 16px">${escapeHtml(greeting || 'Bonjour')},</p>
        ${intro ? `<p style="color:#45566b;font-size:15px;line-height:1.75;margin:0 0 24px">${escapeHtml(intro)}</p>` : ''}
        ${content}
        ${notice ? `<div style="background:#eef6ff;border-left:4px solid #0b5ea8;border-radius:6px;color:#334b65;font-size:13px;line-height:1.65;margin:26px 0;padding:15px 17px">${escapeHtml(notice)}</div>` : ''}
        <p style="color:#45566b;font-size:14px;line-height:1.7;margin:28px 0 0">Cordialement,<br><strong style="color:#06264a">${escapeHtml(closing)}</strong></p>
      </td></tr>
      <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;color:#718096;font-size:11px;line-height:1.6;padding:18px 34px;text-align:center">Message automatique et securise. Ne transmettez jamais vos codes de verification ou mots de passe.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

export const codeBlock = (code, label = 'Votre code de verification') => `
  <div style="background:#f8fafc;border:1px solid #dce4ee;border-radius:12px;margin:22px 0;padding:22px;text-align:center">
    <div style="color:#64748b;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">${escapeHtml(label)}</div>
    <div style="color:#06264a;font-size:34px;font-weight:800;letter-spacing:9px;margin-top:12px">${escapeHtml(code)}</div>
  </div>`;

export const sendVerificationCodeEmail = ({ to, name, code }) => sendMail({
    to,
    subject: `${code} - Confirmez votre adresse email | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher client'},\n\nVotre code de confirmation est ${code}. Il expire dans 15 minutes.\n\nNe partagez jamais ce code.\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'CREATION DE VOTRE ESPACE CLIENT',
        title: 'Confirmez votre adresse email',
        greeting: `Bonjour ${name || 'cher client'}`,
        intro: 'Merci de rejoindre Quincaillerie Centrale. Utilisez le code ci-dessous pour finaliser la creation de votre espace personnel.',
        content: codeBlock(code),
        notice: 'Ce code expire dans 15 minutes. Si vous n’avez pas demande cette inscription, ignorez simplement ce message.'
    })
});

export const sendClientWelcomeEmail = ({ to, name }) => sendMail({
    to,
    subject: `Bienvenue dans votre espace client | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher client'},\n\nVotre adresse email est confirmee et votre espace client est maintenant actif. Vous pouvez passer des commandes, suivre vos achats et contacter notre equipe.\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'BIENVENUE CHEZ QUINCAILLERIE CENTRALE',
        title: 'Votre espace client est actif',
        greeting: `Bonjour ${name || 'cher client'}`,
        intro: 'Votre adresse email a ete confirmee avec succes. Votre espace personnel est maintenant pret.',
        content: `<div style="background:#f8fafc;border:1px solid #dce4ee;border-radius:10px;padding:18px"><p style="color:#45566b;line-height:1.75;margin:0">Vous pouvez desormais passer vos commandes, suivre leur avancement, consulter vos achats et transmettre une reclamation directement à notre equipe.</p></div>`,
        notice: 'Connectez-vous uniquement depuis le site officiel et gardez votre mot de passe confidentiel.'
    })
});

const productListHtml = (products = []) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dce4ee;border-radius:10px;border-collapse:separate;overflow:hidden">
    ${products.map((product) => {
        const prixHt = Number(product.prix_ht ?? product.prix_unitaire_ht ?? 0);
        const hasTax = product.taux_tva !== undefined && product.taux_tva !== null && String(product.taux_tva).trim() !== '' && Number(product.taux_tva) > 0;
        const taxRate = hasTax ? Number(product.taux_tva) : 0;
        const prixTtc = Number(product.prix_ttc ?? (prixHt * (1 + taxRate / 100)));
        const quantity = product.quantite_stock ?? product.quantite ?? '';
        const quantityLabel = typeof quantity === 'string' ? quantity : `${quantity} ${product.unite || 'piece'}`;
        const taxLabel = hasTax ? `TVA ${taxRate}% incluse` : 'TVA non facturee';
        return `<tr><td style="border-bottom:1px solid #e2e8f0;padding:13px 8px"><strong style="color:#06264a">${escapeHtml(product.nom)}</strong><br><span style="color:#64748b;font-size:13px">${escapeHtml(quantityLabel)}</span></td><td style="border-bottom:1px solid #e2e8f0;padding:13px 8px;text-align:right;white-space:nowrap"><strong>${escapeHtml(prixTtc.toFixed(2))} USD${hasTax ? ' TTC' : ''}</strong><br><span style="color:#64748b;font-size:12px">${escapeHtml(taxLabel)} · par ${escapeHtml(product.unite || 'piece')}</span></td></tr>`;
    }).join('')}
  </table>`;

export const sendProspectDiscoveryEmail = ({ to, name, products, catalogUrl }) => {
    const productRows = (products || []).map((product) => `<tr><td style="border-bottom:1px solid #e2e8f0;padding:13px 8px"><strong style="color:#06264a">${escapeHtml(product.nom)}</strong><br><span style="color:#64748b;font-size:13px">Disponible: ${escapeHtml(product.quantite_stock)} ${escapeHtml(product.unite || 'piece')}</span></td><td style="border-bottom:1px solid #e2e8f0;padding:13px 8px;text-align:right;white-space:nowrap"><strong>${escapeHtml(Number(product.prix_ht).toFixed(2))} USD</strong><br><span style="color:#64748b;font-size:12px">par ${escapeHtml(product.unite || 'piece')}</span></td></tr>`).join('');
    const safeUrl = escapeHtml(catalogUrl);
    return sendMail({
        to,
        subject: `Des produits disponibles pour vos projets | ${APP_NAME}`,
        text: `Bonjour ${name || 'cher client'},\n\nQuincaillerie Centrale est a votre disposition pour accompagner vos projets. Produits disponibles: ${(products || []).map((p) => `${p.nom} a ${Number(p.prix_ht).toFixed(2)} USD/${p.unite || 'piece'}`).join(', ')}.\n\nConsultez votre espace client: ${catalogUrl}\n\nL'equipe ${APP_NAME}`,
        html: brandedEmail({
            eyebrow: 'A VOTRE SERVICE A GOMA',
            title: 'Quelques produits pour demarrer votre projet',
            greeting: `Bonjour ${name || 'cher client'}`,
            intro: 'Quincaillerie Centrale est a votre disposition pour accompagner vos travaux. Voici une courte selection de produits reellement disponibles au moment de cet envoi.',
            content: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dce4ee;border-radius:10px;border-collapse:separate;overflow:hidden">${productRows}</table><div style="margin-top:24px;text-align:center"><a href="${safeUrl}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Consulter mon espace client</a></div>`,
            notice: 'Cette selection est volontairement courte. Les prix et disponibilites peuvent evoluer; votre espace client affiche les informations actuelles.'
        })
    });
};

export const sendOrderReceivedEmail = ({ to, name, orderId, total, lines, espaceUrl }) => sendMail({
    to,
    subject: `Commande ${orderId} recue | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher client'},\n\nNous avons bien recu votre commande ${orderId}. Total estime: ${Number(total || 0).toFixed(2)} USD. Notre equipe va la verifier et vous pourrez suivre son statut dans votre espace client.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'COMMANDE RECUE',
        title: `Votre commande ${orderId} est enregistree`,
        greeting: `Bonjour ${name || 'cher client'}`,
        intro: 'Merci pour votre confiance. Votre commande a ete transmise a notre equipe commerciale pour verification du stock et confirmation.',
        content: `${productListHtml((lines || []).map((line) => ({ ...line, quantite_stock: `Quantite: ${line.quantite}` })))}<div style="background:#f8fafc;border:1px solid #dce4ee;border-radius:10px;margin-top:18px;padding:16px;text-align:right"><span style="color:#64748b">Total estime</span><br><strong style="color:#06264a;font-size:22px">${escapeHtml(Number(total || 0).toFixed(2))} USD</strong></div>${espaceUrl ? `<div style="margin-top:24px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Suivre ma commande</a></div>` : ''}`,
        notice: 'Le montant reste confirme par la facture definitive. Vous recevrez une notification lorsque la commande evolue.'
    })
});

export const sendOrderStatusEmail = ({ to, name, orderId, status, espaceUrl }) => {
    const labels = {
        en_attente: 'en attente de verification',
        confirmee: 'confirmee',
        preparee: 'en preparation',
        livree: 'livree',
        annulee: 'annulee',
        rejetee: 'rejetee'
    };
    return sendMail({
        to,
        subject: `Mise a jour de votre commande ${orderId} | ${APP_NAME}`,
        text: `Bonjour ${name || 'cher client'},\n\nVotre commande ${orderId} est maintenant ${labels[status] || status}.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
        html: brandedEmail({
            eyebrow: 'SUIVI DE COMMANDE',
            title: `Commande ${orderId} : ${labels[status] || status}`,
            greeting: `Bonjour ${name || 'cher client'}`,
            intro: `Le statut de votre commande vient d'etre mis a jour. Elle est maintenant ${labels[status] || status}.`,
            content: espaceUrl ? `<div style="margin-top:8px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Ouvrir mon espace client</a></div>` : '',
            notice: 'Pour toute question, utilisez le chat de votre espace client afin de garder l’historique de la discussion.'
        })
    });
};

export const sendPublicContactReceivedEmail = ({ to, name, subject, espaceUrl }) => sendMail({
    to,
    subject: `Votre message a ete recu | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher client'},\n\nNous avons bien recu votre message: ${subject || 'Demande depuis le site'}. Notre equipe va le consulter et vous repondra si une suite est necessaire.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'MESSAGE RECU',
        title: 'Votre demande est bien arrivee',
        greeting: `Bonjour ${name || 'cher client'}`,
        intro: `Nous avons bien recu votre message${subject ? ` concernant "${subject}"` : ''}. Il sera consulte par notre equipe dans les meilleurs delais.`,
        content: espaceUrl ? `<div style="margin-top:8px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Acceder au site</a></div>` : '',
        notice: 'Cet email confirme uniquement la reception de votre demande. Pour le suivi des commandes, utilisez votre espace client.'
    })
});

export const sendReclamationReceivedEmail = ({ to, name, complaintId, subject, espaceUrl }) => sendMail({
    to,
    subject: `Reclamation ${complaintId} recue | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher client'},\n\nNous avons bien recu votre reclamation ${complaintId}: ${subject}. Le manager pourra la traiter depuis l'application.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'RECLAMATION RECUE',
        title: `Votre reclamation ${complaintId} est enregistree`,
        greeting: `Bonjour ${name || 'cher client'}`,
        intro: `Votre reclamation a ete transmise au manager. Elle porte sur: ${subject || 'demande client'}.`,
        content: `<div style="background:#f8fafc;border:1px solid #dce4ee;border-radius:10px;padding:18px"><p style="margin:0 0 8px"><strong>Reference :</strong> ${escapeHtml(complaintId)}</p><p style="margin:0"><strong>Statut initial :</strong> Ouverte</p></div>${espaceUrl ? `<div style="margin-top:24px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Suivre dans mon espace</a></div>` : ''}`,
        notice: 'Vous recevrez une information lorsque le statut de la reclamation evolue.'
    })
});

export const sendReclamationStatusEmail = ({ to, name, complaintId, status, response, espaceUrl }) => {
    const labels = {
        ouverte: 'ouverte',
        en_cours: 'en cours de traitement',
        resolue: 'resolue',
        cloturee: 'cloturee'
    };
    return sendMail({
        to,
        subject: `Mise a jour reclamation ${complaintId} | ${APP_NAME}`,
        text: `Bonjour ${name || 'cher client'},\n\nVotre reclamation ${complaintId} est maintenant ${labels[status] || status}.${response ? `\n\nReponse: ${response}` : ''}\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
        html: brandedEmail({
            eyebrow: 'SUIVI DE RECLAMATION',
            title: `Reclamation ${complaintId} : ${labels[status] || status}`,
            greeting: `Bonjour ${name || 'cher client'}`,
            intro: `Le statut de votre reclamation vient d'etre mis a jour: ${labels[status] || status}.`,
            content: `${response ? `<div style="background:#ffffff;border-left:4px solid #f5b942;color:#334155;line-height:1.7;padding:13px 15px">${escapeHtml(response)}</div>` : ''}${espaceUrl ? `<div style="margin-top:24px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Ouvrir mon espace client</a></div>` : ''}`,
            notice: 'Pour ajouter des precisions, utilisez votre espace client ou le chat afin de conserver l historique.'
        })
    });
};

export const sendInvoiceAvailableEmail = ({ to, name, orderId, invoiceId, total, espaceUrl }) => sendMail({
    to,
    subject: `Facture ${invoiceId} disponible | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher client'},\n\nVotre commande ${orderId} a ete transformee en facture ${invoiceId}. Montant: ${Number(total || 0).toFixed(2)} USD. Vous pouvez consulter vos achats et paiements dans votre espace client.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'FACTURE DISPONIBLE',
        title: `Votre facture ${invoiceId} est disponible`,
        greeting: `Bonjour ${name || 'cher client'}`,
        intro: `La commande ${orderId} a ete validee et transformee en facture. Vous pouvez maintenant consulter le montant, les paiements et le reste a payer.`,
        content: `<div style="background:#f8fafc;border:1px solid #dce4ee;border-radius:10px;padding:18px"><p style="margin:0 0 8px"><strong>Facture :</strong> ${escapeHtml(invoiceId)}</p><p style="margin:0"><strong>Montant :</strong> ${escapeHtml(Number(total || 0).toFixed(2))} USD</p></div>${espaceUrl ? `<div style="margin-top:24px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Consulter mes achats</a></div>` : ''}`,
        notice: 'Pour toute question sur le paiement ou le solde restant, consultez votre espace client ou contactez notre equipe.'
    })
});

export const sendInvoiceBalanceEmail = ({ to, name, invoiceId, total, paid = 0, remaining = 0, espaceUrl }) => {
    const totalNumber = Number(total || 0);
    const paidNumber = Number(paid || 0);
    const remainingNumber = Math.max(Number(remaining || 0), 0);
    const isPaid = remainingNumber <= 0.005;
    const title = isPaid
        ? `Facture ${invoiceId} payee`
        : `Facture ${invoiceId} : solde restant`;
    const intro = isPaid
        ? `Votre facture ${invoiceId} est entierement payee. Merci pour votre paiement.`
        : `Votre facture ${invoiceId} est enregistree. Un montant de ${remainingNumber.toFixed(2)} USD reste a payer.`;
    const subject = isPaid
        ? `Paiement complet - ${invoiceId} | ${APP_NAME}`
        : `Solde restant ${remainingNumber.toFixed(2)} USD - ${invoiceId} | ${APP_NAME}`;

    return sendMail({
        to,
        subject,
        text: isPaid
            ? `Bonjour ${name || 'cher client'},\n\nVous avez paye la totalite de la facture ${invoiceId}. Montant total: ${totalNumber.toFixed(2)} USD.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`
            : `Bonjour ${name || 'cher client'},\n\nLa facture ${invoiceId} est de ${totalNumber.toFixed(2)} USD. Montant deja paye: ${paidNumber.toFixed(2)} USD. Il reste a payer: ${remainingNumber.toFixed(2)} USD.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
        html: brandedEmail({
            eyebrow: isPaid ? 'PAIEMENT CONFIRME' : 'SUIVI DE FACTURE',
            title,
            greeting: `Bonjour ${name || 'cher client'}`,
            intro,
            content: `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dce4ee;border-radius:10px;border-collapse:separate;overflow:hidden">
                <tr><td style="background:#f8fafc;color:#45566b;font-weight:700;padding:12px">Facture</td><td style="padding:12px;text-align:right"><strong>${escapeHtml(invoiceId)}</strong></td></tr>
                <tr><td style="background:#f8fafc;color:#45566b;font-weight:700;padding:12px">Montant total</td><td style="padding:12px;text-align:right">${escapeHtml(totalNumber.toFixed(2))} USD</td></tr>
                <tr><td style="background:#f8fafc;color:#45566b;font-weight:700;padding:12px">Deja paye</td><td style="padding:12px;text-align:right">${escapeHtml(paidNumber.toFixed(2))} USD</td></tr>
                <tr><td style="background:${isPaid ? '#ecfdf3' : '#fff7ed'};color:#06264a;font-weight:800;padding:14px">Reste a payer</td><td style="background:${isPaid ? '#ecfdf3' : '#fff7ed'};color:${isPaid ? '#137333' : '#9a6400'};font-size:18px;font-weight:800;padding:14px;text-align:right">${escapeHtml(remainingNumber.toFixed(2))} USD</td></tr>
              </table>
              ${espaceUrl ? `<div style="margin-top:24px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Consulter mes factures</a></div>` : ''}`,
            notice: isPaid
                ? 'Conservez cette information avec vos documents de paiement.'
                : 'Si vous avez deja effectue un paiement, contactez notre equipe avec la reference de transaction.'
        })
    });
};

export const sendDebtReminderEmail = ({ to, name, invoices = [], totalDue, espaceUrl }) => {
    const invoiceRows = invoices.map((invoice) => `
        <tr>
          <td style="border-bottom:1px solid #e2e8f0;padding:12px 10px">
            <strong style="color:#06264a">${escapeHtml(invoice.numero_facture || invoice.id_ventes || '-')}</strong>
            <br><span style="color:#64748b;font-size:12px">${escapeHtml(invoice.date_vente || '')}</span>
          </td>
          <td style="border-bottom:1px solid #e2e8f0;padding:12px 10px;text-align:right;white-space:nowrap">
            <strong style="color:#9a6400">${escapeHtml(Number(invoice.reste_a_payer || 0).toFixed(2))} USD</strong>
          </td>
        </tr>`).join('');
    const invoiceSummary = invoices
        .map((invoice) => `${invoice.numero_facture || invoice.id_ventes}: ${Number(invoice.reste_a_payer || 0).toFixed(2)} USD`)
        .join(', ');

    return sendMail({
        to,
        subject: `Rappel de solde restant | ${APP_NAME}`,
        text: `Bonjour ${name || 'cher client'},\n\nSauf erreur de notre part, un solde total de ${Number(totalDue || 0).toFixed(2)} USD reste à regler sur vos factures: ${invoiceSummary}.\n\nVous pouvez consulter le detail dans votre espace client: ${espaceUrl || ''}\n\nSi votre paiement a deja ete effectue, veuillez ignorer ce rappel ou contacter notre equipe.\n\nL'equipe ${APP_NAME}`,
        html: brandedEmail({
            eyebrow: 'SUIVI DE VOS FACTURES',
            title: 'Rappel courtois de solde restant',
            greeting: `Bonjour ${name || 'cher client'}`,
            intro: `Sauf erreur de notre part, certaines de vos factures presentent encore un solde. Ce rappel vous permet de consulter la situation et de regulariser le paiement si necessaire.`,
            content: `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dce4ee;border-radius:10px;border-collapse:separate;overflow:hidden">
                <tr><th style="background:#f8fafc;color:#45566b;font-size:12px;padding:11px 10px;text-align:left">FACTURE</th><th style="background:#f8fafc;color:#45566b;font-size:12px;padding:11px 10px;text-align:right">RESTE À PAYER</th></tr>
                ${invoiceRows}
                <tr><td style="background:#eef6ff;color:#06264a;font-weight:700;padding:14px 10px">Total restant</td><td style="background:#eef6ff;color:#06264a;font-size:18px;font-weight:800;padding:14px 10px;text-align:right">${escapeHtml(Number(totalDue || 0).toFixed(2))} USD</td></tr>
              </table>
              ${espaceUrl ? `<div style="margin-top:24px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Consulter mes factures</a></div>` : ''}`,
            notice: 'Si vous avez deja effectue le paiement, ignorez simplement ce rappel ou contactez notre equipe en indiquant la reference de la transaction.'
        })
    });
};

export const sendInactiveClientEmail = ({ to, name, products, espaceUrl, days }) => sendMail({
    to,
    subject: `Des produits utiles pour vos prochains achats | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher client'},\n\nCela fait environ ${days || 7} jours que nous ne vous avons pas accompagne. Voici quelques produits disponibles susceptibles de vous interesser: ${(products || []).map((p) => `${p.nom} a ${Number(p.prix_ht).toFixed(2)} USD/${p.unite || 'piece'}`).join(', ')}.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'FIDELISATION CLIENT',
        title: 'Une selection basee sur vos achats',
        greeting: `Bonjour ${name || 'cher client'}`,
        intro: `Nous avons prepare une courte selection de produits disponibles, inspiree de vos achats precedents, pour vous aider a preparer vos prochains besoins.`,
        content: `${productListHtml(products)}${espaceUrl ? `<div style="margin-top:24px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Voir le catalogue</a></div>` : ''}`,
        notice: 'Nous limitons volontairement ces rappels afin de rester utiles et non envahissants.'
    })
});

export const sendCategoryNewProductEmail = ({ to, name, product, categoryName, espaceUrl }) => sendMail({
    to,
    subject: `Nouveau produit disponible en stock | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher client'},\n\nUn nouveau produit vient d'arriver dans notre stock: ${product.nom}, ${Number(product.prix_ht || 0).toFixed(2)} USD/${product.unite || 'piece'}. Categorie: ${categoryName || 'magasin'}.\n\n${espaceUrl || ''}\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'NOUVEAUTE EN STOCK',
        title: `${product.nom} est disponible`,
        greeting: `Bonjour ${name || 'cher client'}`,
        intro: `Un nouveau produit vient d'arriver dans notre stock${categoryName ? `, dans la categorie ${categoryName}` : ''}. Nous vous informons pour vous aider a preparer vos prochains achats.`,
        content: `${productListHtml([{ ...product, quantite_stock: `Stock: ${product.quantite_stock}` }])}${espaceUrl ? `<div style="margin-top:24px;text-align:center"><a href="${escapeHtml(espaceUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Consulter le produit</a></div>` : ''}`,
        notice: 'Nous limitons ces notifications aux nouveautes importantes afin de rester utiles et non envahissants.'
    })
});

export const sendPasswordCodeEmail = ({ to, name, code }) => sendMail({
    to,
    subject: `${code} - Reinitialisation de votre mot de passe | ${APP_NAME}`,
    text: `Bonjour ${name || 'cher utilisateur'},\n\nVotre code de reinitialisation est ${code}. Il expire dans 15 minutes.\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({
        eyebrow: 'SECURITE DU COMPTE', title: 'Reinitialisation du mot de passe', greeting: `Bonjour ${name || 'cher utilisateur'}`,
        intro: 'Une demande de reinitialisation a ete recue pour votre compte. Saisissez ce code dans l’application pour continuer.',
        content: codeBlock(code, 'Code de reinitialisation'),
        notice: 'Ce code expire dans 15 minutes. Si cette demande ne vient pas de vous, ne communiquez ce code à personne.'
    })
});

export const sendSecurityNoticeEmail = ({ to, name, title, message }) => sendMail({
    to, subject: `${title} | ${APP_NAME}`, text: `Bonjour ${name || 'cher utilisateur'},\n\n${message}\n\nL'equipe ${APP_NAME}`,
    html: brandedEmail({ eyebrow: 'AVIS DE SECURITE', title, greeting: `Bonjour ${name || 'cher utilisateur'}`, intro: message, notice: 'Si vous n’etes pas à l’origine de cette action, contactez rapidement un responsable.' })
});

export const sendManagerChatAlertEmail = ({ to, managerName, clientName, clientEmail, conversationId, message }) => sendMail({
    to,
    subject: `Question client a traiter - ${conversationId} | ${APP_NAME}`,
    text: `Bonjour ${managerName || 'Manager'},\n\n${clientName} (${clientEmail || 'email non renseigne'}) attend une reponse dans ${conversationId}.\n\nQuestion : ${message}\n\nConnectez-vous a l'espace manager pour repondre.`,
    html: brandedEmail({
        eyebrow: 'ASSISTANCE CLIENT',
        title: 'Une question necessite votre intervention',
        greeting: `Bonjour ${managerName || 'Manager'}`,
        intro: `L'assistant automatique n'a pas pu apporter une reponse suffisamment fiable a ${clientName || 'un client'}.`,
        content: `<div style="background:#f8fafc;border:1px solid #dce4ee;border-radius:10px;padding:18px"><p style="margin:0 0 9px"><strong>Conversation :</strong> ${escapeHtml(conversationId)}</p><p style="margin:0 0 9px"><strong>Client :</strong> ${escapeHtml(clientName || '-')}</p><p style="margin:0 0 16px"><strong>Email :</strong> ${escapeHtml(clientEmail || '-')}</p><div style="background:#ffffff;border-left:4px solid #f5b942;color:#334155;line-height:1.7;padding:13px 15px">${escapeHtml(message)}</div></div>`,
        notice: "Connectez-vous a l'espace manager, ouvrez Chat clients puis selectionnez cette conversation pour repondre."
    })
});

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

export const sendWelcomeUserEmail = async ({ to, name, role, resetUrl, company }) => {
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
        '',
        resetUrl ? `Cliquez ici pour definir votre mot de passe personnel : ${resetUrl}` : 'Utilisez la fonction Mot de passe oublie pour definir votre mot de passe personnel.',
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
                    </div>
                    <p style="margin:0 0 18px">Pour votre securite, aucun mot de passe n'est envoye en clair. Definissez votre mot de passe personnel avec le bouton ci-dessous.</p>
                    ${resetUrl ? `<p style="text-align:center;margin:22px 0"><a href="${escapeHtml(resetUrl)}" style="background:#0b5ea8;border-radius:8px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none">Cliquez ici pour reinitialiser mon mot de passe</a></p>` : ''}
                    <p style="margin:0">${APP_NAME} vous permet de centraliser les clients, factures, paiements et stocks de votre entreprise.</p>
                    <p style="margin:24px 0 0">Cordialement,<br><strong>Equipe ${APP_NAME}</strong></p>
                </div>
            </div>
        </div>
    `;

    return sendMail({ to, subject, text, html });
};
