import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Archive,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Bell,
  Box,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Coins,
  CreditCard,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Grid2X2,
  Hammer,
  HelpCircle,
  Home,
  LockKeyhole,
  LogOut,
  LogIn,
  Mail,
  MapPin,
  MessageCircle,
  Menu,
  Moon,
  Package,
  Plus,
  Printer,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  SunMedium,
  Tags,
  Target,
  TrendingUp,
  Trash2,
  UserCog,
  Users,
  WalletCards,
  X
} from 'lucide-react';
import '../styles.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const APP_NAME = 'Quincaillerie Centrale';
const APP_TAGLINE = 'Gestion commerciale interne';
const LOGO_URL = '/qc-logo.png';

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const formatUsd = (value) => `USD ${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const formatUsdCompact = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1000000) return `USD ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `USD ${(amount / 1000).toFixed(1)}k`;
  return formatUsd(amount);
};

const money = (value) => `${Number(value || 0).toFixed(2)} USD`;

const moneySmart = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })} USD`;
};

const hasTax = (value) => value !== undefined && value !== null && String(value).trim() !== '' && Number(value) > 0;
const taxRate = (value) => (hasTax(value) ? Number(value) : 0);
const priceWithTax = (item) => Number(item?.prix_ht || item?.prix_unitaire_ht || 0) * (1 + taxRate(item?.taux_tva) / 100);
const taxText = (item) => (hasTax(item?.taux_tva) ? `TVA ${Number(item.taux_tva)}% incluse` : 'TVA non facturée');

function AnimatedNumber({ value, formatter = (amount) => amount, duration = 900 }) {
  const target = Number(value || 0);
  const [displayValue, setDisplayValue] = useState(target);

  useEffect(() => {
    let frame;
    const startTime = performance.now();
    const startValue = 0;
    const animate = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + (target - startValue) * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    setDisplayValue(startValue);
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return formatter(displayValue);
}

const getInitials = (value = '') => {
  const base = String(value || '').includes('@') ? String(value).split('@')[0] : String(value || '');
  const parts = base.replace(/[._-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
};

const searchPlaceholders = {
  dashboard: 'Rechercher une activite du tableau de bord...',
  clients: 'Rechercher un client, telephone ou statut...',
  produits: 'Rechercher un produit, reference ou categorie...',
  categories: 'Rechercher une categorie...',
  fournisseurs: 'Rechercher un fournisseur...',
  ventes: 'Rechercher une facture, client ou montant...',
  paiements: 'Rechercher un paiement, facture ou mode...',
  utilisateurs: 'Rechercher un utilisateur, email ou role...',
  rapports: 'Rechercher dans les rapports...',
  mails: 'Rechercher un email ou destinataire...',
  commandes: 'Rechercher une commande ou un client...',
  reclamations: 'Rechercher une reclamation...',
  achats: 'Rechercher une facture...',
  chat: 'Rechercher un client ou une conversation...',
  commentaires: 'Rechercher un visiteur, sujet ou message...',
  audit: 'Rechercher une action, utilisateur, module...',
  parametres: 'Rechercher dans les parametres...',
};

const fallbackProductPhotos = [
  'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1590479773265-7464e5d48118?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=700&q=80'
];

const fallbackCategoryPhotos = [
  'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=700&q=80'
];

const fallbackPhoto = (items, key, index = 0) => {
  const text = String(key || '').toLowerCase();
  const score = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), index);
  return items[Math.abs(score) % items.length];
};

const productPhotoUrl = (product, index = 0) => product?.photo_url || fallbackPhoto(fallbackProductPhotos, `${product?.nom || ''} ${product?.categorie_nom || ''}`, index);
const categoryPhotoUrl = (category, index = 0) => category?.photo_url || fallbackPhoto(fallbackCategoryPhotos, category?.nom, index);

const imageForIndex = (index) => [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=500&q=80'
][index % 5];

const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    clients: 'Clients',
    produits: 'Produits',
    categories: 'Categories',
    fournisseurs: 'Fournisseurs',
    ventes: 'Ventes',
    paiements: 'Paiements',
    utilisateurs: 'Utilisateurs',
    rapports: 'Rapports',
    mails: 'Emails',
    logout: 'Deconnexion',
    search: 'Rechercher',
    login: 'Connexion',
    forgot: 'Email oublie ?',
    noNotification: 'Aucune notification',
    print: 'Imprimer'
  },
  en: {
    dashboard: 'Dashboard',
    clients: 'Clients',
    produits: 'Products',
    categories: 'Categories',
    fournisseurs: 'Suppliers',
    ventes: 'Sales',
    paiements: 'Payments',
    utilisateurs: 'Users',
    rapports: 'Reports',
    mails: 'Emails',
    logout: 'Logout',
    search: 'Search',
    login: 'Login',
    forgot: 'Forgot email?',
    noNotification: 'No notifications',
    print: 'Print'
  }
};

const tr = (lang, key) => translations[lang]?.[key] || translations.fr[key] || key;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-crash">
          <section>
            <h1>Interface indisponible</h1>
            <p>{this.state.error.message || 'Une erreur est survenue pendant le chargement.'}</p>
            <button className="btn" type="button" onClick={() => window.location.reload()}>Recharger</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const statusClass = (value) => {
  const text = String(value || '');
  if (text.includes('OK') || text.includes('actif') || text.includes('Paye') || text.includes('converti') || text.includes('fidele') || text.includes('regulier') || text.includes('VIP')) return 'ok';
  if (text.includes('ALERTE') || text.includes('attente') || text.includes('Partiel') || text.includes('Prospect') || text.includes('Nouveau')) return 'warn';
  if (text.includes('RUPTURE') || text.includes('annule') || text.includes('Impaye') || text.includes('suspendu') || text.includes('Retard') || text.includes('Expire')) return 'danger';
  return '';
};

function Badge({ children }) {
  return <span className={`badge ${statusClass(children)}`}>{children || '-'}</span>;
}

const iconMap = {
  dashboard: Grid2X2,
  clients: Users,
  produits: Box,
  categories: Tags,
  fournisseurs: Briefcase,
  ventes: ShoppingCart,
  paiements: CreditCard,
  rapports: BarChart3,
  utilisateurs: UserCog,
  audit: ShieldCheck,
  mails: Mail,
  commandes: ShoppingCart,
  reclamations: HelpCircle,
  achats: FileText,
  chat: MessageCircle,
  commentaires: MessageCircle,
  parametres: Settings,
};

const clientSegment = (client) => {
  if (client?.segment_statut) return client.segment_statut;
  const purchases = Number(client?.nombre_achats || 0);
  const revenue = Number(client?.ca_total || 0);
  if (purchases >= 10 || revenue >= 5000) return 'vip';
  if (purchases >= 5 || revenue >= 1000) return 'fidele';
  if (purchases >= 2) return 'regulier';
  if (purchases === 1) return 'nouveau';
  return 'prospect';
};

const clientSegmentLabel = (segment) => ({ prospect: 'Prospect', nouveau: 'Nouveau client', regulier: 'Client regulier', fidele: 'Client fidele', vip: 'VIP' }[segment] || segment);

function IconButton({ title, children, className = '' }) {
  return <button className={`icon-button ${className}`} title={title} type="button">{children}</button>;
}

function Table({ headers, rows, pageSize = 10 }) {
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  if (!rows.length) return <div className="empty">Aucune donnee</div>;
  const firstRow = (currentPage - 1) * rowsPerPage;
  const visibleRows = rows.slice(firstRow, firstRow + rowsPerPage);

  return (
    <div className="table-shell">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={firstRow + index}>
                {row.map((cell, i) => <td key={i} data-label={headers[i]}>{cell ?? '-'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 10 && (
        <div className="table-pagination" aria-label="Pagination du tableau">
          <label>
            Afficher
            <select value={rowsPerPage} onChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}>
              {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <span>{firstRow + 1}-{Math.min(firstRow + rowsPerPage, rows.length)} sur {rows.length}</span>
          <div>
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
              <ChevronLeft size={16} /> Precedent
            </button>
            <strong>Page {currentPage} / {totalPages}</strong>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
              Suivant <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <label className="search-field">
      <Search size={18} />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function RowActions({ onEdit, onPrint, onDelete, onToggle, toggleLabel }) {
  return (
    <div className="actions">
      {onEdit && <button className="action edit" type="button" title="Modifier" onClick={onEdit}><Edit3 size={18} /></button>}
      {onPrint && <button className="action print-action" type="button" title="Imprimer" onClick={onPrint}><Printer size={18} /></button>}
      {onToggle && <button className="action toggle" type="button" title={toggleLabel || 'Changer statut'} onClick={onToggle}><CheckCircle2 size={18} /></button>}
      {onDelete && <button className="action delete" type="button" title="Supprimer" onClick={onDelete}><Trash2 size={18} /></button>}
    </div>
  );
}

function QcLoader({ label = 'Chargement' }) {
  return (
    <div className="qc-loader-panel" role="status" aria-live="polite">
      <div className="qc-loader-orbit">
        <img src={LOGO_URL} alt="" />
        <span />
      </div>
      <strong>{label}</strong>
    </div>
  );
}

function escapePrint(value) {
  return String(value ?? '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getPrintIdentity() {
  try {
    const user = JSON.parse(localStorage.getItem('crm_user') || 'null');
    const userLabel = user?.nom || user?.email || 'utilisateur';
    return {
      company: user?.entreprise_nom || user?.raison_sociale || APP_NAME,
      logo: user?.entreprise_logo || LOGO_URL,
      userLabel,
      contact: user?.email || ''
    };
  } catch {
    return { company: APP_NAME, logo: LOGO_URL, userLabel: 'utilisateur', contact: '' };
  }
}

function printLayout({ title, badge, sections = [], table, note, paper = 'ticket', generatedLine, showSignatures = false }) {
  const isTicket = paper === 'ticket';
  const win = window.open('', '_blank', isTicket ? 'width=430,height=700' : 'width=1000,height=760');
  if (!win) return;
  const identity = getPrintIdentity();
  const date = new Date().toLocaleDateString('fr-FR');
  const line = generatedLine || `Document genere par ${identity.userLabel}`;
  const sectionHtml = sections.map((section) => `
    <section class="info-card">
      <h2>${escapePrint(section.title)}</h2>
      ${section.rows.map(([label, value]) => `
        <div class="info-row">
          <strong>${escapePrint(label)}</strong>
          <span>${escapePrint(value)}</span>
        </div>
      `).join('')}
    </section>
  `).join('');
  const tableHtml = table ? `
    <section class="details">
      <h2>${escapePrint(table.title || 'Details')}</h2>
      <table>
        <thead><tr>${table.headers.map((header) => `<th>${escapePrint(header)}</th>`).join('')}</tr></thead>
        <tbody>${table.rows.map((row) => `<tr>${row.map((cell, index) => `<td data-label="${escapePrint(table.headers[index] || '')}">${escapePrint(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      ${note ? `<p class="note">${escapePrint(note)}</p>` : ''}
    </section>
  ` : '';
  win.document.write(`
    <html>
      <head>
        <title>${escapePrint(title)}</title>
        <style>
          *{box-sizing:border-box}
          body{background:#ffffff;color:#050b2f;font-family:Arial,sans-serif;margin:0;padding:18px}
          .page{margin:0 auto;max-width:920px}
          .print-head{align-items:flex-start;border-bottom:3px solid #002761;display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:14px}
          .brand{align-items:center;display:flex;gap:12px}
          .print-logo{align-items:center;border:1px solid #d9e0ec;border-radius:8px;display:grid;height:58px;justify-items:center;overflow:hidden;width:58px}
          .print-logo img{display:block;height:100%;object-fit:contain;width:100%}
          h1{color:#002761;font-size:25px;margin:0;text-transform:uppercase}
          .company{font-size:13px;line-height:1.7;margin-top:8px}
          .doc-title{font-size:20px;font-weight:900;text-align:right;text-transform:uppercase}
          .badge{background:#fff0cc;border-radius:999px;color:#002761;display:inline-block;font-size:13px;font-weight:800;margin-top:10px;padding:8px 14px}
          .info-grid{display:grid;gap:10px;grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:20px}
          .info-card,.details{border:1px solid #c9d2df;border-radius:8px;padding:14px}
          h2{color:#002761;font-size:15px;margin:0 0 12px;text-transform:uppercase}
          .info-row{display:grid;grid-template-columns:140px 1fr;gap:10px;font-size:13px;line-height:1.7}
          .info-row strong{color:#002761}
          table{border-collapse:collapse;width:100%}
          th,td{border:1px solid #c9d2df;font-size:14px;padding:9px;text-align:left;vertical-align:top}
          th{background:#002761;color:#ffffff}
          .note{font-size:12px;margin:14px 0 2px}
          .signatures{display:grid;gap:38px;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:26px}
          .signature{border-top:1px solid #111827;padding-top:10px}
          .signature strong{display:block;font-size:13px;margin-bottom:10px}
          .signature span{display:block;font-size:13px;line-height:1.8}
          footer{border-top:1px solid #c9d2df;color:#475569;font-size:12px;margin-top:42px;padding-top:10px;text-align:center}
          @media print{
            ${isTicket ? `
              @page{size:80mm auto;margin:4mm}
              body{padding:0;width:72mm}
              .page{max-width:72mm;width:72mm}
              .print-head{display:block;margin-bottom:10px;padding-bottom:8px}
              .brand{gap:6px}
              .print-logo{border-radius:5px;height:32px;width:32px}
              h1{font-size:17px;line-height:1.2;word-break:break-word}
              .company{font-size:10px;line-height:1.4;margin-top:6px}
              .doc-title{font-size:14px;margin-top:8px;text-align:left}
              .badge{background:#fff0cc!important;font-size:10px;margin-top:6px;padding:5px 8px}
              .info-grid{display:block;margin-bottom:8px}
              .info-card,.details{break-inside:avoid;border-radius:5px;margin-bottom:8px;padding:8px}
              h2{font-size:11px;margin-bottom:7px}
              .info-row{display:grid;font-size:10px;gap:3px;grid-template-columns:25mm 1fr;line-height:1.35}
              table,thead,tbody,tr,td{display:block;width:100%}
              thead{display:none}
              tr{border:1px solid #c9d2df;border-radius:4px;margin-bottom:6px;padding:4px}
              td{border:0;display:grid;font-size:10px;grid-template-columns:25mm 1fr;line-height:1.25;padding:3px 0;word-break:break-word}
              td::before{color:#002761;content:attr(data-label);font-weight:800;padding-right:4px}
              .note{font-size:9px;line-height:1.35;margin-top:8px}
              .signatures{display:block;margin-top:14px}
              .signature{margin-top:20px;padding-top:7px}
              .signature strong,.signature span{font-size:10px;line-height:1.5}
              footer{font-size:9px;line-height:1.3;margin-top:18px;padding-top:8px}
            ` : `
              @page{size:A4 portrait;margin:12mm}
              body{padding:0}
              .page{max-width:none;width:100%}
              .info-card,.details{break-inside:avoid}
              table{page-break-inside:auto}
              tr{break-inside:avoid}
              th,td{font-size:12px;padding:7px}
            `}
          }
        </style>
      </head>
      <body class="${isTicket ? 'ticket-paper' : 'page-paper'}">
        <main class="page">
          <header class="print-head">
            <div>
              <div class="brand"><div class="print-logo"><img src="${escapePrint(identity.logo)}" alt=""></div><h1>${escapePrint(identity.company)}</h1></div>
              <div class="company">${escapePrint(line)}<br>${escapePrint(identity.contact || APP_NAME)}</div>
            </div>
            <div>
              <div class="doc-title">${escapePrint(title)}</div>
              <span class="badge">${escapePrint(badge || date)}</span>
            </div>
          </header>
          <div class="info-grid">${sectionHtml}</div>
          ${tableHtml}
          ${showSignatures ? `
            <div class="signatures">
              <div class="signature"><strong>Pour ${escapePrint(identity.company)}</strong><span>Nom : ........................................</span><span>Date : .... / .... / 2026</span></div>
              <div class="signature"><strong>Pour le demandeur</strong><span>Nom : ........................................</span><span>Date : .... / .... / 2026</span></div>
            </div>
          ` : ''}
        </main>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  window.setTimeout(() => win.print(), 250);
}

function printDocument(title, rows, options = {}) {
  const badgeRow = rows.find(([label]) => ['Facture', 'Numero', 'Entreprise'].includes(label));
  const identity = getPrintIdentity();
  const lowerTitle = title.toLowerCase();
  const generatedLine = options.generatedLine
    || (lowerTitle.includes('facture') ? `Facture generee par ${identity.userLabel}`
      : `Document genere par ${identity.userLabel}`);
  printLayout({
    title,
    badge: badgeRow?.[1],
    sections: [
      { title: 'Informations', rows },
      { title: 'Controle', rows: [['Date', new Date().toLocaleDateString('fr-FR')], ['Document', title], ['Statut', 'Valide']] }
    ],
    table: { title: 'Details', headers: ['Element', 'Valeur'], rows },
    note: options.note || '',
    paper: options.paper || 'ticket',
    generatedLine,
    showSignatures: Boolean(options.showSignatures)
  });
}

function printTableDocument(title, headers, rows, options = {}) {
  printLayout({
    title,
    badge: options.badge,
    sections: [
      { title: 'Resume', rows: [['Periode', options.period || 'Actuelle'], ['Lignes', rows.length], ['Date', new Date().toLocaleDateString('fr-FR')]] },
      { title: 'Source', rows: [['Application', APP_NAME], ['Etat', title], ['Devise', 'USD']] }
    ],
    table: { title: options.tableTitle || 'Details commerciaux', headers, rows },
    note: options.note || '',
    paper: options.paper || 'page',
    generatedLine: options.generatedLine,
    showSignatures: Boolean(options.showSignatures)
  });
}

const publicPages = ['/', '/about', '/services', '/contact', '/inscription'];

function PublicHeader({ route, goTo }) {
  const [open, setOpen] = useState(false);
  const links = [['/', 'Accueil'], ['/about', 'A propos'], ['/services', 'Services'], ['/contact', 'Contact']];
  const move = (path) => { setOpen(false); goTo(path); };
  return (
    <header className="public-header">
      <button className="public-brand" type="button" onClick={() => move('/')}>
        <img src={LOGO_URL} alt="" /><span><strong>Quincaillerie Centrale</strong><small>Materiaux & construction</small></span>
      </button>
      <button className="public-menu-toggle" type="button" onClick={() => setOpen(!open)} aria-label="Ouvrir le menu"><Menu size={25} /></button>
      <nav className={open ? 'open' : ''}>
        {links.map(([path, label]) => <button key={path} className={route === path ? 'active' : ''} type="button" onClick={() => move(path)}>{label}</button>)}
        <button className="public-signin" type="button" onClick={() => move('/connexion')}>Se connecter</button>
        <button className="public-login" type="button" onClick={() => move('/inscription')}><UserCog size={17} /> Creer un compte</button>
      </nav>
    </header>
  );
}

function PublicFooter({ goTo }) {
  return (
    <footer className="public-footer">
      <div className="public-footer-grid">
        <div><div className="footer-brand"><img src={LOGO_URL} alt="" /><strong>Quincaillerie Centrale</strong></div><p>Des materiaux fiables pour construire Goma, depuis 1992.</p></div>
        <div><strong>Navigation</strong><button onClick={() => goTo('/about')}>Notre histoire</button><button onClick={() => goTo('/services')}>Nos services</button><button onClick={() => goTo('/contact')}>Nous contacter</button></div>
        <div><strong>Nous trouver</strong><p>Quartier Murara<br />Avenue du Commerce<br />Karisimbi, Goma</p></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Quincaillerie Centrale</span><span>Qualite • Proximite • Confiance</span></div>
    </footer>
  );
}

function PublicHome({ goTo }) {
  const previewScreens = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Grid2X2 },
    { id: 'achats', label: 'Mes achats', icon: FileText },
    { id: 'commandes', label: 'Commandes', icon: ShoppingCart },
    { id: 'assistance', label: 'Assistance', icon: MessageCircle }
  ];
  const [previewIndex, setPreviewIndex] = useState(0);
  const activePreview = previewScreens[previewIndex];
  useEffect(() => {
    const timer = window.setInterval(() => setPreviewIndex((index) => (index + 1) % previewScreens.length), 3600);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <>
      <section className="public-hero">
        <div className="hero-copy"><span className="eyebrow">Au service de Goma depuis 1992</span><h1>Construire solide.<br /><em>Construire ensemble.</em></h1><p>Materiaux de construction et articles de quincaillerie de qualite, accessibles aux professionnels comme aux particuliers.</p><div className="hero-actions"><button className="public-primary" onClick={() => goTo('/services')}>Decouvrir nos services <ArrowRight size={19} /></button><button className="public-secondary" onClick={() => goTo('/contact')}>Nous contacter</button></div><div className="hero-proof"><div><strong>3 decennies</strong><span>d'experience locale</span></div><div><strong>Goma</strong><span>au coeur de notre action</span></div><div><strong>Qualite</strong><span>a prix competitifs</span></div></div></div>
        <div className="hero-visual"><img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=88" alt="Chantier de construction et ouvriers du batiment" /><div className="hero-float"><ShieldCheck size={28} /><span><strong>Votre chantier, notre engagement</strong><small>Conseil, disponibilite et suivi</small></span></div></div>
      </section>
      <section className="public-intro"><div><span className="section-kicker">Notre raison d'etre</span><h2>La confiance se construit avec de bons materiaux.</h2></div><p>La Quincaillerie Centrale accompagne la croissance de Goma en proposant des produits de construction de qualite superieure à des prix competitifs. Notre expertise locale nous permet de comprendre vos besoins et de vous orienter vers les bonnes solutions.</p></section>
      <section className="public-service-preview">
        <article><span>01</span><Hammer size={30} /><h3>Materiaux de construction</h3><p>Des produits essentiels selectionnes pour la solidite et la durabilite de vos ouvrages.</p></article>
        <article><span>02</span><Package size={30} /><h3>Articles de quincaillerie</h3><p>Un catalogue adapte aux artisans, entreprises et projets domestiques.</p></article>
        <article><span>03</span><Users size={30} /><h3>Conseil de proximite</h3><p>Une equipe qui vous aide à choisir selon votre chantier, votre budget et vos priorites.</p></article>
      </section>
      <section className="public-process"><div><span className="section-kicker">Une experience plus simple</span><h2>Du besoin au chantier, sans perdre le fil.</h2><p>Notre plateforme prolonge le service du magasin : vous preparez votre commande, notre equipe la verifie, puis vous suivez sa confirmation et votre facture depuis votre espace personnel.</p></div><ol><li><b>1</b><span><strong>Choisissez</strong><small>Consultez uniquement les produits disponibles au bon prix de vente.</small></span></li><li><b>2</b><span><strong>Commandez</strong><small>Le montant est calcule automatiquement avec le prix du catalogue.</small></span></li><li><b>3</b><span><strong>Suivez</strong><small>Retrouvez le statut, la facture, le paiement et l'assistance au meme endroit.</small></span></li></ol></section>
      <section className="public-app-preview">
        <div>
          <span className="section-kicker">Apercu de l'espace client</span>
          <h2>Un suivi clair pour chaque client.</h2>
          <p>Le client retrouve ses commandes, ses achats, ses reclamations et son assistance depuis une interface unique, simple et professionnelle.</p>
          <button className="public-primary" onClick={() => goTo('/inscription')}>Creer mon espace <ArrowRight size={18} /></button>
        </div>
        <figure className="interactive-client-preview">
          <div className="client-preview-tabs">
            {previewScreens.map((screen, index) => {
              const Icon = screen.icon;
              return <button key={screen.id} className={activePreview.id === screen.id ? 'active' : ''} type="button" onClick={() => setPreviewIndex(index)}><Icon size={15} /> {screen.label}</button>;
            })}
          </div>
          <div className={`client-preview-screen screen-${activePreview.id}`} key={activePreview.id}>
            {activePreview.id === 'dashboard' && <img src="/assets/client-dashboard-preview.png" alt="Apercu du tableau de bord client Quincaillerie Centrale" />}
            {activePreview.id === 'achats' && <div className="client-preview-panel">
              <header><span>MES ACHATS</span><strong>Factures et paiements</strong></header>
              <div className="preview-table">
                <div><b>FAC-2026-0028</b><span>338.72 USD</span><em>Payee</em></div>
                <div><b>FAC-2026-0026</b><span>440.80 USD</span><em>Payee</em></div>
                <div><b>FAC-2026-0023</b><span>1 117.08 USD</span><em>Partiel</em></div>
              </div>
            </div>}
            {activePreview.id === 'commandes' && <div className="client-preview-panel">
              <header><span>COMMANDES</span><strong>Suivi en temps reel</strong></header>
              <div className="preview-steps"><i className="done" /><i className="done" /><i className="current" /><i /></div>
              <div className="preview-order-card"><b>CMD-000009</b><span>Commande confirmee</span><strong>Preparation magasin</strong></div>
            </div>}
            {activePreview.id === 'assistance' && <div className="client-preview-panel">
              <header><span>ASSISTANCE</span><strong>Chat client</strong></header>
              <div className="preview-chat-line bot">Bonjour Sage, comment puis-je vous aider ?</div>
              <div className="preview-chat-line user">Je veux connaitre le prix du ciment.</div>
              <div className="preview-chat-line bot">Le ciment disponible est affiche avec son prix de vente dans votre catalogue.</div>
            </div>}
          </div>
        </figure>
      </section>
      <section className="public-trust-band"><div><strong>1992</strong><span>Fondation à Goma</span><small>Une entreprise locale nee pour servir les besoins de construction de la ville.</small></div><div><strong>2002</strong><span>Engagement dans la reconstruction</span><small>Des materiaux rendus disponibles pour accompagner la reprise apres l'eruption.</small></div><div><strong>Prix clairs</strong><span>Catalogue professionnel</span><small>Des tarifs de vente transparents et une disponibilite verifiee avant commande.</small></div><div><strong>1 espace</strong><span>Commandes, factures et assistance</span><small>Le client retrouve tout son suivi commercial depuis un compte securise.</small></div></section>
      <section className="public-story-band"><div className="story-image"><img src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1800&q=88" alt="Travail des materiaux sur un chantier" /></div><div><span className="section-kicker light">Une histoire ancree à Goma</span><h2>De 1992 à aujourd'hui</h2><p>Fondee par Jean-Pierre Bishweka Bufole, l'entreprise s'est distinguee apres l'eruption volcanique de 2002 en fournissant les materiaux necessaires à la reconstruction de la ville.</p><button className="public-text-link" onClick={() => goTo('/about')}>Lire notre histoire <ArrowRight size={18} /></button></div></section>
      <section className="public-cta"><span>Un projet en preparation ?</span><h2>Parlons de vos besoins.</h2><p>Notre equipe est à votre ecoute sur l'Avenue du Commerce, au quartier Murara.</p><button className="public-primary" onClick={() => goTo('/contact')}>Contacter l'equipe <Send size={18} /></button></section>
    </>
  );
}

function PublicAbout({ goTo }) {
  return (
    <>
      <section className="public-page-hero about-hero"><span className="eyebrow">A propos</span><h1>Une entreprise locale,<br />une histoire de resilience.</h1><p>Depuis plus de trois decennies, la Quincaillerie Centrale participe au developpement de Goma et du Nord-Kivu.</p></section>
      <section className="about-story"><div><span className="section-kicker">Notre histoire</span><h2>1992, le debut d'une ambition</h2><p>La Quincaillerie Centrale a ete creee en 1992 à Goma par l'entrepreneur congolais Jean-Pierre Bishweka Bufole, dans une periode marquee par de profondes difficultes economiques et sociales.</p><p>L'eruption volcanique de 2002 a constitue un tournant. En mettant à disposition les materiaux indispensables à la reconstruction, l'entreprise s'est imposee comme un acteur du commerce general et de la relance de la ville.</p></div><div className="about-year"><strong>1992</strong><span>Fondation à Goma</span></div></section>
      <section className="mission-grid"><article><Target /><span>Notre mission</span><h3>Rendre la qualite accessible</h3><p>Fournir des produits et services de qualite superieure à des prix competitifs, accessibles à tous.</p></article><article><TrendingUp /><span>Notre ambition</span><h3>Grandir avec la region</h3><p>Rester une reference du commerce general à Goma et au Nord-Kivu, tout en contribuant au developpement economique local.</p></article><article><ShieldCheck /><span>Notre engagement</span><h3>Meriter votre confiance</h3><p>Allier disponibilite, transparence et accompagnement pour chaque client et chaque projet.</p></article></section>
      <section className="public-values"><div><span className="section-kicker">Nos valeurs</span><h2>Ce qui guide notre travail</h2></div><div className="values-list"><article><b>01</b><div><h3>Qualite</h3><p>Des produits choisis pour repondre aux exigences du terrain.</p></div></article><article><b>02</b><div><h3>Proximite</h3><p>Une connaissance concrete de Goma, de ses artisans et de ses chantiers.</p></div></article><article><b>03</b><div><h3>Accessibilite</h3><p>Des prix competitifs pour servir le plus grand nombre.</p></div></article><article><b>04</b><div><h3>Resilience</h3><p>Une entreprise qui avance avec sa ville, meme dans les periodes difficiles.</p></div></article></div></section>
      <section className="public-cta"><span>Decouvrez notre offre</span><h2>Tout pour faire avancer votre chantier.</h2><button className="public-primary" onClick={() => goTo('/services')}>Voir nos services <ArrowRight size={18} /></button></section>
    </>
  );
}

function PublicServices({ goTo }) {
  const services = [
    [Hammer, 'Materiaux de construction', 'Une offre pour les travaux de construction, de renovation et d’amenagement, adaptee aux besoins du marche local.'],
    [Package, 'Quincaillerie generale', 'Des outils, equipements et consommables destines aux professionnels, artisans et particuliers.'],
    [ShoppingCart, 'Commande en ligne', 'Depuis votre espace client, consultez les produits disponibles, envoyez une commande et suivez son traitement.'],
    [FileText, 'Factures et suivi des achats', 'Retrouvez vos achats, vos factures et votre situation de paiement dans un espace personnel securise.'],
    [HelpCircle, 'Reclamations et service client', 'Signalez un probleme depuis votre compte et suivez directement la reponse du manager.'],
    [Users, 'Conseil et accompagnement', 'Notre equipe vous oriente vers les produits adaptes à votre projet et à votre budget.']
  ];
  return (
    <><section className="public-page-hero services-hero"><span className="eyebrow">Nos services</span><h1>Plus que des produits,<br />un accompagnement.</h1><p>Une offre complete qui relie le magasin, le suivi commercial et votre espace client.</p></section><section className="services-grid">{services.map(([Icon, title, text], index) => <article key={title}><b>{String(index + 1).padStart(2, '0')}</b><Icon size={32} /><h2>{title}</h2><p>{text}</p></article>)}</section><section className="digital-service"><div><span className="section-kicker light">Votre espace client</span><h2>Vos commandes vous suivent partout.</h2><p>Commandez, consultez vos factures et echangez avec le manager depuis une interface simple et securisee.</p><button className="public-primary" onClick={() => goTo('/connexion')}>Acceder à mon espace <ArrowRight size={18} /></button></div><div className="digital-mock" aria-label="Apercu du tableau de bord client"><div className="preview-browser"><i /><i /><i /><span>espace.quincaillerie-centrale.cd</span></div><div className="preview-layout"><aside><div className="preview-logo"><img src={LOGO_URL} alt="" /><b>QC</b></div><span className="active"><Grid2X2 size={14} /></span><span><ShoppingCart size={14} /></span><span><FileText size={14} /></span><span><MessageCircle size={14} /></span></aside><main className="preview-dashboard"><header><div><small>ESPACE CLIENT</small><strong>Bonjour, Sage</strong></div><span>SL</span></header><div className="preview-kpis"><article><small>Commandes</small><strong>12</strong><em>+2 ce mois</em></article><article><small>Achats cumules</small><strong>1 896 USD</strong><em>Situation à jour</em></article><article><small>Reclamations</small><strong>0</strong><em>Tout est regle</em></article></div><section className="preview-activity"><div><small>Activite des commandes</small><strong>Suivi en temps reel</strong></div><div className="preview-bars"><i style={{ height: '36%' }} /><i style={{ height: '52%' }} /><i style={{ height: '43%' }} /><i style={{ height: '72%' }} /><i style={{ height: '61%' }} /><i style={{ height: '88%' }} /></div></section><section className="preview-orders"><header><strong>Dernieres commandes</strong><small>Voir tout</small></header><div><span>CMD-000012</span><b>En preparation</b><em>348 USD</em></div><div><span>CMD-000011</span><b className="confirmed">Confirmee</b><em>580 USD</em></div></section></main></div></div></section><section className="public-cta"><span>Besoin d'un renseignement ?</span><h2>Notre equipe vous repond.</h2><button className="public-primary" onClick={() => goTo('/contact')}>Nous contacter <Send size={18} /></button></section></>
  );
}

function PublicContact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [status, setStatus] = useState({ loading: false, message: '', ok: false });
  const submit = async (event) => {
    event.preventDefault(); setStatus({ loading: true, message: '', ok: false });
    try {
      const response = await fetch(`${API_URL}/public/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Envoi impossible.');
      setForm({ nom: '', email: '', sujet: '', message: '' }); setStatus({ loading: false, message: body.message, ok: true });
    } catch (error) { setStatus({ loading: false, message: error.message, ok: false }); }
  };
  return (
    <><section className="public-page-hero contact-hero"><span className="eyebrow">Contact</span><h1>Parlons de votre projet.</h1><p>Une question sur nos produits, une commande ou votre espace client ? Ecrivez-nous.</p></section><section className="contact-layout"><aside><span className="section-kicker">Nous trouver</span><h2>Au coeur de Goma</h2><div className="contact-card"><MapPin size={27} /><div><strong>Adresse</strong><p>Avenue du Commerce<br />Quartier Murara, Commune de Karisimbi<br />Goma, Nord-Kivu</p></div></div><div className="contact-note"><ShieldCheck size={23} /><p>Les messages envoyes ici arrivent directement dans l’espace du manager.</p></div></aside><div className="contact-form-card"><h2>Envoyer un message</h2><p>Remplissez le formulaire et notre equipe prendra connaissance de votre demande.</p><form onSubmit={submit}><div className="form-row"><Input label="Nom complet" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required /><Input label="Adresse email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required /></div><Input label="Sujet" value={form.sujet} onChange={(sujet) => setForm({ ...form, sujet })} required /><label>Votre message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /></label>{status.message && <p className={status.ok ? 'contact-success' : 'contact-error'}>{status.message}</p>}<button className="public-primary" disabled={status.loading}>{status.loading ? 'Envoi...' : 'Envoyer le message'} <Send size={18} /></button></form></div></section></>
  );
}

function PublicRegistration({ goTo, onComplete }) {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ nom: '', postnom: '', telephone: '', email: '', password: '', confirm: '', accepted: false });
  const [code, setCode] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', ok: false });
  const requestRegistration = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirm) return setStatus({ loading: false, message: 'Les deux mots de passe ne correspondent pas.', ok: false });
    if (!form.accepted) return setStatus({ loading: false, message: 'Veuillez accepter les conditions de creation du compte.', ok: false });
    setStatus({ loading: true, message: '', ok: false });
    try {
      const response = await fetch(`${API_URL}/client-auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Inscription impossible.');
      setStep('verify'); setStatus({ loading: false, message: body.message, ok: true });
    } catch (error) { setStatus({ loading: false, message: error.message, ok: false }); }
  };
  const verify = async (event) => {
    event.preventDefault(); setStatus({ loading: true, message: '', ok: false });
    try {
      const response = await fetch(`${API_URL}/client-auth/verify-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, code }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Verification impossible.');
      onComplete(body);
    } catch (error) { setStatus({ loading: false, message: error.message, ok: false }); }
  };
  const resend = async () => {
    setStatus({ loading: true, message: '', ok: false });
    try {
      const response = await fetch(`${API_URL}/client-auth/resend-code`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Renvoi impossible.');
      setStatus({ loading: false, message: body.message, ok: true });
    } catch (error) { setStatus({ loading: false, message: error.message, ok: false }); }
  };
  return (
    <section className="registration-page">
      <div className="registration-aside"><span className="eyebrow">ESPACE CLIENT</span><h1>Votre quincaillerie,<br />à portee de main.</h1><p>Un compte personnel pour commander, suivre vos achats, consulter vos factures et contacter directement notre equipe.</p><div className="registration-benefits"><div><ShieldCheck /><span><strong>Compte securise</strong><small>Votre adresse email est verifiee</small></span></div><div><ShoppingCart /><span><strong>Commandes simplifiees</strong><small>Suivez chaque etape en ligne</small></span></div><div><HelpCircle /><span><strong>Assistance directe</strong><small>Vos reclamations arrivent au manager</small></span></div></div></div>
      <div className="registration-card">
        {step === 'form' ? <><span className="registration-step">ETAPE 1 SUR 2</span><h2>Creer mon compte</h2><p>Renseignez vos informations personnelles. Un code sera envoye à votre adresse email.</p><form onSubmit={requestRegistration}><div className="form-row"><Input label="Nom" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required /><Input label="Postnom" value={form.postnom} onChange={(postnom) => setForm({ ...form, postnom })} /></div><Input label="Numero de telephone" value={form.telephone} onChange={(telephone) => setForm({ ...form, telephone })} placeholder="Ex. +243..." required /><Input label="Adresse email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} placeholder="votrenom@gmail.com" required /><div className="form-row"><Input label="Mot de passe" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} required /><Input label="Confirmer" type="password" value={form.confirm} onChange={(confirm) => setForm({ ...form, confirm })} required /></div><small className="password-hint">8 caracteres minimum, avec majuscule, minuscule et chiffre.</small><label className="terms-check"><input type="checkbox" checked={form.accepted} onChange={(event) => setForm({ ...form, accepted: event.target.checked })} /><span>J'accepte la creation de mon espace client et le traitement de mes informations pour la gestion de mes commandes.</span></label>{status.message && <p className={status.ok ? 'contact-success' : 'contact-error'}>{status.message}</p>}<button className="public-primary registration-submit" disabled={status.loading}>{status.loading ? 'Envoi du code...' : 'Continuer et verifier mon email'} <ArrowRight size={18} /></button></form></> : <><span className="registration-step">ETAPE 2 SUR 2</span><div className="verify-icon"><Mail size={30} /></div><h2>Consultez votre messagerie</h2><p>Nous avons envoye un code professionnel à 6 chiffres à <strong>{form.email}</strong>. Il reste valable pendant 15 minutes.</p><form onSubmit={verify}><label className="verification-label">Code de confirmation<input className="verification-code" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" required /></label>{status.message && <p className={status.ok ? 'contact-success' : 'contact-error'}>{status.message}</p>}<button className="public-primary registration-submit" disabled={status.loading || code.length !== 6}>{status.loading ? 'Verification...' : 'Confirmer mon adresse'} <ShieldCheck size={18} /></button><div className="verify-actions"><button type="button" onClick={resend} disabled={status.loading}>Renvoyer le code</button><button type="button" onClick={() => { setStep('form'); setCode(''); }}>Modifier l'adresse</button></div></form></>}
        <p className="registration-login">Vous avez deja un compte ? <button type="button" onClick={() => goTo('/connexion')}>Se connecter</button></p>
      </div>
    </section>
  );
}

function PublicWebsite({ route, goTo, onRegistrationComplete }) {
  useEffect(() => {
    const elements = document.querySelectorAll('.public-site main > section, .public-site main section > article, .public-site .public-footer-grid > div');
    elements.forEach((element, index) => {
      element.classList.remove('is-visible');
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 90}ms`);
      element.style.setProperty('--reveal-x', `${index % 3 === 1 ? 18 : index % 3 === 2 ? -18 : 0}px`);
    });
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -45px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [route]);
  return <div className="public-site"><PublicHeader route={route} goTo={goTo} /><main key={route} className="public-main public-route-enter">{route === '/about' ? <PublicAbout goTo={goTo} /> : route === '/services' ? <PublicServices goTo={goTo} /> : route === '/contact' ? <PublicContact /> : route === '/inscription' ? <PublicRegistration goTo={goTo} onComplete={onRegistrationComplete} /> : <PublicHome goTo={goTo} />}</main><PublicFooter goTo={goTo} /></div>;
}

function App() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('crm_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('crm_user') || 'null'));
  const [authType, setAuthType] = useState(localStorage.getItem('crm_auth_type') || 'user');
  const [page, setPage] = useState('dashboard');
  const [toast, setToast] = useState('');
  const [lang, setLang] = useState(localStorage.getItem('crm_lang') || 'fr');
  const [theme, setTheme] = useState(localStorage.getItem('crm_theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [platformSearch, setPlatformSearch] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openNavGroup, setOpenNavGroup] = useState('');
  const [route, setRoute] = useState(window.location.pathname || '/');

  const goTo = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (route === '/paiement/stripe/succes') {
      setPage('achats');
      notify('Paiement confirme. La facture sera mise a jour automatiquement.');
      goTo('/app');
    } else if (route === '/paiement/stripe/annule') {
      setPage('achats');
      notify('Paiement annule.');
      goTo('/app');
    }
  }, [route, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3400);
  };

  const api = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || 'Operation impossible');
    return body;
  };

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('crm_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('crm_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`${API_URL}/${authType === 'client' ? 'client-auth' : 'auth'}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json().then((body) => ({ response, body })))
      .then(({ response, body }) => {
        if (!response.ok || !body.user || cancelled) return;
        const refreshedUser = { ...body.user, id: body.user.id || body.user.id_utilisateur || body.user.id_client };
        setUser(refreshedUser);
        localStorage.setItem('crm_user', JSON.stringify(refreshedUser));
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [token, authType]);

  useEffect(() => {
    if (!token) return;
    api('/notifications')
      .then((result) => setNotifications(result.data || []))
      .catch(() => setNotifications([]));
  }, [token, page]);

  const login = async (payload) => {
    const credentials = {
      email: String(payload.email || '').trim().toLowerCase(),
      password: String(payload.password || '').trim()
    };
    const requestLogin = async (path) => {
      const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Identifiants incorrects');
      return body;
    };

    const result = await requestLogin('/auth/login');
    const connectedUser = result.user || result.admin;
    const detectedAuthType = connectedUser?.type === 'client' || connectedUser?.role === 'client' ? 'client' : 'user';
    setToken(result.token);
    setUser(connectedUser);
    setAuthType(detectedAuthType);
    setPage('dashboard');
    localStorage.setItem('crm_token', result.token);
    localStorage.setItem('crm_user', JSON.stringify(connectedUser));
    localStorage.setItem('crm_auth_type', detectedAuthType);
    goTo('/app');
    notify('Connexion reussie');
  };

  const completeClientRegistration = (result) => {
    setToken(result.token);
    setUser(result.user);
    setAuthType('client');
    setPage('dashboard');
    localStorage.setItem('crm_token', result.token);
    localStorage.setItem('crm_user', JSON.stringify(result.user));
    localStorage.setItem('crm_auth_type', 'client');
    notify('Bienvenue dans votre espace client.');
    goTo('/app');
  };

  const logout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    localStorage.removeItem('crm_auth_type');
    setToken('');
    setUser(null);
    setAuthType('user');
    setPage('dashboard');
    goTo('/connexion');
  };

  const updateCompanyIdentity = (entreprise) => {
    setUser((current) => {
      const updated = {
        ...current,
        entreprise_nom: entreprise.raison_sociale,
        entreprise_logo: entreprise.logo_url || ''
      };
      localStorage.setItem('crm_user', JSON.stringify(updated));
      return updated;
    });
  };

  const navItems = useMemo(() => {
    const role = user?.role;
    return [
      { id: 'dashboard', label: tr(lang, 'dashboard'), roles: ['manager', 'vendeur', 'magasinier'] },
      { id: 'dashboard', label: 'Mon espace', roles: ['client'] },
      { id: 'clients', label: tr(lang, 'clients'), roles: ['manager', 'vendeur'] },
      { id: 'fournisseurs', label: tr(lang, 'fournisseurs'), roles: ['manager', 'magasinier'] },
      { id: 'categories', label: tr(lang, 'categories'), roles: ['manager', 'magasinier'] },
      { id: 'produits', label: 'Produits', roles: ['manager', 'vendeur', 'magasinier'] },
      { id: 'ventes', label: 'Ventes', roles: ['manager', 'vendeur'] },
      { id: 'paiements', label: tr(lang, 'paiements'), roles: ['manager', 'vendeur'] },
      { id: 'commandes', label: 'Commandes', roles: ['manager', 'vendeur', 'client'] },
      { id: 'achats', label: 'Mes achats', roles: ['client'] },
      { id: 'reclamations', label: 'Reclamations', roles: ['manager', 'client'] },
      { id: 'rapports', label: tr(lang, 'rapports'), roles: ['manager', 'vendeur', 'magasinier'] },
      { id: 'chat', label: role === 'client' ? 'Assistance' : 'Chat', roles: ['manager', 'client'] },
      { id: 'mails', label: tr(lang, 'mails'), roles: ['manager'] },
      { id: 'commentaires', label: 'Commentaires', roles: ['manager'] },
      { id: 'utilisateurs', label: tr(lang, 'utilisateurs'), roles: ['manager'] },
      { id: 'audit', label: 'Audit', roles: ['manager'] },
      { id: 'parametres', label: 'Parametres', roles: ['manager'] }
    ].filter((item) => item.roles.includes(role));
  }, [authType, user, lang]);

  useEffect(() => {
    if (token && navItems.length && !navItems.some((item) => item.id === page)) {
      setPage(navItems[0].id);
    }
  }, [token, navItems, page]);

  useEffect(() => {
    setPlatformSearch('');
    setMobileMenuOpen(false);
  }, [page]);

  const openNotificationTarget = async (notification) => {
    setShowNotifications(false);
    if (notification?.id_notification) {
      api(`/notifications/${notification.id_notification}/read`, { method: 'PUT', body: '{}' })
        .then(() => setNotifications((items) => items.filter((item) => item.id_notification !== notification.id_notification)))
        .catch(() => null);
    }
    const targetPage = notification?.entity_type === 'commande' ? 'commandes'
      : notification?.entity_type === 'reclamation' ? 'reclamations'
        : notification?.entity_type === 'chat' ? 'chat'
          : notification?.entity_type === 'commentaire' ? 'commentaires' : '';
    if (targetPage) {
      setPage(targetPage);
      window.setTimeout(() => setPlatformSearch(notification.entity_id || ''), 0);
      return;
    }
    setSelectedNotification(notification);
  };

  if (booting) {
    return <main className="app-boot"><QcLoader label="Ouverture de Quincaillerie Centrale" /></main>;
  }

  if (publicPages.includes(route)) {
    return <PublicWebsite route={route} goTo={goTo} onRegistrationComplete={completeClientRegistration} />;
  }

  if (!token) {
    return <Login authType={authType} setAuthType={setAuthType} onLogin={login} notify={notify} toast={toast} lang={lang} goTo={goTo} />;
  }

  const titles = {
    dashboard: [tr(lang, 'dashboard'), "Bienvenue, voici l'activite de votre entreprise aujourd'hui."],
    clients: ['Clients', 'Fiche client 360 et historique commercial.'],
    produits: ['Produits et stock', 'Catalogue, alertes et entrees de stock.'],
    ventes: ['Ventes', 'Factures, details et reste a payer.'],
    paiements: ['Paiements', 'Argent recu et rapport de caisse.'],
    utilisateurs: ['Utilisateurs', 'Comptes, roles et acces de votre equipe.'],
    audit: ['Journal d’audit', 'Suivi des actions sensibles effectuees dans le systeme.'],
    mails: ['Emails', 'Envoyer des notifications et messages clients.'],
    categories: ['Categories', 'Classification simple des produits et services.'],
    fournisseurs: ['Fournisseurs', 'Contacts et historique des approvisionnements.'],
    rapports: user?.role === 'magasinier'
      ? ['Rapports produits', 'Inventaire, stock et entrees de stock.']
      : user?.role === 'vendeur'
        ? ['Rapports caisse', 'Factures, dettes et paiements recus.']
        : ['Rapports', 'Factures, creances, stock et meilleurs clients.'],
    commandes: ['Commandes', user?.role === 'client' ? 'Passez et suivez vos commandes.' : 'Suivi et traitement des commandes clients.'],
    achats: ['Mes achats', 'Factures et paiements de votre compte.'],
    reclamations: ['Reclamations', user?.role === 'client' ? 'Ecrivez directement au manager.' : 'Demandes envoyees par les clients.'],
    chat: [user?.role === 'client' ? 'Assistance' : 'Chat clients', user?.role === 'client' ? 'Obtenez une reponse automatique ou echangez avec le manager.' : 'Repondez aux questions transferees par l’assistant.'],
    commentaires: ['Commentaires du site', 'Messages envoyes depuis la page Contact.'],
    parametres: ["Parametres de l'entreprise", 'Personnalisez le nom, le logo et les informations de votre entreprise.'],
  };
  const [title, subtitle] = titles[page] || [APP_NAME, ''];
  const sidebarTitle = user?.entreprise_nom || user?.raison_sociale || user?.entreprise_id || APP_NAME;
  const sidebarLogo = user?.entreprise_logo || LOGO_URL;
  const navById = Object.fromEntries(navItems.map((item) => [item.id, item]));
  const navGroups = user?.role === 'client' ? [] : [
    { id: 'magasin', label: 'Magasin', icon: Box, ids: ['fournisseurs', 'categories', 'produits'] },
    { id: 'commercial', label: 'Commercial', icon: Briefcase, ids: ['ventes', 'paiements', 'commandes', 'reclamations'] },
    { id: 'messages', label: 'Messages', icon: MessageCircle, ids: ['chat', 'mails', 'commentaires'] }
  ].map((group) => ({ ...group, items: group.ids.map((id) => navById[id]).filter(Boolean) })).filter((group) => group.items.length);
  const groupedIds = new Set(navGroups.flatMap((group) => group.ids));
  const standaloneNav = navItems.filter((item) => !groupedIds.has(item.id));
  const renderNavButton = (item) => <button key={item.id} className={`nav-item nav-item-${item.id}${page === item.id ? ' active' : ''}`} onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}>{React.createElement(iconMap[item.id] || Package, { size: 20, strokeWidth: 2.2 })}<span>{item.label}</span></button>;

  return (
    <div className={`shell page-${page} role-${user?.role || 'user'} ${mobileMenuOpen ? 'menu-open' : ''}`}>
      {mobileMenuOpen && <button className="sidebar-scrim" type="button" aria-label="Fermer le menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark logo-mark"><img src={sidebarLogo} alt="" /></div>
          <div>
            <strong title={sidebarTitle}>{sidebarTitle}</strong>
            <span>{APP_TAGLINE}</span>
          </div>
        </div>
        <nav className="nav">
          {standaloneNav.filter((item) => ['dashboard', 'clients', 'achats'].includes(item.id)).map(renderNavButton)}
          {navGroups.map((group) => <div className={`nav-group nav-group-${group.id} ${openNavGroup === group.id ? 'open' : ''}`} key={group.id}><button className="nav-group-toggle" type="button" aria-expanded={openNavGroup === group.id} onClick={() => setOpenNavGroup((current) => current === group.id ? '' : group.id)}>{React.createElement(group.icon, { size: 20, strokeWidth: 2.2 })}<span>{group.label}</span><ChevronDown className="nav-group-chevron" size={17} /></button><div className="nav-group-items">{group.items.map(renderNavButton)}</div></div>)}
          {standaloneNav.filter((item) => !['dashboard', 'clients', 'achats'].includes(item.id)).map(renderNavButton)}
          <button className="nav-logout" type="button" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut size={23} />
            {tr(lang, 'logout')}
          </button>
        </nav>
      </aside>
      <main className="main">
        <header className={`topbar ${page === 'dashboard' ? 'dashboard-topbar' : ''}`}>
          <button className="menu-button" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
            <Menu size={22} />
          </button>
          {page !== 'dashboard' && <SearchInput value={platformSearch} onChange={setPlatformSearch} placeholder={searchPlaceholders[page] || 'Rechercher...'} />}
          <div className="toolbar">
            <div className="notification-wrap">
              <button className="icon-button ghost-icon" title="Notifications" type="button" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={22} />
                {notifications.filter((n) => !n.lu).length > 0 && <span className="notification-count">{notifications.filter((n) => !n.lu).length}</span>}
              </button>
              {showNotifications && (
                <div className="notification-menu">
                  <strong>Notifications</strong>
                  {notifications.length === 0 ? <p>{tr(lang, 'noNotification')}</p> : notifications.map((n) => (
                    <button className="notification-item" key={n.id_notification} type="button" onClick={() => openNotificationTarget(n)}>
                      <b>{n.titre}</b>
                      <span>{n.message}</span>
                      <small>{formatDate(n.created_at)}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="icon-button ghost-icon" title="Aide" type="button" onClick={() => setShowHelp(true)}>
              <HelpCircle size={22} />
            </button>
            <div className="user-card">
              <div>
                <strong>{user?.nom || user?.email || 'Admin'}</strong>
                <span>{user?.role || user?.type || 'manager'}</span>
              </div>
              <button className="avatar profile-button" type="button" title="Profil" onClick={() => setShowProfile(true)}>{getInitials(user?.nom || user?.email || 'U')}</button>
            </div>
          </div>
        </header>
        {page !== 'dashboard' && (
          <section className="content-heading">
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </section>
        )}
        <Page page={page} api={api} notify={notify} lang={lang} user={user} searchQuery={platformSearch} setPage={setPage} onCompanyUpdated={updateCompanyIdentity} />
      </main>
      {selectedNotification && (
        <Modal title={selectedNotification.titre || 'Notification'} onClose={() => setSelectedNotification(null)}>
          <div className="notification-detail">
            <p>{selectedNotification.message}</p>
            <small>{formatDate(selectedNotification.created_at)}</small>
          </div>
        </Modal>
      )}
      {showHelp && <HelpModal page={page} role={user?.role || user?.type || 'manager'} onClose={() => setShowHelp(false)} />}
      {showProfile && <ProfileModal api={api} notify={notify} user={user} onUserUpdate={(updatedUser) => {
        const nextUser = { ...user, ...updatedUser };
        setUser(nextUser);
        localStorage.setItem('crm_user', JSON.stringify(nextUser));
      }} onClose={() => setShowProfile(false)} />}
      {showLogoutConfirm && (
        <Modal title="Confirmer la deconnexion" onClose={() => setShowLogoutConfirm(false)} className="confirm-modal">
          <div className="confirm-delete">
            <AlertTriangle size={42} />
            <h4>Voulez-vous vraiment vous deconnecter ?</h4>
            <p>Si vous confirmez, vous serez ramene a l'ecran de connexion.</p>
            <div className="confirm-actions">
              <button className="btn secondary" type="button" onClick={() => setShowLogoutConfirm(false)}>Non</button>
              <button className="btn danger" type="button" onClick={logout}>Oui</button>
            </div>
          </div>
        </Modal>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Login({ authType, setAuthType, onLogin, notify, toast, goTo }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showForgot, setShowForgot] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetForm, setResetForm] = useState({ email: '', code: '', new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') !== '1') return;
    const email = String(params.get('email') || '').trim().toLowerCase();
    const code = String(params.get('code') || '').replace(/\D/g, '').slice(0, 6);
    setShowForgot(true);
    setResetForm({ email, code, new_password: '', confirm_password: '' });
    setResetStep(email && code.length === 6 ? 'password' : 'email');
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await onLogin({
        email: form.email,
        password: form.password
      });
    } catch (error) {
      notify(error.message);
      setLoading(false);
    }
  };

  const togglePassword = () => {
    const input = passwordRef.current;
    const start = input?.selectionStart ?? form.password.length;
    const end = input?.selectionEnd ?? start;
    setShowPassword((value) => !value);
    window.requestAnimationFrame(() => {
      passwordRef.current?.focus();
      passwordRef.current?.setSelectionRange(start, end);
    });
  };

  const openForgotScreen = () => {
    setResetForm((current) => ({ ...current, email: current.email || form.email }));
    setResetStep('email');
    setShowForgot(true);
  };

  const closeForgotScreen = () => {
    setShowForgot(false);
    setResetStep('email');
    setResetForm({ email: '', code: '', new_password: '', confirm_password: '' });
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const requestResetCode = async (event) => {
    event.preventDefault();
    const email = String(resetForm.email || '').trim().toLowerCase();
    if (!email) {
      notify('Saisissez votre adresse e-mail.');
      return;
    }
    if (resetLoading) return;
    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Demande impossible');
      notify(body.message);
      setResetForm((current) => ({ ...current, email }));
      setResetStep('code');
    } catch (error) {
      notify(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    const code = String(resetForm.code || '').trim();
    if (!/^\d{6}$/.test(code)) {
      notify('Entrez le code a 6 chiffres.');
      return;
    }
    if (resetLoading) return;
    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetForm.email, code })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Code refuse');
      notify(body.message);
      setResetStep('password');
    } catch (error) {
      notify(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const confirmNewPassword = async (event) => {
    event.preventDefault();
    if (resetForm.new_password !== resetForm.confirm_password) {
      notify('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (String(resetForm.new_password || '').length < 6) {
      notify('Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }
    if (resetLoading) return;
    setResetLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Reinitialisation refusee');
      notify(body.message);
      setForm((current) => ({ ...current, email: resetForm.email, password: '' }));
      closeForgotScreen();
    } catch (error) {
      notify(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  if (showForgot) {
    return (
      <main className="login-page reset-page">
        <section className="login-panel reset-panel">
          <div className="login-box reset-card">
            <button className="reset-back" type="button" onClick={closeForgotScreen}>
              <ChevronLeft size={20} /> Retour
            </button>
            <div className="login-card-brand">
              <img className="login-logo" src={LOGO_URL} alt="" />
              <div>
                <strong>{APP_NAME}</strong>
                <span>Reinitialisation du mot de passe</span>
              </div>
            </div>
            <h2>Mot de passe oublie</h2>
            <p>
              {resetStep === 'email' && 'Entrez votre email de connexion. Vous recevrez un code a 6 chiffres.'}
              {resetStep === 'code' && 'Entrez le code recu par email pour confirmer votre identite.'}
              {resetStep === 'password' && 'Choisissez votre nouveau mot de passe.'}
            </p>

            {resetStep === 'email' && (
              <form className="form" onSubmit={requestResetCode}>
                <label>Adresse e-mail
                  <span className="input-shell">
                    <Mail size={22} />
                    <input type="email" value={resetForm.email} onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })} placeholder="nom@entreprise.com" required />
                  </span>
                </label>
                <button className="btn login-submit" disabled={resetLoading}>
                  {resetLoading ? 'Envoi...' : 'Envoyer le code'} <ArrowRight size={20} />
                </button>
              </form>
            )}

            {resetStep === 'code' && (
              <form className="form" onSubmit={verifyCode}>
                <label>Code de verification
                  <span className="input-shell reset-code-shell">
                    <LockKeyhole size={22} />
                    <input inputMode="numeric" maxLength={6} value={resetForm.code} onChange={(e) => setResetForm({ ...resetForm, code: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="000000" required />
                  </span>
                </label>
                <div className="reset-actions">
                  <button className="btn secondary" type="button" disabled={resetLoading} onClick={requestResetCode}>Renvoyer</button>
                  <button className="btn login-submit" disabled={resetLoading}>
                    {resetLoading ? 'Verification...' : 'Verifier'} <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            )}

            {resetStep === 'password' && (
              <form className="form" onSubmit={confirmNewPassword}>
                <label>Nouveau mot de passe
                  <span className="input-shell">
                    <LockKeyhole size={22} />
                    <input type={showNewPassword ? 'text' : 'password'} value={resetForm.new_password} onChange={(e) => setResetForm({ ...resetForm, new_password: e.target.value })} placeholder="Nouveau mot de passe" required />
                    <button className="password-eye" type="button" aria-label={showNewPassword ? 'Masquer le nouveau mot de passe' : 'Afficher le nouveau mot de passe'} aria-pressed={showNewPassword} onMouseDown={(event) => event.preventDefault()} onClick={() => setShowNewPassword((visible) => !visible)} title={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                      {showNewPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                    </button>
                  </span>
                </label>
                <label>Confirmer le mot de passe
                  <span className="input-shell">
                    <LockKeyhole size={22} />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={resetForm.confirm_password} onChange={(e) => setResetForm({ ...resetForm, confirm_password: e.target.value })} placeholder="Retapez le mot de passe" required />
                    <button className="password-eye" type="button" aria-label={showConfirmPassword ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'} aria-pressed={showConfirmPassword} onMouseDown={(event) => event.preventDefault()} onClick={() => setShowConfirmPassword((visible) => !visible)} title={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                      {showConfirmPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                    </button>
                  </span>
                </label>
                <button className="btn login-submit" disabled={resetLoading}>
                  {resetLoading ? 'Enregistrement...' : 'Changer le mot de passe'} <ArrowRight size={20} />
                </button>
              </form>
            )}
          </div>
        </section>
        {toast && <div className="toast">{toast}</div>}
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-box">
          <button className="login-home-link login-home-top" type="button" onClick={() => goTo('/')}><Home size={17} /> Retour a l'accueil</button>
          <div className="login-card-brand">
            <img className="login-logo" src={LOGO_URL} alt="" />
            <div>
              <strong>{APP_NAME}</strong>
              <span>{APP_TAGLINE}</span>
            </div>
          </div>
          <h2>Connexion</h2>
          <p>Connectez-vous avec votre adresse email. Votre espace sera reconnu automatiquement.</p>
          <form className="form" onSubmit={submit}>
            <label>Adresse e-mail
              <span className="input-shell">
                <Mail size={22} />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nom@entreprise.com" required />
              </span>
            </label>
            <label>
              <span className="login-label-row">
                Mot de passe
              </span>
              <span className="input-shell">
                <LockKeyhole size={22} />
                <input ref={passwordRef} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mot de passe" required />
                <button className="password-eye" type="button" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword} onMouseDown={(event) => event.preventDefault()} onClick={togglePassword} title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                </button>
              </span>
              <button className="forgot-inline" type="button" onClick={openForgotScreen}>Mot de passe oublie ?</button>
            </label>
            <button className="btn login-submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'} <LogIn size={20} />
            </button>
          </form>
          <p className="login-signup-link">
            Vous n'avez pas de compte ? <button type="button" onClick={() => goTo('/inscription')}>S'inscrire</button>
          </p>
        </div>
      </section>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function HelpModal({ page, role, onClose }) {
  const common = {
    dashboard: ['Tableau de bord', "Voir les indicateurs autorises pour votre poste et ouvrir rapidement les pages utiles."],
    produits: ['Produits et stock', "Consulter le stock, ajouter un produit si votre role le permet et enregistrer les entrees de stock."],
    categories: ['Categories', "Classer les produits pour retrouver rapidement les articles en magasin."],
    fournisseurs: ['Fournisseurs', "Gerer uniquement les coordonnees des fournisseurs et suivre les entrees de stock."],
    rapportsStock: ['Rapports produits', "Consulter l'inventaire, les mouvements de stock et les entrees de stock."],
    clients: ['Clients', "Ajouter les clients, consulter leur historique et imprimer une fiche client."],
    ventes: ['Ventes', "Creer une facture, choisir les produits vendus et imprimer le document client."],
    paiements: ['Paiements', "Enregistrer l'argent recu sur les factures et suivre les restes a payer."],
    rapportsCaisse: ['Rapports caisse', "Voir les factures, dettes clients, paiements recus et le livre de caisse."],
    utilisateurs: ['Utilisateurs', "Creer les comptes de l'equipe, modifier les roles et reinitialiser les acces."],
    mails: ['Emails', "Envoyer des messages aux clients ou des notifications internes a l'equipe."],
    rapportsManager: ['Rapports', "Analyser les ventes, creances, stock, resultats et meilleurs clients."]
  };

  const byRole = {
    client: [
      ['Mon espace', 'Voir votre resume client, vos commandes recentes et vos raccourcis utiles.'],
      ['Commandes', 'Choisir les produits disponibles, ajouter au panier et envoyer une commande.'],
      ['Mes achats', 'Consulter vos factures, montants payes et restes a payer.'],
      ['Reclamations', 'Envoyer une reclamation au manager avec les references de commande ou facture.'],
      ['Assistance', 'Discuter avec le bot ou le manager pour obtenir une aide sur prix, paiement ou suivi.']
    ],
    magasinier: [common.dashboard, common.produits, common.categories, common.fournisseurs, common.rapportsStock],
    vendeur: [common.dashboard, common.clients, common.ventes, common.paiements, common.rapportsCaisse],
    manager: [common.dashboard, common.clients, common.ventes, common.paiements, common.produits, common.fournisseurs, common.rapportsManager, common.utilisateurs, common.mails, ['Journal d’audit', 'Voir qui a cree, modifie ou supprime des donnees sensibles.']]
  };

  const pageAliases = {
    rapports: role === 'magasinier' ? 'rapportsStock' : role === 'vendeur' ? 'rapportsCaisse' : 'rapportsManager'
  };
  const currentKey = pageAliases[page] || page;
  const currentHelp = common[currentKey];
  const roleHelp = byRole[role] || byRole.manager;
  const items = currentHelp
    ? [currentHelp, ...roleHelp.filter(([title]) => title !== currentHelp[0])]
    : roleHelp;

  return (
    <Modal title="Aide rapide" onClose={onClose}>
      <div className="help-grid">
        {items.map(([title, description]) => (
          <article key={title}><strong>{title}</strong><span>{description}</span></article>
        ))}
      </div>
    </Modal>
  );
}

function ProfileModal({ api, notify, user, onUserUpdate, onClose }) {
  const [profile, setProfile] = useState({ nom: user?.nom || '', telephone: user?.telephone || '' });
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const saveProfile = async () => {
    if (!profile.nom.trim()) {
      notify('Le nom est requis');
      return;
    }
    setSavingProfile(true);
    try {
      const response = await api(`/${user?.type === 'client' ? 'client-auth' : 'auth'}/profile`, { method: 'PUT', body: JSON.stringify(profile) });
      onUserUpdate?.(response.user || profile);
      notify(response.message || 'Profil mis a jour');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (form.new_password !== form.confirm_password) {
      notify('Les mots de passe ne correspondent pas');
      return;
    }
    await api(`/${user?.type === 'client' ? 'client-auth' : 'auth'}/change-password`, { method: 'POST', body: JSON.stringify(form) });
    setForm({ new_password: '', confirm_password: '' });
    notify('Mot de passe mis a jour');
  };

  return (
    <Modal title="Profil" onClose={onClose}>
      <div className="profile-summary">
        <div className="avatar big">{getInitials(profile.nom || user?.email || 'U')}</div>
        <div>
          <strong>{profile.nom || '-'}</strong>
          <span>{user?.email || '-'}</span>
          <em>{user?.role || 'utilisateur'}</em>
        </div>
      </div>
      <Form onSubmit={saveProfile}>
        <Input label="Nom complet" value={profile.nom} onChange={(nom) => setProfile({ ...profile, nom })} required />
        <Input label="Telephone" value={profile.telephone} onChange={(telephone) => setProfile({ ...profile, telephone })} placeholder="Ex: +243..." />
        <button className="btn modal-submit" disabled={savingProfile}><UserCog size={18} /> {savingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}</button>
      </Form>
      <Form onSubmit={savePassword}>
        <Input label="Nouveau mot de passe" type="password" value={form.new_password} onChange={(new_password) => setForm({ ...form, new_password })} />
        <Input label="Confirmer" type="password" value={form.confirm_password} onChange={(confirm_password) => setForm({ ...form, confirm_password })} />
        <button className="btn modal-submit"><LockKeyhole size={18} /> Changer mon mot de passe</button>
      </Form>
    </Modal>
  );
}

function Page({ page, api, notify, lang, user, searchQuery, setPage, onCompanyUpdated }) {
  const [data, setData] = useState({ clients: [], produits: [], categories: [], fournisseurs: [], ventes: [], extra: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const next = { clients: [], produits: [], categories: [], fournisseurs: [], ventes: [], extra: {} };
      const tasks = [];
      if (['clients', 'ventes', 'paiements'].includes(page)) tasks.push(api('/clients').then((r) => { next.clients = r.data || []; }));
      if (['produits', 'categories', 'fournisseurs', 'ventes', 'rapports'].includes(page)) tasks.push(api('/produits').then((r) => { next.produits = r.data || []; }));
      if (['produits', 'categories', 'ventes'].includes(page)) tasks.push(api('/categories').then((r) => { next.categories = r.data || []; }).catch(() => {}));
      if (['produits', 'fournisseurs'].includes(page)) tasks.push(api('/fournisseurs').then((r) => { next.fournisseurs = r.data || []; }).catch(() => {}));
      if (['ventes', 'paiements'].includes(page)) tasks.push(api('/ventes').then((r) => { next.ventes = r.data || []; }));
      if (page === 'dashboard') {
        tasks.push(api('/clients').then((r) => { next.clients = r.data || []; }).catch(() => {}));
        tasks.push(api('/produits').then((r) => { next.produits = r.data || []; }).catch(() => {}));
        tasks.push(api('/ventes').then((r) => { next.ventes = r.data || []; }).catch(() => {}));
        tasks.push(api('/dashboard/stats').then((r) => { next.extra.stats = r.data || {}; }).catch(() => {}));
        tasks.push(api('/dashboard/ventes-mensuelles').then((r) => { next.extra.ventesMensuelles = r.data || []; }).catch(() => {}));
        tasks.push(api('/dashboard/resultat-mensuel').then((r) => { next.extra.resultatMensuel = r.data || []; }).catch(() => {}));
        tasks.push(api('/dashboard/alertes-stock').then((r) => { next.extra.alertes = r.data || []; }).catch(() => {}));
        tasks.push(api('/dashboard/produits-plus-vendus').then((r) => { next.extra.produitsPlusVendus = r.data || []; }).catch(() => {}));
        tasks.push(api('/produits/mouvements-recents').then((r) => { next.extra.mouvementsStock = r.data || []; }).catch(() => {}));
        tasks.push(api('/paiements/repartition').then((r) => { next.extra.repartitionPaiements = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/top-acheteurs').then((r) => { next.extra.top = r.data || []; }).catch(() => {}));
      }
      if (page === 'produits') tasks.push(api('/produits/mouvements-recents').then((r) => { next.extra.mouvementsStock = r.data || []; }).catch(() => {}));
      if (page === 'paiements') {
        tasks.push(api('/paiements').then((r) => { next.extra.paiements = r.data || []; }));
        tasks.push(api('/paiements/rapport-caisse').then((r) => { next.extra.caisse = r.data || []; }).catch(() => {}));
      }
      if (page === 'utilisateurs') tasks.push(api('/utilisateurs').then((r) => { next.extra.utilisateurs = r.data || []; }));
      if (page === 'audit') tasks.push(api('/utilisateurs/audit/journal?all=1').then((r) => { next.extra.auditLogs = r.data || []; }).catch(() => {}));
      if (page === 'mails') {
        tasks.push(api('/mail/status').then((r) => { next.extra.mailStatus = r.data || {}; }).catch(() => {}));
        tasks.push(api('/mail/messages').then((r) => { next.extra.mailMessages = r.data || []; }).catch(() => {}));
      }
      if (page === 'dashboard' && user?.role === 'client') {
        tasks.push(api('/client-auth/dashboard').then((r) => {
          next.extra.clientDashboard = r.data || {};
          next.extra.commandes = r.data?.dernieres_commandes || [];
          next.extra.achats = r.data?.factures_recentes || [];
        }));
      }
      if (page === 'commandes') {
        tasks.push(api('/commandes').then((r) => { next.extra.commandes = r.data || []; }));
        tasks.push(api('/commandes/catalogue').then((r) => { next.extra.catalogue = r.data || []; }));
      }
      if (page === 'achats') {
        tasks.push(api('/commandes/achats').then((r) => { next.extra.achats = r.data || []; }));
      }
      if (page === 'reclamations') {
        tasks.push(api('/reclamations').then((r) => { next.extra.reclamations = r.data || []; }));
        if (user?.role === 'client') tasks.push(api('/commandes').then((r) => { next.extra.commandes = r.data || []; }));
      }
      if (page === 'chat') tasks.push(api('/chat').then((r) => { next.extra.chats = r.data || []; }));
      if (page === 'commentaires') tasks.push(api('/public/contacts').then((r) => { next.extra.commentaires = r.data || []; }));
      if (page === 'rapports') {
        tasks.push(api('/rapports/factures').then((r) => { next.extra.factures = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/creances').then((r) => { next.extra.creances = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/stock-inventaire').then((r) => { next.extra.stock = r.data || []; }).catch(() => {}));
        tasks.push(api('/produits/mouvements-recents').then((r) => { next.extra.mouvementsStock = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/top-acheteurs').then((r) => { next.extra.top = r.data || []; }).catch(() => {}));
        tasks.push(api('/paiements/rapport-caisse').then((r) => { next.extra.caisse = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/journal').then((r) => { next.extra.journal = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/livre-caisse').then((r) => { next.extra.livreCaisse = r.data || []; }).catch(() => {}));
        tasks.push(api('/archives').then((r) => { next.extra.archives = r.data || []; }).catch(() => {}));
      }
      await Promise.all(tasks);
      setData(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const submit = async (handler) => {
    try {
      await handler();
      await load();
    } catch (err) {
      notify(err.message);
      throw err;
    }
  };

  if (loading) return <div className="page-loader-shell"><QcLoader label="Chargement des donnees" /></div>;
  if (error) return <p className="notice">{error}</p>;

  const props = { api, notify, data, submit, lang, user, searchQuery, setPage };
  if (page === 'dashboard' && user?.role === 'client') return <ClientDashboard data={data} setPage={setPage} user={user} />;
  if (page === 'dashboard') return <Dashboard data={data} searchQuery={searchQuery} setPage={setPage} user={user} />;
  if (page === 'clients') return <Clients {...props} />;
  if (page === 'produits') return <Produits {...props} />;
  if (page === 'fournisseurs') return <Fournisseurs {...props} />;
  if (page === 'ventes') return <Ventes {...props} />;
  if (page === 'paiements') return <Paiements {...props} />;
  if (page === 'utilisateurs') return <Utilisateurs {...props} />;
  if (page === 'audit') return <AuditJournal {...props} />;
  if (page === 'mails') return <Mails {...props} />;
  if (page === 'categories') return <Categories {...props} />;
  if (page === 'rapports') return <Rapports data={data} searchQuery={searchQuery} user={user} />;
  if (page === 'commandes') return <Commandes {...props} />;
  if (page === 'achats') return <AchatsClient {...props} />;
  if (page === 'reclamations') return <Reclamations {...props} />;
  if (page === 'chat') return <ChatPage {...props} />;
  if (page === 'commentaires') return <Commentaires {...props} />;
  if (page === 'parametres') return <ParametresEntreprise api={api} notify={notify} onCompanyUpdated={onCompanyUpdated} />;
  return null;
}

function ParametresEntreprise({ api, notify, onCompanyUpdated }) {
  const emptyForm = { raison_sociale: '', logo_url: '', num_id_nationale: '', email: '', ville: '' };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api('/entreprise')
      .then((response) => {
        if (!active) return;
        const entreprise = response.data || {};
        setForm({
          raison_sociale: entreprise.raison_sociale || '',
          logo_url: entreprise.logo_url || '',
          num_id_nationale: entreprise.num_id_nationale || '',
          email: entreprise.email || '',
          ville: entreprise.ville || ''
        });
      })
      .catch((error) => notify(error.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const response = await api('/entreprise', { method: 'PUT', body: JSON.stringify(form) });
      setForm({
        raison_sociale: response.data.raison_sociale || '',
        logo_url: response.data.logo_url || '',
        num_id_nationale: response.data.num_id_nationale || '',
        email: response.data.email || '',
        ville: response.data.ville || ''
      });
      onCompanyUpdated?.(response.data);
      notify('Configuration enregistree avec succes.');
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loader-shell"><QcLoader label="Chargement de la configuration" /></div>;

  return (
    <section className="company-settings-layout">
      <article className="panel company-settings-preview">
        <span className="section-kicker">Apercu</span>
        <div className="company-logo-preview">
          <img src={form.logo_url || LOGO_URL} alt={`Logo ${form.raison_sociale || "de l'entreprise"}`} />
        </div>
        <h2>{form.raison_sociale || "Nom de l'entreprise"}</h2>
        <p>{[form.ville, form.email].filter(Boolean).join(' • ') || 'Vos informations apparaitront ici.'}</p>
      </article>

      <article className="panel company-settings-form">
        <div className="panel-heading">
          <div>
            <h3>Identite de l'entreprise</h3>
            <p>Ces informations sont partagees avec tous les utilisateurs de votre entreprise.</p>
          </div>
        </div>
        <Form onSubmit={save}>
          <div className="form-grid">
            <Input label="Nom de l'entreprise" value={form.raison_sociale} onChange={(value) => setForm({ ...form, raison_sociale: value })} required maxLength={200} />
            <Input label="Numero d'identification" value={form.num_id_nationale} onChange={(value) => setForm({ ...form, num_id_nationale: value })} maxLength={50} />
            <Input label="Email de l'entreprise" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} maxLength={150} />
            <Input label="Ville" value={form.ville} onChange={(value) => setForm({ ...form, ville: value })} maxLength={100} />
          </div>
          <PhotoInput label="Logo de l'entreprise" value={form.logo_url} onChange={(value) => setForm({ ...form, logo_url: value })} api={api} folder="companies" notify={notify} />
          <div className="form-actions">
            <button className="btn" type="submit" disabled={saving || !form.raison_sociale.trim()}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </Form>
      </article>
    </section>
  );
}

function Dashboard({ data, searchQuery = '', setPage, user }) {
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const stats = data.extra.stats || {};
  const ventes = data.extra.ventesMensuelles || [];
  const alertes = data.extra.alertes || [];
  const topClients = (data.extra.top || []).slice(0, 3);
  const topProducts = data.extra.produitsPlusVendus || [];
  const resultatRows = data.extra.resultatMensuel || [];
  const dashboardTerm = searchQuery.trim().toLowerCase();
  const factures = (data.ventes || [])
    .filter((v) => !dashboardTerm || `${v.numero_facture} ${v.client_nom || ''}`.toLowerCase().includes(dashboardTerm))
    .slice(0, 5);
  const chartMonths = (ventes.length ? ventes : ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'].map((mois) => ({ mois, total: 0 })));
  const maxVente = Math.max(...chartMonths.map((v) => Number(v.total || 0)), 1);
  const paymentRows = (data.extra.repartitionPaiements || []).map((row) => ({
    mode: row.mode_paiement || row.Mode_Paiement || 'autre',
    label: {
      especes: 'Especes',
      carte: 'Carte',
      virement: 'Virement',
      mobile_money: 'Mobile Money',
      stripe: 'Carte'
    }[row.mode_paiement || row.Mode_Paiement] || (row.mode_paiement || row.Mode_Paiement || 'Autre'),
    total: Number(row.total || row.Total_Encaisse || 0),
    transactions: Number(row.transactions || row.Nombre_Transactions || 0)
  }));
  const paymentTotal = paymentRows.reduce((sum, row) => sum + row.total, 0);
  const paymentPalette = ['#002761', '#9a6400', '#8fb0e8', '#747982', '#ffae2b'];
  const donutParts = paymentRows.reduce((acc, row, index) => {
    const start = acc.cursor;
    const share = paymentTotal > 0 ? (row.total / paymentTotal) * 100 : 0;
    return {
      cursor: start + share,
      segments: [...acc.segments, `${paymentPalette[index % paymentPalette.length]} ${start}% ${start + share}%`]
    };
  }, { cursor: 0, segments: [] }).segments;
  const selectedPayment = paymentRows.find((row) => row.mode === selectedPaymentMode) || paymentRows[0];
  const paymentPercent = paymentTotal > 0 && selectedPayment ? Math.round((selectedPayment.total / paymentTotal) * 100) : 0;
  const invoiceStatus = (vente) => {
    const reste = Number(vente.reste_a_payer || 0);
    const total = Number(vente.montant_ttc || 0);
    if (reste <= 0) return 'PAYE';
    if (reste < total) return 'PARTIEL';
    return 'IMPAYE';
  };
  const role = user?.role || 'manager';
  const canSales = ['manager', 'vendeur'].includes(role);
  const canStock = ['manager', 'magasinier'].includes(role);
  const canClients = ['manager', 'vendeur'].includes(role);
  const canPayments = ['manager', 'vendeur'].includes(role);
  const stockTotal = (data.produits || []).reduce((sum, produit) => sum + Number(produit.quantite_stock || 0), 0);
  const stockAlerts = alertes.length || (data.produits || []).filter((produit) => produit.statut_stock && produit.statut_stock !== 'OK').length;
  const monthlyCash = Number(stats.argent_recu_mois ?? paymentTotal);
  const dashboardKpis = [
    canSales && { icon: CreditCard, tone: 'orange', label: 'Total vendu ce mois', value: moneySmart(stats.ca_mois_en_cours), page: 'ventes' },
    canPayments && { icon: WalletCards, tone: 'green', label: 'Argent deja recu', value: moneySmart(monthlyCash), page: 'paiements' },
    canSales && { icon: Coins, tone: 'blue', label: "Cout d'achat des ventes", value: moneySmart(stats.cout_achat_mois), page: 'rapports' },
    canSales && { icon: BarChart3, tone: Number(stats.resultat_mois || 0) >= 0 ? 'green' : 'danger', label: Number(stats.resultat_mois || 0) >= 0 ? 'Benefice du mois' : 'Perte du mois', value: moneySmart(stats.resultat_mois), page: 'rapports', negative: Number(stats.resultat_mois || 0) < 0 },
    canClients && { icon: Users, tone: 'blue', label: 'Total Clients', value: stats.total_clients || data.clients.length || 0, page: 'clients' },
    canStock && { icon: Package, tone: 'blue', label: 'Produits suivis', value: data.produits.length || 0, page: 'produits' },
    canStock && { icon: Box, tone: 'orange', label: 'Stock total', value: stockTotal, page: 'produits' },
    canStock && { icon: Coins, tone: 'blue', label: 'Valeur du stock', value: moneySmart(stats.total_valeur_stock), page: 'produits' },
    canStock && { icon: AlertTriangle, tone: 'danger', label: 'Alertes stock', value: `${stockAlerts} produits`, trend: stockAlerts ? 'Urgent' : 'OK', negative: Boolean(stockAlerts), page: 'produits' },
    role === 'magasinier' && { icon: Download, tone: 'green', label: 'Approvisionnements', value: (data.extra.mouvementsStock || []).filter((m) => m.type_mouvement === 'entree').length, page: 'produits' }
  ].filter(Boolean).slice(0, 4);

  return (
    <div className="manager-dashboard">
      <div className="grid cols-4 manager-kpis">
        {dashboardKpis.map((card) => (
          <KpiCard key={card.label} icon={card.icon} tone={card.tone} label={card.label} value={card.value} trend={card.trend} negative={card.negative} onClick={() => setPage?.(card.page)} />
        ))}
      </div>
      {(canSales || canPayments) && (
        <div className="grid manager-mid">
          {canSales && (
            <div className="panel manager-chart-panel">
              <div className="panel-heading">
                <h3>Ventes des 6 derniers mois</h3>
                <div className="chart-legend">
                  <span><i className="sales" /> Activites reelles</span>
                </div>
              </div>
              <div className="activity-chart-shell">
                <div className="chart-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="activity-axis">
                  {chartMonths.map((row) => {
                    const month = String(row.mois || '').slice(0, 3);
                    const value = Number(row.total || 0);
                    const height = value > 0 ? Math.max(24, (value / maxVente) * 210) : 8;
                    return (
                      <button className="activity-month" key={month} type="button" title={`Activite ${month}: ${money(value)}`}>
                        <strong>{value > 0 ? formatUsdCompact(value).replace('USD ', '') : '-'}</strong>
                        <div className="activity-track">
                          <i style={{ height }} />
                        </div>
                        <span>{month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {canPayments && (
            <div className="panel payment-panel">
              <h3>Modes de paiement</h3>
              <div className="donut-wrap">
                <div
                  className="payment-donut"
                  style={{ background: `radial-gradient(circle closest-side, #fff 66%, transparent 67%), conic-gradient(${donutParts.length ? donutParts.join(', ') : '#e6e8ee 0% 100%'})` }}
                  title={selectedPayment ? `${selectedPayment.label}: ${money(selectedPayment.total)}` : 'Aucun paiement'}
                >
                  <strong><AnimatedNumber value={paymentPercent} formatter={(amount) => `${Math.round(amount)}%`} /></strong>
                  <span>{selectedPayment?.label || 'AUCUN'}</span>
                </div>
              </div>
              <div className="payment-legend">
                {paymentRows.length ? paymentRows.map((row, index) => (
                  <button className={selectedPayment?.mode === row.mode ? 'active' : ''} key={row.mode} type="button" onClick={() => setSelectedPaymentMode(row.mode)}>
                    <i style={{ background: paymentPalette[index % paymentPalette.length] }} />
                    <span>{row.label}</span>
                    <b>{money(row.total)}</b>
                  </button>
                )) : <span><i className="card-pay" /> Aucun paiement</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {canSales && (
        <div className="panel result-panel">
          <div className="panel-heading">
            <h3>Resultat mensuel</h3>
            <span className={`panel-pill ${Number(stats.resultat_mois || 0) >= 0 ? 'ok' : 'danger'}`}>
              {Number(stats.resultat_mois || 0) >= 0 ? 'Benefice du mois' : 'Perte du mois'} <AnimatedNumber value={stats.resultat_mois} formatter={moneySmart} />
            </span>
          </div>
          <div className="result-summary-grid">
            <article><span>Ventes HT</span><strong><AnimatedNumber value={stats.ventes_ht_mois} formatter={moneySmart} /></strong></article>
            <article><span>Cout achat</span><strong><AnimatedNumber value={stats.cout_achat_mois} formatter={moneySmart} /></strong></article>
            <article><span>Benefice</span><strong className={Number(stats.resultat_mois || 0) >= 0 ? 'profit' : 'loss'}><AnimatedNumber value={stats.resultat_mois} formatter={moneySmart} /></strong></article>
          </div>
          <div className="result-bars">
            {(resultatRows.length ? resultatRows : chartMonths.map((row) => ({ mois: row.mois, resultat: 0, ventes_ht: 0, cout_achat: 0 }))).map((row) => {
              const values = (resultatRows.length ? resultatRows : [{ resultat: 1 }]).map((item) => Math.abs(Number(item.resultat || 0)));
              const maxResult = Math.max(...values, 1);
              const value = Number(row.resultat || 0);
              const width = Math.max(4, Math.abs(value) / maxResult * 100);
              return (
                <button className={`result-bar ${value < 0 ? 'loss' : 'profit'}`} key={row.mois} type="button" title={`${row.mois}: ${moneySmart(value)}`}>
                  <span className="result-month">{row.mois}</span>
                  <span className="result-bar-track"><i className="result-bar-fill" style={{ width: `${width}%` }} /></span>
                  <strong>{moneySmart(value)}</strong>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {canClients && (
        <div className="grid manager-bottom">
        <div className="panel manager-table-panel">
          <div className="panel-heading">
            <h3>5 dernieres factures</h3>
            <button className="link-button" type="button" onClick={() => setPage?.('ventes')}>Voir tout</button>
          </div>
          <Table headers={['N° Facture', 'Client', 'Date', 'Montant TTC', 'Status', 'Action']} rows={factures.map((v) => [
            v.numero_facture,
            v.client_nom,
            formatDate(v.date_vente || v.date_creation),
            money(v.montant_ttc),
            <Badge>{invoiceStatus(v)}</Badge>,
            <button className="action view-action" type="button" title="Voir" onClick={() => setSelectedInvoice(v)}><Eye size={19} /></button>
          ])} />
        </div>

        <div className="panel top-clients-panel">
          <h3>Top 3 Clients</h3>
          <div className="top-client-list">
            {topClients.length ? topClients.map((client, index) => {
              const achats = Number(client.nombre_achats || 0);
              return (
                <article key={`${client.nom}-${index}`}>
                  <div className="client-avatar">{String(client.nom || 'C').charAt(0).toUpperCase()}</div>
                  <div>
                    <strong>{client.nom} {client.postnom || ''}</strong>
                    <span>{achats} achat{achats > 1 ? 's' : ''} enregistre{achats > 1 ? 's' : ''}</span>
                  </div>
                  <div className="client-spend">
                    <strong>{formatUsd(client.ca_total)}</strong>
                    <span>Chiffre d'affaires</span>
                  </div>
                  <em>
                    {client.derniere_visite ? (
                      <>
                        <small>Derniere facture</small>
                        {formatDate(client.derniere_visite)}
                      </>
                    ) : 'Aucune facture'}
                  </em>
                </article>
              );
            }) : <div className="empty large">Aucun client classe</div>}
          </div>
          <button className="portfolio-link" type="button" onClick={() => setPage?.('clients')}>Analyse complete du portefeuille <ArrowRight size={20} /></button>
        </div>
      </div>
      )}

      <div className="panel top-products-panel">
        <div className="panel-heading">
          <h3>Produits les plus vendus</h3>
          <span className="panel-pill">Top 3</span>
        </div>
        <div className="top-products-chart">
          {topProducts.length ? topProducts.slice(0, 3).map((product, index) => {
            const maxQty = Math.max(...topProducts.map((p) => Number(p.quantite_vendue || 0)), 1);
            const width = Math.max(18, (Number(product.quantite_vendue || 0) / maxQty) * 100);
            return (
              <article className={`top-product top-${index + 1}`} key={product.id_produit || product.nom}>
                <div className="product-rank">{index + 1}</div>
                <div>
                  <strong>{product.nom}</strong>
                  <span>{product.reference_produit || 'Produit'}</span>
                </div>
                <div className="product-bar"><i style={{ width: `${width}%` }} /></div>
                <b>{product.quantite_vendue || 0}</b>
              </article>
            );
          }) : <div className="empty large">Aucune vente produit</div>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <h3>{role === 'magasinier' ? 'Approvisionnements recents' : 'Mouvements stock recents'}</h3>
          <span className="panel-pill">10 derniers mouvements</span>
        </div>
        <Table headers={['Produit', 'Libelle', 'Type', 'Quantite', 'Fournisseur', 'Prix achat', 'Total', 'Date']} rows={(data.extra.mouvementsStock || []).slice(0, 10).map((m) => [
          m.produit_nom,
          m.note || `${m.type_mouvement === 'entree' ? 'Entree stock' : 'Sortie stock'} - ${m.reference_produit || m.produit_nom || 'Produit'}`,
          <Badge>{m.type_mouvement}</Badge>,
          m.quantite,
          m.fournisseur_nom || '-',
          m.prix_achat_unitaire !== null && m.prix_achat_unitaire !== undefined ? moneySmart(m.prix_achat_unitaire) : '-',
          m.prix_achat_total !== null && m.prix_achat_total !== undefined ? moneySmart(m.prix_achat_total) : '-',
          formatDate(m.date_mouvement)
        ])} />
      </div>
      {selectedInvoice && (
        <Modal title={`Facture ${selectedInvoice.numero_facture}`} onClose={() => setSelectedInvoice(null)}>
          <div className="user-history">
            <Stat label="Client" value={selectedInvoice.client_nom || '-'} />
            <Stat label="Montant" value={money(selectedInvoice.montant_ttc)} />
            <Stat label="Reste" value={money(selectedInvoice.reste_a_payer)} />
          </div>
          <button className="btn modal-submit" type="button" onClick={() => printDocument('Facture', [['Facture', selectedInvoice.numero_facture], ['Client', selectedInvoice.client_nom], ['Montant', money(selectedInvoice.montant_ttc)], ['Paye', money(selectedInvoice.total_paye)], ['Reste', money(selectedInvoice.reste_a_payer)]], { paper: 'page' })}><Printer size={18} /> Imprimer</button>
        </Modal>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, tone, label, value, trend, negative = false, active = false, onClick }) {
  const trendText = String(trend || '').replace('-', '');
  const trendPrefix = negative || trendText.startsWith('+') || trendText.includes('Total') || /[A-Za-z]/.test(trendText) ? '' : '+ ';
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper className={`card kpi-card ${active ? 'active' : ''}`} type={onClick ? 'button' : undefined} onClick={onClick}>
      <div className="kpi-top">
        <div className={`kpi-icon ${tone}`}>
          <Icon size={30} />
        </div>
        {trend && <span className={`trend ${negative ? 'down' : ''}`}>{trendPrefix}{trendText}</span>}
      </div>
      <span>{label}</span>
      <strong><AnimatedValue value={value} /></strong>
    </Wrapper>
  );
}

function AnimatedValue({ value }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(numeric)) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const totalFrames = 54;
    const timer = window.setInterval(() => {
      frame += 1;
      const next = numeric * (frame / totalFrames);
      setDisplay(typeof value === 'number' ? Math.round(next) : String(value).replace(/-?\d[\d,.]*/, Math.round(next).toLocaleString('en-US')));
      if (frame >= totalFrames) {
        window.clearInterval(timer);
        setDisplay(value);
      }
    }, 32);
    return () => window.clearInterval(timer);
  }, [value]);
  return display;
}

function Stat({ label, value }) {
  return <div className="card stat"><span>{label}</span><strong>{value}</strong></div>;
}

function Bar({ label, value, max = 1 }) {
  const h = Math.min(160, Math.max(8, (Number(value || 0) / max) * 150));
  return <div className="bar-item" title={`${label}: ${money(value)}`}><div className="bar-value" style={{ height: h }} /><span>{label}</span></div>;
}

function CreateLauncher({ title, description, buttonLabel, onClick }) {
  return (
    <div className="panel create-launcher">
      <div className="launcher-icon"><Plus size={28} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="btn" type="button" onClick={onClick}>
        <Plus size={18} />
        {buttonLabel}
      </button>
    </div>
  );
}

function LineEditor({ lignes, setLignes, produits }) {
  const [productQuery, setProductQuery] = useState('');
  const productKey = (produit) => produit?.reference_produit || produit?.id_produit || '';
  const salePriceForLine = (ligne, produit) => {
    const value = Number(ligne.prix);
    return Number.isFinite(value) && value > 0 ? value : Number(produit?.prix_ht || 0);
  };
  const sortProductsByName = (items) => [...items].sort((a, b) => (
    `${a.nom || ''} ${a.reference_produit || ''}`.localeCompare(`${b.nom || ''} ${b.reference_produit || ''}`, 'fr', { numeric: true })
  ));
  const normalizeLines = (nextLines) => {
    const grouped = [];
    nextLines.filter((ligne) => ligne.produit_id).forEach((ligne) => {
      const produit = produits.find((p) => p.id_produit === ligne.produit_id);
      const key = productKey(produit) || ligne.produit_id;
      const existing = grouped.find((item) => {
        const existingProduct = produits.find((p) => p.id_produit === item.produit_id);
        return (productKey(existingProduct) || item.produit_id) === key;
      });
      if (existing) {
        existing.quantite = Number(existing.quantite || 0) + Math.max(1, Number(ligne.quantite || 1));
        if (ligne.prix !== undefined) existing.prix = ligne.prix;
      } else {
        grouped.push({
          produit_id: ligne.produit_id,
          quantite: Math.max(1, Number(ligne.quantite || 1)),
          prix: ligne.prix
        });
      }
    });
    return grouped.length ? grouped : [{ produit_id: '', quantite: 1 }];
  };
  const activeLines = normalizeLines(lignes).filter((ligne) => ligne.produit_id);

  useEffect(() => {
    const normalized = normalizeLines(lignes);
    if (JSON.stringify(lignes) !== JSON.stringify(normalized)) {
      setLignes(normalized);
    }
  }, [lignes, produits]);

  const updateQuantity = (produit_id, quantite) => {
    const safeQuantity = quantite === '' ? '' : Math.max(1, Number(quantite || 1));
    setLignes(normalizeLines(activeLines.map((ligne) => (
      ligne.produit_id === produit_id ? { ...ligne, quantite: safeQuantity } : ligne
    ))));
  };
  const updatePrice = (produit_id, prix) => {
    setLignes(normalizeLines(activeLines.map((ligne) => (
      ligne.produit_id === produit_id ? { ...ligne, prix } : ligne
    ))));
  };
  const remove = (produit_id) => setLignes(normalizeLines(activeLines.filter((ligne) => ligne.produit_id !== produit_id)));
  const addProduct = (produit_id) => {
    if (!produit_id) return;

    const selectedProduct = produits.find((p) => p.id_produit === produit_id);
    const selectedKey = productKey(selectedProduct) || produit_id;
    const existingIndex = activeLines.findIndex((ligne) => {
      const produit = produits.find((p) => p.id_produit === ligne.produit_id);
      return (productKey(produit) || ligne.produit_id) === selectedKey;
    });

    if (existingIndex >= 0) {
      const updatedLines = activeLines.map((ligne, index) => (
        index === existingIndex ? { ...ligne, quantite: Number(ligne.quantite || 0) + 1 } : ligne
      ));
      const updatedLine = updatedLines[existingIndex];
      setLignes(normalizeLines([updatedLine, ...updatedLines.filter((_, index) => index !== existingIndex)]));
    } else {
      setLignes(normalizeLines([{ produit_id, quantite: 1, prix: Number(selectedProduct?.prix_ht || 0) }, ...activeLines]));
    }

    setProductQuery('');
  };
  const availableProducts = () => {
    const term = productQuery.trim().toLowerCase();
    const usedKeys = new Set(activeLines.map((ligne) => {
      const produit = produits.find((p) => p.id_produit === ligne.produit_id);
      return productKey(produit) || ligne.produit_id;
    }));
    return sortProductsByName(produits.filter((p) => {
      if (usedKeys.has(productKey(p) || p.id_produit)) return false;
      if (Number(p.quantite_stock || 0) <= 0) return false;
      if (Number(p.prix_ht || 0) < Number(p.prix_achat || 0)) return false;
      return !term || `${p.nom} ${p.reference_produit || ''} ${p.categorie_nom || ''}`.toLowerCase().includes(term);
    }));
  };

  return (
    <div className="line-editor">
      <div className="quote-product-picker">
        <input
          type="search"
          value={productQuery}
          onChange={(event) => setProductQuery(event.target.value)}
          placeholder="Rechercher produit, reference ou categorie"
        />
        <select value="" onChange={(event) => addProduct(event.target.value)}>
          <option value="">Choisir un produit a ajouter</option>
          {availableProducts().map((p) => <option key={p.id_produit} value={p.id_produit}>{p.nom} - {p.reference_produit || 'Sans ref.'} - {money(p.prix_ht)}</option>)}
        </select>
        <span>{availableProducts().length} produit{availableProducts().length > 1 ? 's' : ''} disponible{availableProducts().length > 1 ? 's' : ''}</span>
      </div>
      <div className="quote-line-list">
      {activeLines.length ? activeLines.map((ligne, index) => {
        const selectedProduct = produits.find((p) => p.id_produit === ligne.produit_id);
        const prixVente = salePriceForLine(ligne, selectedProduct);
        const prixInputValue = ligne.prix ?? selectedProduct?.prix_ht ?? '';
        const quantite = Math.max(1, Number(ligne.quantite || 1));
        const prixAchat = Number(selectedProduct?.prix_achat || 0);
        const totalLigne = prixVente * quantite;
        const resultatLigne = (prixVente - prixAchat) * quantite;
        return (
          <div className="quote-line-item" key={ligne.produit_id || index}>
            <div>
              <strong>{selectedProduct?.nom || 'Produit selectionne'}</strong>
              <span>{selectedProduct?.reference_produit || 'Sans reference'} - {selectedProduct?.categorie_nom || 'Sans categorie'} - Stock {selectedProduct?.quantite_stock ?? '-'} {selectedProduct?.unite || 'piece'}</span>
              <em>Cout moyen {moneySmart(prixAchat)} / catalogue {moneySmart(selectedProduct?.prix_ht || 0)}</em>
              {prixVente < prixAchat && <strong className="pricing-danger">Vente bloquee : prix inferieur au cout d'achat</strong>}
            </div>
            <div className="line-qty">
              <div className="quantity-control">
                <span>Quantite</span>
                <div>
                  <button type="button" onClick={() => updateQuantity(ligne.produit_id, quantite - 1)} aria-label="Diminuer la quantite">-</button>
                  <input type="number" min="1" value={ligne.quantite} onChange={(event) => updateQuantity(ligne.produit_id, event.target.value)} onFocus={(event) => event.target.select()} />
                  <button type="button" onClick={() => updateQuantity(ligne.produit_id, quantite + 1)} aria-label="Augmenter la quantite">+</button>
                </div>
              </div>
              <Input label="Prix vente unitaire" type="number" min={prixAchat} step="0.01" value={prixInputValue} onChange={(prix) => updatePrice(ligne.produit_id, prix)} />
              <div className="line-result">
                <span>Total</span>
                <strong>{moneySmart(totalLigne)}</strong>
                <small className={resultatLigne >= 0 ? 'profit' : 'loss'}>
                  {resultatLigne >= 0 ? 'Benefice' : 'Perte'} {moneySmart(resultatLigne)}
                  <span className="unit-profit"> ({moneySmart(prixVente - prixAchat)} x {quantite})</span>
                </small>
              </div>
              <button className="action delete" type="button" onClick={() => remove(ligne.produit_id)} title="Supprimer ligne"><Trash2 size={16} /></button>
            </div>
          </div>
        );
      }) : <div className="empty compact">Aucun produit selectionne</div>}
      </div>
    </div>
  );
}

function quoteTotal(lignes, produits) {
  return lignes.reduce((total, ligne) => {
    const produit = produits.find((p) => p.id_produit === ligne.produit_id);
    const prix = Number.isFinite(Number(ligne.prix)) && Number(ligne.prix) > 0 ? Number(ligne.prix) : Number(produit?.prix_ht || 0);
    return total + (prix * Math.max(0, Number(ligne.quantite || 0)));
  }, 0);
}

function quoteTaxTotal(lignes, produits) {
  return lignes.reduce((total, ligne) => {
    const produit = produits.find((p) => p.id_produit === ligne.produit_id);
    const prix = Number.isFinite(Number(ligne.prix)) && Number(ligne.prix) > 0 ? Number(ligne.prix) : Number(produit?.prix_ht || 0);
    return total + (prix * Math.max(0, Number(ligne.quantite || 0)) * taxRate(produit?.taux_tva) / 100);
  }, 0);
}

function QuoteComposer({ form, setForm, clients, produits, submitLabel }) {
  const selectedClient = clients.find((client) => client.id_client === form.client_id) || clients[0];
  const subtotal = quoteTotal(form.lignes, produits);
  const taxTotal = quoteTaxTotal(form.lignes, produits);
  const totalTtc = subtotal + taxTotal;
  const clientOptions = clients.map((c) => [c.id_client, `${c.nom} ${c.postnom || ''} ${c.telephone || ''}`]);
  return (
    <div className="quote-form">
      <section className="quote-block">
        <div className="quote-block-head">
          <span>Client</span>
          {selectedClient && <strong>{selectedClient.nom} {selectedClient.postnom || ''}</strong>}
        </div>
        <SearchableSelect label="Selectionner le client" value={form.client_id} onChange={(client_id) => setForm({ ...form, client_id })} options={clientOptions} placeholder="Rechercher client, postnom ou telephone" />
      </section>
      <section className="quote-block">
        <div className="quote-block-head">
          <span>Articles</span>
          <strong>{form.lignes.filter((ligne) => ligne.produit_id).length} ligne{form.lignes.filter((ligne) => ligne.produit_id).length > 1 ? 's' : ''}</strong>
        </div>
        <LineEditor lignes={form.lignes} setLignes={(lignes) => setForm({ ...form, lignes })} produits={produits} />
      </section>
      <aside className="quote-summary">
        <div><span>Sous-total HT</span><strong>{money(subtotal)}</strong></div>
        <div><span>TVA estimee</span><strong>{money(taxTotal)}</strong></div>
        <div className="quote-total"><span>Total TTC</span><strong>{money(totalTtc)}</strong></div>
      </aside>
      <button className="btn modal-submit">{submitLabel} <ArrowRight size={20} /></button>
    </div>
  );
}

function Clients({ api, notify, data, submit, searchQuery = '' }) {
  const emptyClientForm = { nom: '', postnom: '', telephone: '', email: '', mot_de_passe: '' };
  const [form, setForm] = useState(emptyClientForm);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const clients = data.clients
    .filter((c) => `${c.nom} ${c.postnom || ''} ${c.telephone || ''}`.toLowerCase().includes(term))
    .filter((c) => {
      if (statusFilter !== 'tous') return clientSegment(c) === statusFilter;
      return true;
    });
  const showHistory = async (client) => {
    try {
      const detail = await api(`/clients/${client.id_client}`);
      setHistory(detail.data);
    } catch (error) {
      notify(error.message);
    }
  };
  const saveEdit = () => submit(async () => {
    await api(`/clients/${editing.id_client}`, { method: 'PUT', body: JSON.stringify(editing) });
    setEditing(null);
    notify('Client mis a jour');
  });
  const remove = (client) => {
    if (!window.confirm(`Supprimer ${client.nom} ?`)) return;
    submit(async () => {
      await api(`/clients/${client.id_client}`, { method: 'DELETE' });
      notify('Client supprime');
    });
  };
  const closeCreate = () => {
    setForm(emptyClientForm);
    setCreating(false);
  };
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <h3>Portefeuille clients</h3>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un client" />
            <select className="compact-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="tous">Tous</option>
              <option value="prospect">Prospects - aucun achat</option>
              <option value="nouveau">Nouveaux clients</option>
              <option value="regulier">Clients reguliers</option>
              <option value="fidele">Clients fideles</option>
              <option value="vip">VIP</option>
            </select>
            <button className="btn secondary small" type="button" onClick={() => printTableDocument('Liste clients', ['Nom', 'Telephone', 'Statut', 'Achats', 'CA'], clients.map((c) => [`${c.nom} ${c.postnom || ''}`, c.telephone || '-', clientSegmentLabel(clientSegment(c)), c.nombre_achats || 0, moneySmart(c.ca_total)]), { badge: 'LISTE CLIENTS', tableTitle: 'Liste complete des clients', paper: 'page' })}><Printer size={16} /> Liste clients</button>
            <button className="btn small" type="button" onClick={() => { setForm(emptyClientForm); setCreating(true); }}><Plus size={16} /> Ajouter client</button>
          </div>
        </div>
        <Table headers={['Nom', 'Telephone', 'Statut', 'Achats', 'CA', 'Actions']} rows={clients.map((c) => [
          `${c.nom} ${c.postnom || ''}`,
          c.telephone || '-',
          <Badge>{clientSegmentLabel(clientSegment(c))}</Badge>,
          c.nombre_achats || 0,
          money(c.ca_total),
          <RowActions
            onEdit={() => setEditing(c)}
            onPrint={() => printDocument('Fiche client', [['Nom', `${c.nom} ${c.postnom || ''}`], ['Telephone', c.telephone || '-'], ['Statut', clientSegmentLabel(clientSegment(c))], ['Achats', c.nombre_achats || 0], ['CA', money(c.ca_total)]], { paper: 'page' })}
            onToggle={() => showHistory(c)}
            toggleLabel="Historique"
            onDelete={() => remove(c)}
          />
        ])} />
      </div>
      {creating && (
        <Modal title="Nouveau client" onClose={closeCreate}>
          <Form autoComplete="off" onSubmit={() => submit(async () => { await api('/clients', { method: 'POST', body: JSON.stringify(form) }); closeCreate(); notify('Client cree'); })}>
            <div className="form-row">
              <Input label="Nom" name="new_client_name" autoComplete="off" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
              <Input label="Postnom" name="new_client_postname" autoComplete="off" value={form.postnom} onChange={(postnom) => setForm({ ...form, postnom })} />
            </div>
            <Input label="Telephone" name="new_client_phone" autoComplete="off" value={form.telephone} onChange={(telephone) => setForm({ ...form, telephone })} />
            <div className="form-row">
              <Input label="Email de connexion client" name="new_client_email" autoComplete="off" data-lpignore="true" data-1p-ignore="true" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
              <Input label="Mot de passe initial" name="new_client_password" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" type="password" value={form.mot_de_passe} onChange={(mot_de_passe) => setForm({ ...form, mot_de_passe })} />
            </div>
            <button className="btn modal-submit">Enregistrer <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {history && (
        <Modal title={`Historique client - ${history.client?.nom || ''}`} onClose={() => setHistory(null)}>
          <Table headers={['Facture', 'Date', 'Montant', 'Paye', 'Reste']} rows={(history.historique || []).map((row) => [
            row.numero_facture,
            formatDate(row.date_vente),
            money(row.montant_ttc),
            money(row.total_paye),
            money(row.reste)
          ])} />
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier client" onClose={() => setEditing(null)}>
          <Form onSubmit={saveEdit}>
            <Input label="Nom" value={editing.nom || ''} onChange={(nom) => setEditing({ ...editing, nom })} required />
            <Input label="Postnom" value={editing.postnom || ''} onChange={(postnom) => setEditing({ ...editing, postnom })} />
            <Input label="Telephone" value={editing.telephone || ''} onChange={(telephone) => setEditing({ ...editing, telephone })} />
            <Input label="Email de connexion client" type="email" value={editing.email || ''} onChange={(email) => setEditing({ ...editing, email })} />
            <Input label="Nouveau mot de passe (laisser vide pour conserver)" type="password" value={editing.mot_de_passe || ''} onChange={(mot_de_passe) => setEditing({ ...editing, mot_de_passe })} />
            <button className="btn">Mettre a jour</button>
          </Form>
        </Modal>
      )}
    </div>
  );
}

function Produits({ api, notify, data, submit, user, searchQuery = '' }) {
  const unitOptions = [
    ['piece', 'Pieces'],
    ['kilogramme', 'Kilogrammes'],
    ['gramme', 'Grammes'],
    ['carton', 'Cartons'],
    ['sac', 'Sacs'],
    ['litre', 'Litres'],
    ['metre', 'Metres'],
    ['paquet', 'Paquets']
  ];
  const emptyProductForm = { reference_produit: '', nom: '', categorie_id: '', unite: 'piece', photo_url: '', prix_ht: '', prix_achat: '', taux_tva: '', quantite_stock: 0, seuil_alerte: 5 };
  const [form, setForm] = useState(emptyProductForm);
  const [stock, setStock] = useState({ id: '', fournisseur_id: '', quantite: 1, prix_achat: '', note: '' });
  const [creating, setCreating] = useState(false);
  const [stocking, setStocking] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [page, setPage] = useState(1);
  const categoryOptions = [['', 'Sans categorie'], ...data.categories.map((c) => [c.id_categorie, c.nom])];
  const canManageProducts = user?.role === 'magasinier';
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const visibleCategories = data.categories.length ? data.categories : [{ id_categorie: 'all', nom: 'Tous les produits' }];
  const produits = data.produits
    .filter((p) => `${p.reference_produit} ${p.nom} ${p.categorie_nom || ''}`.toLowerCase().includes(term))
    .filter((p) => statusFilter === 'tous' || p.statut_stock === statusFilter);
  const productsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(produits.length / productsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedProduits = produits.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  useEffect(() => {
    setPage(1);
  }, [term, statusFilter]);
  const saveEdit = () => submit(async () => {
    await api(`/produits/${editing.id_produit}`, { method: 'PUT', body: JSON.stringify(editing) });
    setEditing(null);
    notify('Produit mis a jour');
  });
  const closeCreate = () => {
    setForm(emptyProductForm);
    setCreating(false);
  };
  const closeStocking = () => {
    setStock({ id: '', fournisseur_id: '', quantite: 1, prix_achat: '', note: '' });
    setStocking(false);
  };
  const remove = (produit) => {
    if (!window.confirm(`Supprimer ${produit.nom} ?`)) return;
    submit(async () => {
      await api(`/produits/${produit.id_produit}`, { method: 'DELETE' });
      notify('Produit supprime');
    });
  };
  return (
    <>
      <div className="panel product-market">
        <div className="panel-heading product-toolbar product-market-heading">
          <div>
            <h3>Produits</h3>
          </div>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher produit ou categorie" />
            <select className="compact-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="tous">Tous les statuts</option>
              <option value="OK">OK</option>
              <option value="ALERTE">Alerte</option>
              <option value="RUPTURE">Rupture</option>
            </select>
            {canManageProducts && <button className="btn small" type="button" onClick={() => { setForm(emptyProductForm); setCreating(true); }}><Plus size={16} /> Ajouter produit</button>}
            {canManageProducts && <button className="btn secondary small" type="button" onClick={() => { setStock({ id: '', fournisseur_id: '', quantite: 1, prix_achat: '', note: '' }); setStocking(true); }}><Package size={16} /> Approvisionnement</button>}
          </div>
        </div>
        <div className="product-market-layout">
          <aside className="category-market-nav">
            <strong>Categories</strong>
            {visibleCategories.map((c) => <span key={c.id_categorie}>{c.nom}</span>)}
          </aside>
          <div className="category-rank-zone">
            <div className="category-rank-header">
              <h4>Produits populaires</h4>
              <span>Page {currentPage} sur {totalPages}</span>
            </div>
            <div className="product-rank-list">
              {paginatedProduits.map((p, index) => (
                <article className="product-rank-card" key={p.id_produit}>
                  <b>#{(currentPage - 1) * productsPerPage + index + 1}</b>
                  <div className="product-rank-visual">
                    <img src={productPhotoUrl(p, index)} alt="" />
                  </div>
                  <strong>{p.nom}</strong>
                  <p>{p.categorie_nom || 'Sans categorie'} - Ref. {p.reference_produit}</p>
                  <div className="product-rank-meta">
                    <span>{moneySmart(priceWithTax(p))}</span>
                    <Badge>{p.statut_stock}</Badge>
                    <small>{taxText(p)}</small>
                    <em>Stock {p.quantite_stock} {p.unite || 'piece'}</em>
                  </div>
                  <div className="actions">
                    {canManageProducts && <button className="action edit" type="button" title="Modifier" onClick={() => setEditing(p)}><Edit3 size={17} /></button>}
                    <button className="action print-action" type="button" title="Imprimer" onClick={() => printDocument('Fiche stock produit', [['Reference', p.reference_produit], ['Produit', p.nom], ['Prix catalogue', moneySmart(priceWithTax(p))], ['TVA', taxText(p)], ['Stock', p.quantite_stock], ['Statut', p.statut_stock]], { paper: 'page' })}><Printer size={17} /></button>
                    {canManageProducts && <button className="action delete" type="button" title="Supprimer" onClick={() => remove(p)}><Trash2 size={17} /></button>}
                  </div>
                </article>
              ))}
            </div>
            <div className="product-pagination">
              <button className="btn secondary small" type="button" onClick={() => { setPage((value) => Math.max(1, value - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={currentPage <= 1}>
                <ChevronLeft size={16} /> Precedent
              </button>
              <strong>{produits.length} produit{produits.length > 1 ? 's' : ''}</strong>
              <button className="btn secondary small" type="button" onClick={() => { setPage((value) => Math.min(totalPages, value + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={currentPage >= totalPages}>
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-heading">
          <h3>Mouvements stock</h3>
          <span className="panel-pill">Dernieres operations</span>
        </div>
        <Table headers={['Produit', 'Reference', 'Libelle', 'Type', 'Quantite', 'Date']} rows={(data.extra.mouvementsStock || []).map((m) => [
          m.produit_nom,
          m.reference_produit,
          m.note || `${m.type_mouvement === 'entree' ? 'Entree stock' : 'Sortie stock'} - ${m.produit_nom || 'Produit'}`,
          <Badge>{m.type_mouvement}</Badge>,
          m.quantite,
          formatDate(m.date_mouvement)
        ])} />
      </div>
      {creating && (
        <Modal title="Nouveau produit" onClose={closeCreate}>
          <Form onSubmit={() => submit(async () => { await api('/produits', { method: 'POST', body: JSON.stringify(form) }); closeCreate(); notify('Produit cree'); })}>
            <div className="form-row">
              <Input label="Designation" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
              <Select label="Categorie" value={form.categorie_id} onChange={(categorie_id) => setForm({ ...form, categorie_id })} options={categoryOptions} required={false} />
            </div>
            <div className="form-row">
              <Select label="Unite" value={form.unite} onChange={(unite) => setForm({ ...form, unite })} options={unitOptions} />
              <Input label="Prix d'achat unitaire (CMP)" type="number" step="0.01" value={form.prix_achat} onChange={(prix_achat) => setForm({ ...form, prix_achat })} placeholder="Prix d'achat initial" />
            </div>
            <PhotoInput label="URL de la photo du produit" value={form.photo_url} onChange={(photo_url) => setForm({ ...form, photo_url })} api={api} folder="products" notify={notify} />
            <div className="form-row">
              <Input label="Prix de vente" type="number" value={form.prix_ht} onChange={(prix_ht) => setForm({ ...form, prix_ht })} required />
              <Input label="TVA % (laisser vide si non facturée)" type="number" value={form.taux_tva} onChange={(taux_tva) => setForm({ ...form, taux_tva })} />
            </div>
            <div className="debt-preview">
              <span>Prix affiché au catalogue</span>
              <strong>{moneySmart(Number(form.prix_ht || 0) * (1 + taxRate(form.taux_tva) / 100))}</strong>
              <small>{hasTax(form.taux_tva) ? `TVA ${Number(form.taux_tva)}% incluse` : 'TVA non facturée'}</small>
            </div>
            <div className="form-row">
              <Input label="Stock initial" type="number" value={form.quantite_stock} onChange={(quantite_stock) => setForm({ ...form, quantite_stock })} />
              <Input label="Seuil alerte" type="number" value={form.seuil_alerte} onChange={(seuil_alerte) => setForm({ ...form, seuil_alerte })} />
            </div>
            <button className="btn modal-submit">Ajouter <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {stocking && (
        <Modal title="Approvisionnement" onClose={closeStocking}>
          <Form onSubmit={() => submit(async () => {
            await api(`/produits/${stock.id || data.produits[0]?.id_produit}/approvisionner`, { method: 'POST', body: JSON.stringify(stock) });
            closeStocking();
            notify('Stock mis a jour');
          })}>
            <Select label="Produit" value={stock.id} onChange={(id) => setStock({ ...stock, id })} options={data.produits.map((p) => [p.id_produit, p.nom])} />
            <Select label="Fournisseur" value={stock.fournisseur_id} onChange={(fournisseur_id) => setStock({ ...stock, fournisseur_id })} options={data.fournisseurs.map((f) => [f.id_fournisseur, f.nom])} />
            <Input label={`Quantite (${data.produits.find((p) => p.id_produit === stock.id)?.unite || 'unite'})`} type="number" value={stock.quantite} onChange={(quantite) => setStock({ ...stock, quantite })} required />
            <Input label="Prix d'achat unitaire" type="number" step="0.01" value={stock.prix_achat} onChange={(prix_achat) => setStock({ ...stock, prix_achat })} required />
            <div className="debt-preview">
              <span>Prix total achat</span>
              <strong>{moneySmart(Number(stock.quantite || 0) * Number(stock.prix_achat || 0))}</strong>
            </div>
            <Input label="Note" value={stock.note} onChange={(note) => setStock({ ...stock, note })} />
            <button className="btn modal-submit">Mettre a jour le stock <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier produit" onClose={() => setEditing(null)}>
          <Form onSubmit={saveEdit}>
            <Input label="Designation" value={editing.nom || ''} onChange={(nom) => setEditing({ ...editing, nom })} required />
            <div className="form-row">
              <Select label="Categorie" value={editing.categorie_id || ''} onChange={(categorie_id) => setEditing({ ...editing, categorie_id })} options={categoryOptions} required={false} />
              <Select label="Unite" value={editing.unite || 'piece'} onChange={(unite) => setEditing({ ...editing, unite })} options={unitOptions} />
            </div>
            <PhotoInput label="URL de la photo du produit" value={editing.photo_url || ''} onChange={(photo_url) => setEditing({ ...editing, photo_url })} api={api} folder="products" notify={notify} />
            <div className="form-row">
              <Input label="Prix d'achat (CMP)" type="number" step="0.01" value={editing.prix_achat || ''} onChange={(prix_achat) => setEditing({ ...editing, prix_achat })} />
              <Input label="Prix de vente" type="number" value={editing.prix_ht || ''} onChange={(prix_ht) => setEditing({ ...editing, prix_ht })} required />
            </div>
            <div className="form-row">
              <Input label="TVA % (laisser vide si non facturée)" type="number" value={editing.taux_tva ?? ''} onChange={(taux_tva) => setEditing({ ...editing, taux_tva })} />
              <Input label="Seuil alerte" type="number" value={editing.seuil_alerte || 5} onChange={(seuil_alerte) => setEditing({ ...editing, seuil_alerte })} />
            </div>
            <div className="debt-preview">
              <span>Prix affiché au catalogue</span>
              <strong>{moneySmart(priceWithTax(editing))}</strong>
              <small>{taxText(editing)}</small>
            </div>
            <button className="btn">Mettre a jour</button>
          </Form>
        </Modal>
      )}
    </>
  );
}

function Ventes({ api, notify, data, submit, searchQuery = '', user }) {
  const emptyLine = () => ({ produit_id: '', quantite: 1 });
  const emptySaleForm = () => ({ client_id: '', lignes: [emptyLine()] });
  const [form, setForm] = useState(emptySaleForm);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const invoiceStatus = (vente) => {
    const reste = Number(vente.reste_a_payer || 0);
    const total = Number(vente.montant_ttc || 0);
    if (reste <= 0) return 'paye';
    if (reste < total) return 'partiel';
    return 'impaye';
  };
  const ventesList = data.ventes
    .filter((v) => `${v.numero_facture} ${v.client_nom || ''} ${v.montant_ttc || ''} ${invoiceStatus(v)}`.toLowerCase().includes(term))
    .filter((v) => statusFilter === 'tous' || invoiceStatus(v) === statusFilter);
  const startEdit = async (vente) => {
    const detail = await api(`/ventes/${vente.id_ventes}`);
    setEditing({
      ...vente,
      client_id: detail.data.client_id,
      lignes: detail.data.lignes?.length ? detail.data.lignes.map((l) => ({ produit_id: l.produit_id, quantite: l.quantite, prix: l.prix_unitaire_ht })) : [emptyLine()]
    });
  };
  const saveEdit = () => submit(async () => {
    const articles = editing.lignes.filter((ligne) => ligne.produit_id).map((ligne) => ({ produit_id: ligne.produit_id, quantite: Math.max(1, Number(ligne.quantite || 1)), prix: Number(ligne.prix || 0) }));
    if (articles.length === 0) {
      notify('Selectionnez au moins un produit.');
      return;
    }
    await api(`/ventes/${editing.id_ventes}`, {
      method: 'PUT',
      body: JSON.stringify({
        client_id: editing.client_id,
        articles
      })
    });
    setEditing(null);
    notify('Facture mise a jour');
  });
  const remove = (vente) => {
    if (!window.confirm(`Supprimer la facture ${vente.numero_facture} ?`)) return;
    submit(async () => {
      await api(`/ventes/${vente.id_ventes}`, { method: 'DELETE' });
      notify('Facture supprimee');
    });
  };
  const closeCreate = () => {
    setForm(emptySaleForm());
    setCreating(false);
  };
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <h3>Ventes</h3>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher facture ou client" />
            <select className="compact-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="tous">Tous</option>
              <option value="paye">Payees</option>
              <option value="partiel">Partielles</option>
              <option value="impaye">Impayees</option>
            </select>
            {user?.role === 'vendeur' && <button className="btn small" type="button" onClick={() => { setForm(emptySaleForm()); setCreating(true); }}><Plus size={16} /> Nouvelle facture</button>}
          </div>
        </div>
        <Table headers={['Facture', 'Client', 'Montant', 'Paye', 'Reste', 'Actions']} rows={ventesList.map((v) => [
          v.numero_facture,
          v.client_nom,
          money(v.montant_ttc),
          money(v.total_paye),
          money(v.reste_a_payer),
          <RowActions
            onEdit={user?.role === 'vendeur' ? () => startEdit(v) : null}
            onPrint={() => printDocument('Facture', [['Facture', v.numero_facture], ['Client', v.client_nom], ['Montant', money(v.montant_ttc)], ['Paye', money(v.total_paye)], ['Reste', money(v.reste_a_payer)]], { paper: 'page' })}
            onDelete={user?.role === 'vendeur' ? () => remove(v) : null}
          />
        ])} />
      </div>
      {creating && (
        <Modal title="Vente directe" onClose={closeCreate} className="quote-modal">
          <Form onSubmit={() => submit(async () => {
            const articles = form.lignes.filter((ligne) => ligne.produit_id).map((ligne) => ({ produit_id: ligne.produit_id, quantite: Math.max(1, Number(ligne.quantite || 1)), prix: Number(ligne.prix || 0) }));
            if (articles.length === 0) {
              notify('Selectionnez au moins un produit.');
              return;
            }
            await api('/ventes', { method: 'POST', body: JSON.stringify({ client_id: form.client_id || data.clients[0]?.id_client, articles }) });
            closeCreate();
            notify('Facture creee');
          })}>
            <SearchableSelect label="Client" value={form.client_id} onChange={(client_id) => setForm({ ...form, client_id })} options={data.clients.map((c) => [c.id_client, `${c.nom} ${c.postnom || ''} ${c.telephone || ''}`])} placeholder="Rechercher client, postnom ou telephone" />
            <LineEditor lignes={form.lignes} setLignes={(lignes) => setForm({ ...form, lignes })} produits={data.produits} />
            <button className="btn modal-submit">Facturer <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier facture" onClose={() => setEditing(null)} className="quote-modal">
          <Form onSubmit={saveEdit}>
            <SearchableSelect label="Client" value={editing.client_id} onChange={(client_id) => setEditing({ ...editing, client_id })} options={data.clients.map((c) => [c.id_client, `${c.nom} ${c.postnom || ''} ${c.telephone || ''}`])} placeholder="Rechercher client, postnom ou telephone" />
            <LineEditor lignes={editing.lignes} setLignes={(lignes) => setEditing({ ...editing, lignes })} produits={data.produits} />
            <button className="btn">Mettre a jour</button>
          </Form>
        </Modal>
      )}
    </div>
  );
}

function Paiements({ api, notify, data, submit, searchQuery = '', user }) {
  const factures = data.ventes.filter((v) => Number(v.reste_a_payer) > 0);
  const emptyPaymentForm = { vente_id: '', montant: '', mode_paiement: 'especes', reference_externe: '', telephone_payeur: '' };
  const [form, setForm] = useState(emptyPaymentForm);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [period, setPeriod] = useState('journalier');
  const [dateRange, setDateRange] = useState({ debut: '', fin: '' });
  const filteredFactures = factures.filter((v) => `${v.numero_facture} ${v.client_nom || ''} ${v.reste_a_payer || ''}`.toLowerCase().includes(invoiceQuery.toLowerCase()));
  const selectedFacture = filteredFactures.find((v) => v.id_ventes === (form.vente_id || filteredFactures[0]?.id_ventes)) || factures.find((v) => v.id_ventes === form.vente_id);
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const byPeriod = (rows) => {
    if (period !== 'personnalise') return filterRowsByPeriod(rows, period, ['Date']);
    if (!dateRange.debut && !dateRange.fin) return rows;
    const start = dateRange.debut ? new Date(`${dateRange.debut}T00:00:00`) : null;
    const end = dateRange.fin ? new Date(`${dateRange.fin}T23:59:59`) : null;
    return rows.filter((row) => {
      const date = new Date(row.Date);
      if (Number.isNaN(date.getTime())) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  };
  const periodText = period === 'personnalise'
    ? `${dateRange.debut || 'debut'} au ${dateRange.fin || 'fin'}`
    : periodLabel(period);
  const paymentRows = (() => {
    const rows = data.extra.paiements || [];
    const filteredByPeriod = period === 'personnalise'
      ? rows.filter((row) => {
          const date = new Date(String(row.date_paiement || '').replace(' ', 'T'));
          const start = dateRange.debut ? new Date(`${dateRange.debut}T00:00:00`) : null;
          const end = dateRange.fin ? new Date(`${dateRange.fin}T23:59:59`) : null;
          return !Number.isNaN(date.getTime()) && (!start || date >= start) && (!end || date <= end);
        })
      : filterRowsByPeriod(rows, period, ['date_paiement']);
    return filteredByPeriod.filter((row) => `${row.id_paiement} ${row.numero_facture || ''} ${row.client_nom || ''} ${row.mode_paiement || ''} ${row.reference_externe || ''} ${row.montant || ''}`.toLowerCase().includes(term));
  })();
  const caisseTotal = paymentRows.reduce((sum, row) => sum + Number(row.montant || 0), 0);
  const transactionsTotal = paymentRows.length;
  const savePayment = () => {
    submit(async () => {
      await api('/paiements', {
        method: 'POST',
        body: JSON.stringify({ ...form, mode_paiement: 'especes', vente_id: form.vente_id || filteredFactures[0]?.id_ventes || factures[0]?.id_ventes })
      });
      closeCreate();
      notify('Paiement enregistre');
    });
  };
  const closeCreate = () => {
    setForm(emptyPaymentForm);
    setInvoiceQuery('');
    setCreating(false);
  };
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <div>
            <h3>{period === 'journalier' ? 'Paiements du jour' : `Paiements - ${periodText.toLowerCase()}`}</h3>
            <p>{transactionsTotal} transaction{transactionsTotal > 1 ? 's' : ''} - {moneySmart(caisseTotal)}</p>
          </div>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher paiement" />
            <select className="compact-filter" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="journalier">Aujourd'hui</option>
              <option value="hebdomadaire">Cette semaine</option>
              <option value="mensuel">Ce mois</option>
              <option value="personnalise">Du ... au ...</option>
            </select>
            {period === 'personnalise' && (
              <>
                <input className="date-filter" type="date" value={dateRange.debut} onChange={(event) => setDateRange({ ...dateRange, debut: event.target.value })} />
                <input className="date-filter" type="date" value={dateRange.fin} onChange={(event) => setDateRange({ ...dateRange, fin: event.target.value })} />
              </>
            )}
            {user?.role === 'vendeur' && <button className="btn small" type="button" onClick={() => { setForm(emptyPaymentForm); setInvoiceQuery(''); setCreating(true); }}><Plus size={16} /> Nouveau paiement</button>}
          </div>
        </div>
        <Table headers={['Reference', 'Date', 'Facture', 'Client', 'Mode', 'Montant']} rows={paymentRows.map((r) => [
          r.id_paiement,
          formatDate(r.date_paiement),
          r.numero_facture || r.id_ventes || '-',
          r.client_nom || '-',
          ({ especes: 'Especes', carte: 'Carte', mobile_money: 'Mobile Money', stripe: 'Carte' }[String(r.mode_paiement || '').toLowerCase()] || r.mode_paiement),
          money(r.montant)
        ])} />
      </div>
      {creating && (
        <Modal title="Encaisser un paiement" onClose={closeCreate}>
          <Form onSubmit={savePayment}>
            <SearchInput value={invoiceQuery} onChange={setInvoiceQuery} placeholder="Rechercher une facture ou un client" />
            <Select label="Facture" value={form.vente_id} onChange={(vente_id) => setForm({ ...form, vente_id })} options={filteredFactures.map((v) => [v.id_ventes, `${v.numero_facture} - ${v.client_nom} - reste ${money(v.reste_a_payer)}`])} />
            <div className="form-row">
              <Input label="Montant" type="number" value={form.montant} onChange={(montant) => setForm({ ...form, montant })} required />
              <Select label="Mode" value="especes" onChange={() => {}} options={[['especes', 'Especes']]} />
            </div>
            {selectedFacture && (
              <div className="debt-preview">
                <span>Client debiteur</span>
                <strong>{selectedFacture.client_nom}</strong>
                <em>Reste a payer: {money(selectedFacture.reste_a_payer)}</em>
              </div>
            )}
            <button className="btn modal-submit">Enregistrer paiement <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
    </div>
  );
}

function periodLabel(period) {
  return {
    journalier: 'Journalier',
    hebdomadaire: 'Hebdomadaire',
    mensuel: 'Mensuel',
    annuel: 'Annuel'
  }[period] || 'Actuelle';
}

function getPeriodStart(period) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === 'hebdomadaire') {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
  }
  if (period === 'mensuel') {
    start.setDate(1);
  }
  if (period === 'annuel') {
    start.setMonth(0, 1);
  }
  return start;
}

function filterRowsByPeriod(rows, period, dateKeys = ['date_vente']) {
  const start = getPeriodStart(period);
  const end = new Date();
  return rows.filter((row) => {
    const rawDate = dateKeys.map((key) => row[key]).find(Boolean);
    if (!rawDate) return false;
    const date = new Date(typeof rawDate === 'string' ? rawDate.replace(' ', 'T') : rawDate);
    return !Number.isNaN(date.getTime()) && date >= start && date <= end;
  });
}

function Rapports({ data, searchQuery = '', user }) {
  const source = data.extra;
  const term = searchQuery.trim().toLowerCase();
  const [period, setPeriod] = useState('mensuel');
  const [dateRange, setDateRange] = useState({ debut: '', fin: '' });
  const [showArchives, setShowArchives] = useState(false);
  const role = user?.role || 'manager';
  const canSalesReports = ['manager', 'vendeur'].includes(role);
  const canStockReports = ['manager', 'magasinier'].includes(role);
  const canCashReports = ['manager', 'vendeur'].includes(role);
  const byPeriod = (rows, keys) => {
    if (period !== 'personnalise') return filterRowsByPeriod(rows, period, keys);
    if (!dateRange.debut && !dateRange.fin) return rows;
    const start = dateRange.debut ? new Date(`${dateRange.debut}T00:00:00`) : null;
    const end = dateRange.fin ? new Date(`${dateRange.fin}T23:59:59`) : null;
    return rows.filter((row) => {
      const rawDate = (keys || ['date_vente', 'date_paiement', 'Date', 'derniere_visite', 'date_operation']).map((key) => row[key]).find(Boolean);
      if (!rawDate) return false;
      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  };
  const periodText = period === 'personnalise'
    ? `${dateRange.debut || 'debut'} au ${dateRange.fin || 'fin'}`
    : periodLabel(period);
  const factures = byPeriod(source.factures || [])
    .filter((r) => !term || `${r.numero_facture} ${r.client_nom || ''} ${r.client_postnom || ''}`.toLowerCase().includes(term));
  const creances = byPeriod(source.creances || [])
    .filter((r) => !term || `${r.numero_facture} ${r.client_nom || ''}`.toLowerCase().includes(term));
  const stock = (source.stock || []).filter((r) => !term || `${r.nom} ${r.statut || ''}`.toLowerCase().includes(term));
  const top = byPeriod(source.top || [], ['derniere_visite'])
    .filter((r) => !term || `${r.nom} ${r.postnom || ''}`.toLowerCase().includes(term));
  const caisse = byPeriod(source.caisse || [], ['Date']).filter((r) => !term || `${r.Date} ${r.Mode_Paiement} ${r.Total_Encaisse}`.toLowerCase().includes(term));
  const journal = byPeriod(source.journal || [], ['date_operation']).filter((r) => !term || `${r.reference} ${r.libelle || ''} ${r.type_operation || ''}`.toLowerCase().includes(term));
  const livreCaisse = byPeriod(source.livreCaisse || [], ['date_paiement'])
    .filter((r) => String(r.mode_paiement || '').toLowerCase() === 'especes')
    .filter((r) => !term || `${r.numero_facture} ${r.client_nom || ''} ${r.mode_paiement || ''}`.toLowerCase().includes(term));
  const mouvementsStock = byPeriod(source.mouvementsStock || [], ['date_mouvement'])
    .filter((r) => !term || `${r.produit_nom || ''} ${r.reference_produit || ''} ${r.type_mouvement || ''} ${r.fournisseur_nom || ''}`.toLowerCase().includes(term));
  const archives = (source.archives || []).filter((r) => !term || `${r.titre || ''} ${r.type_document || ''} ${r.description || ''}`.toLowerCase().includes(term));
  const stockValue = stock.reduce((sum, row) => sum + Number(row.valeur_stock_achat || 0), 0);
  const stockRisks = stock.filter((row) => String(row.statut || '').toUpperCase() !== 'OK').length;
  const reportTitle = role === 'magasinier' ? 'Rapports produits' : role === 'vendeur' ? 'Rapports caisse' : 'Rapports';
  const printRows = (title, headers, rows) => {
    printTableDocument(title, headers, rows, {
      badge: periodText.toUpperCase(),
      period: periodText,
      tableTitle: 'Details commerciaux'
    });
  };
  return (
    <div className="grid report-page">
      <div className="panel report-period-panel">
        <div className="panel-heading">
          <div>
            <h3>{reportTitle}</h3>
            <p>Donnees consolidees pour la periode {periodText.toLowerCase()}.</p>
          </div>
          <div className="actions">
            {role === 'manager' && <button className="btn secondary small" type="button" onClick={() => setShowArchives(true)}><Archive size={16} /> Archivage</button>}
            <select className="compact-filter" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="journalier">Journalier</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuel</option>
              <option value="annuel">Annuel</option>
              <option value="personnalise">Du ... au ...</option>
            </select>
            {period === 'personnalise' && (
              <>
                <input className="date-filter" type="date" value={dateRange.debut} onChange={(event) => setDateRange({ ...dateRange, debut: event.target.value })} />
                <input className="date-filter" type="date" value={dateRange.fin} onChange={(event) => setDateRange({ ...dateRange, fin: event.target.value })} />
              </>
            )}
          </div>
        </div>
        <div className="report-cards">
          <Stat label="Periode" value={periodText} />
          {canSalesReports && <Stat label="Factures" value={factures.length} />}
          {canSalesReports && <Stat label="Dettes clients" value={creances.length} />}
          {canCashReports && <Stat label="Lignes caisse" value={caisse.length} />}
          {canStockReports && <Stat label="Produits en stock" value={stock.length} />}
          {canStockReports && <Stat label="Valeur stock (Achat)" value={moneySmart(stockValue)} />}
          {canStockReports && <Stat label="A surveiller" value={stockRisks} />}
        </div>
      </div>
      {showArchives && (
        <Modal title="Archivage documentaire" onClose={() => setShowArchives(false)} className="archive-modal">
          <div className="archive-list">
            {archives.length ? archives.map((item) => (
              <article key={item.id_document} className="archive-card">
                <div>
                  <strong>{item.titre}</strong>
                  <span>{item.type_document || 'document'} • {formatDate(item.created_at)}</span>
                  {item.description && <p>{item.description}</p>}
                  <small>Ajoute par {item.uploaded_by_name || item.uploaded_by || '-'}</small>
                </div>
                <a className="btn secondary small" href={item.file_url} target="_blank" rel="noreferrer">Ouvrir</a>
              </article>
            )) : <div className="empty large">Aucun document archive pour le moment.</div>}
          </div>
        </Modal>
      )}
      {canSalesReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Dettes clients</h3><button className="btn print" onClick={() => printRows(`Dettes clients - ${periodText}`, ['Facture', 'Libelle', 'Client', 'Du', 'Paye', 'Reste'], creances.map((r) => [r.numero_facture, `Dette client - ${r.numero_facture}`, r.client_nom, moneySmart(r.montant_du), moneySmart(r.montant_paye), moneySmart(r.reste_a_payer)]))}><Printer size={18} /> Imprimer</button></div><Table headers={['Facture', 'Libelle', 'Client', 'Du', 'Paye', 'Reste']} rows={creances.map((r) => [r.numero_facture, `Dette client - ${r.numero_facture}`, r.client_nom, moneySmart(r.montant_du), moneySmart(r.montant_paye), moneySmart(r.reste_a_payer)])} /></div>}
      {canSalesReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Ventes</h3><button className="btn print" onClick={() => printRows('Ventes', ['Facture', 'Libelle', 'Client', 'Montant', 'Reste'], factures.map((r) => [r.numero_facture, `Vente facturee - ${r.numero_facture}`, `${r.client_nom} ${r.client_postnom || ''}`, moneySmart(r.montant_ttc), moneySmart(r.reste_a_payer)]))}><Printer size={18} /> Imprimer</button></div><Table headers={['Facture', 'Libelle', 'Client', 'Montant', 'Reste']} rows={factures.map((r) => [r.numero_facture, `Vente facturee - ${r.numero_facture}`, `${r.client_nom} ${r.client_postnom || ''}`, moneySmart(r.montant_ttc), moneySmart(r.reste_a_payer)])} /></div>}
      {canCashReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Livre de caisse</h3><button className="btn print" onClick={() => printRows(`Livre de caisse - ${periodText}`, ['Date', 'Libelle', 'Facture', 'Client', 'Mode', 'Montant'], livreCaisse.map((r) => [formatDate(r.date_paiement), `Paiement ${r.mode_paiement} - ${r.numero_facture}`, r.numero_facture, r.client_nom, r.mode_paiement, moneySmart(r.montant)]))}><Printer size={18} /> Imprimer</button></div><Table headers={['Date', 'Libelle', 'Facture', 'Client', 'Mode', 'Montant']} rows={livreCaisse.map((r) => [formatDate(r.date_paiement), `Paiement ${r.mode_paiement} - ${r.numero_facture}`, r.numero_facture, r.client_nom, r.mode_paiement, moneySmart(r.montant)])} /></div>}
      {canSalesReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Journal</h3><button className="btn print" onClick={() => printRows(`Journal - ${periodText}`, ['Date', 'Reference', 'Libelle', 'Entree', 'Sortie'], journal.map((r) => [formatDate(r.date_operation), r.reference, r.libelle, moneySmart(r.entree), moneySmart(r.sortie)]))}><Printer size={18} /> Imprimer</button></div><Table headers={['Date', 'Reference', 'Libelle', 'Entree', 'Sortie']} rows={journal.map((r) => [formatDate(r.date_operation), r.reference, r.libelle, moneySmart(r.entree), moneySmart(r.sortie)])} /></div>}
      <div className="grid report-detail-grid">
        {canStockReports && <div className="panel report-table-panel inventory-panel">
          <div className="panel-heading">
            <h3>Inventaire</h3>
            <button className="btn print" onClick={() => printTableDocument('Fiche de stock', ['Produit', 'Libelle', 'Stock', 'Entrees', 'Sorties', 'Derniere entree', 'P. Achat (CMP)', 'Valeur (Achat)', 'Statut'], stock.map((r) => [r.nom, `${r.reference_produit || 'Sans reference'} - ${r.categorie_nom || 'Sans categorie'}`, `${r.quantite_stock} ${r.unite || ''}`, r.total_entrees || 0, r.total_sorties || 0, r.derniere_entree ? formatDate(r.derniere_entree) : '-', moneySmart(r.prix_achat_moyen), moneySmart(r.valeur_stock_achat), r.statut]), { badge: 'INVENTAIRE', period: 'Inventaire courant', tableTitle: 'Etat du stock detaille' })}><Printer size={18} /> Imprimer</button>
          </div>
          <Table headers={['Produit', 'Libelle', 'Stock', 'Entrees', 'Sorties', 'Derniere entree', 'P. Achat (CMP)', 'Valeur (Achat)', 'Statut']} rows={stock.map((r) => [r.nom, `${r.reference_produit || 'Sans reference'} - ${r.categorie_nom || 'Sans categorie'}`, `${r.quantite_stock} ${r.unite || ''}`, r.total_entrees || 0, r.total_sorties || 0, r.derniere_entree ? formatDate(r.derniere_entree) : '-', moneySmart(r.prix_achat_moyen), moneySmart(r.valeur_stock_achat), <Badge>{r.statut}</Badge>])} />
        </div>}
        {canStockReports && <div className="panel report-table-panel stock-movement-panel">
          <div className="panel-heading">
            <h3>Etat des mouvements stock</h3>
            <button className="btn print" onClick={() => printRows(`Mouvements stock - ${periodText}`, ['Date', 'Libelle', 'Produit', 'Type', 'Qte', 'PU achat', 'Total achat', 'Fournisseur'], mouvementsStock.map((r) => [formatDate(r.date_mouvement), r.note || `${r.type_mouvement === 'entree' ? 'Entree stock' : 'Sortie stock'} - ${r.produit_nom || 'Produit'}`, r.produit_nom, r.type_mouvement === 'entree' ? 'Entree' : 'Sortie', r.quantite, moneySmart(r.prix_achat_unitaire), moneySmart(r.prix_achat_total), r.fournisseur_nom || '-']))}><Printer size={18} /> Imprimer</button>
          </div>
          <Table headers={['Date', 'Libelle', 'Produit', 'Type', 'Qte', 'PU achat', 'Total achat', 'Fournisseur']} rows={mouvementsStock.map((r) => [formatDate(r.date_mouvement), r.note || `${r.type_mouvement === 'entree' ? 'Entree stock' : 'Sortie stock'} - ${r.produit_nom || 'Produit'}`, r.produit_nom, <Badge>{r.type_mouvement === 'entree' ? 'Entree' : 'Sortie'}</Badge>, r.quantite, r.prix_achat_unitaire !== null && r.prix_achat_unitaire !== undefined ? moneySmart(r.prix_achat_unitaire) : '-', r.prix_achat_total !== null && r.prix_achat_total !== undefined ? moneySmart(r.prix_achat_total) : '-', r.fournisseur_nom || '-'])} />
        </div>}
        {canSalesReports && <div className="panel top-clients-report-wide">
          <div className="panel-heading">
            <h3>Top clients</h3>
            <button className="btn print" onClick={() => printRows(`Top clients - ${period}`, ['Client', 'Achats', 'CA'], top.map((r) => [`${r.nom} ${r.postnom || ''}`, r.nombre_achats, money(r.ca_total)]))}><Printer size={18} /> Imprimer</button>
          </div>
          <Table headers={['Client', 'Achats', 'CA']} rows={top.map((r) => [`${r.nom} ${r.postnom || ''}`, r.nombre_achats, money(r.ca_total)])} />
        </div>}
      </div>
    </div>
  );
}

function Utilisateurs({ api, notify, data, submit, user, searchQuery = '' }) {
  const emptyUserForm = { nom: '', email: '', role: 'vendeur' };
  const [form, setForm] = useState(emptyUserForm);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('tous');
  const roles = [['manager', 'Manager'], ['vendeur', 'Vendeur'], ['magasinier', 'Magasinier']];
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const users = (data.extra.utilisateurs || [])
    .filter((u) => `${u.nom} ${u.email} ${u.role}`.toLowerCase().includes(term))
    .filter((u) => roleFilter === 'tous' || u.role === roleFilter);
  const currentUserId = user?.id || user?.id_utilisateur;
  const canDeleteUser = (target) => target.id_utilisateur !== currentUserId && target.role !== 'manager';
  const moduleLabels = {
    clients: 'Clients',
    produits: 'Produits',
    categories: 'Categories',
    ventes: 'Ventes',
    paiements: 'Paiements',
    utilisateurs: 'Utilisateurs',
    auth: 'Compte',
    mail: 'Emails',
  };
  const formatLogDate = (value) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  };
  const openHistory = async (user) => {
    setHistoryUser(user);
    setHistoryLogs([]);
    setHistoryLoading(true);
    try {
      const result = await api(`/utilisateurs/${user.id_utilisateur}/historique`);
      setHistoryUser(result.data?.utilisateur || user);
      setHistoryLogs(result.data?.historique || []);
    } catch (error) {
      notify(error.message);
    } finally {
      setHistoryLoading(false);
    }
  };
  const printUserTraffic = () => {
    if (!historyUser) return;
    printLayout({
      title: `Trafic utilisateur - ${historyUser.nom}`,
      badge: historyUser.role,
      sections: [
        {
          title: 'Utilisateur',
          rows: [
            ['Nom', historyUser.nom],
            ['Email', historyUser.email],
            ['Role', historyUser.role],
            ['Statut', historyUser.actif ? 'Actif' : 'Suspendu']
          ]
        },
        {
          title: 'Controle',
          rows: [
            ['Actions', historyLogs.length],
            ['Date impression', new Date().toLocaleString('fr-FR')],
            ['Visibilite', "Admin uniquement"]
          ]
        }
      ],
      table: {
        title: 'Journal des actions',
        headers: ['Date et heure', 'Utilisateur', 'Action', 'Module', 'Reference'],
        rows: historyLogs.map((log) => [
          formatLogDate(log.created_at),
          `${log.user_name || historyUser.nom} (${log.user_role || historyUser.role})`,
          log.description,
          moduleLabels[log.module] || log.module || '-',
          log.entity_id || '-'
        ])
      },
      note: "Ce document reprend le trafic applicatif enregistre pour l'utilisateur selectionne.",
      paper: 'page',
      generatedLine: `Trafic imprime par ${user?.nom || user?.email || 'admin'}`
    });
  };
  const create = () => submit(async () => {
    await api('/utilisateurs', { method: 'POST', body: JSON.stringify(form) });
    closeCreate();
    notify('Utilisateur cree et email envoye');
  });
  const closeCreate = () => {
    setForm(emptyUserForm);
    setCreating(false);
  };
  const saveEdit = () => submit(async () => {
    await api(`/utilisateurs/${editing.id_utilisateur}`, { method: 'PUT', body: JSON.stringify(editing) });
    setEditing(null);
    notify('Utilisateur mis a jour');
  });
  const toggle = (user) => submit(async () => {
    const response = await api(`/utilisateurs/${user.id_utilisateur}/toggle`, { method: 'PUT', body: '{}' });
    notify(response.message || 'Statut modifie');
  });
  const remove = (user) => {
    if (!canDeleteUser(user)) {
      notify(user.id_utilisateur === currentUserId ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Un manager ne peut pas supprimer un autre manager');
      return;
    }
    if (!window.confirm(`Supprimer ${user.nom} ?`)) return;
    submit(async () => {
      await api(`/utilisateurs/${user.id_utilisateur}`, { method: 'DELETE' });
      notify('Utilisateur supprime');
    });
  };

  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <h3>Utilisateurs et clients</h3>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher utilisateur" />
            <select className="compact-filter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="tous">Tous les roles</option><option value="manager">Managers</option><option value="vendeur">Vendeurs</option><option value="magasinier">Magasiniers</option><option value="client">Clients</option></select>
            <button className="btn small" type="button" onClick={() => { setForm(emptyUserForm); setCreating(true); }}><Plus size={16} /> Nouvel utilisateur</button>
          </div>
        </div>
        <Table headers={['Nom', 'Email', 'Role', 'Statut', 'Actions']} rows={users.map((u) => [
          u.nom,
          u.email,
          u.role,
          <Badge>{u.actif ? 'actif' : 'suspendu'}</Badge>,
          <RowActions
            onEdit={u.role !== 'client' ? () => setEditing({ ...u, mot_de_passe: '' }) : null}
            onPrint={() => printDocument('Utilisateur', [['Nom', u.nom], ['Email', u.email], ['Role', u.role], ['Statut', u.actif ? 'actif' : 'suspendu']], { paper: 'page' })}
            onToggle={u.role !== 'client' ? () => openHistory(u) : null}
            toggleLabel="Vision et historique"
            onDelete={canDeleteUser(u) ? () => remove(u) : null}
          />
        ])} />
      </div>
      {creating && (
        <Modal title="Nouvel utilisateur" onClose={closeCreate}>
          <Form onSubmit={create}>
            <Input label="Nom" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
            <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required />
            <Select label="Role" value={form.role} onChange={(role) => setForm({ ...form, role })} options={roles} />
            <button className="btn modal-submit">Creer et notifier <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier utilisateur" onClose={() => setEditing(null)}>
          <Form onSubmit={saveEdit}>
            <Input label="Nom" value={editing.nom || ''} onChange={(nom) => setEditing({ ...editing, nom })} required />
            <Input label="Email" type="email" value={editing.email || ''} onChange={(email) => setEditing({ ...editing, email })} required />
            <Select label="Role" value={editing.role} onChange={(role) => setEditing({ ...editing, role })} options={roles} />
            <Input label="Nouveau mot de passe optionnel" type="password" value={editing.mot_de_passe || ''} onChange={(mot_de_passe) => setEditing({ ...editing, mot_de_passe })} />
            <button className="btn">Mettre a jour</button>
          </Form>
        </Modal>
      )}
      {historyUser && (
        <Modal title={`Vision utilisateur`} onClose={() => setHistoryUser(null)} className="user-history-modal">
          <div className="user-profile-card">
            <div className="user-profile-avatar">{getInitials(historyUser.nom || historyUser.email)}</div>
            <div className="user-profile-main">
              <span>Utilisateur</span>
              <strong>{historyUser.nom}</strong>
              <em>{historyUser.email}</em>
            </div>
            <div className="user-profile-meta">
              <span className="history-chip">{historyUser.role}</span>
              <span className={`history-chip ${historyUser.actif ? 'ok' : 'danger'}`}>{historyUser.actif ? 'Actif' : 'Suspendu'}</span>
            </div>
          </div>
          <div className="audit-history">
            <div className="panel-heading">
              <h3>Journal des actions</h3>
              <span className="panel-pill">Visible par l'admin</span>
            </div>
            {historyLoading ? (
              <div className="empty">Chargement de l'historique...</div>
            ) : (
              <Table headers={['Date et heure', 'Utilisateur', 'Action', 'Module', 'Reference']} rows={historyLogs.map((log) => [
                formatLogDate(log.created_at),
                `${log.user_name || historyUser.nom} (${log.user_role || historyUser.role})`,
                log.description,
                moduleLabels[log.module] || log.module || '-',
                log.entity_id || '-'
              ])} />
            )}
          </div>
          <div className="history-actions">
            <button className="btn secondary" type="button" onClick={printUserTraffic} disabled={historyLoading || !historyLogs.length}><Printer size={18} /> Imprimer trafic</button>
            <button className="btn" type="button" onClick={() => toggle(historyUser)}>Changer statut</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const auditFieldLabels = {
  body: 'Informations enregistrees',
  articles: 'Articles concernes',
  client_id: 'Client',
  produit_id: 'Produit',
  fournisseur_id: 'Fournisseur',
  quantite: 'Quantite',
  prix: 'Prix unitaire',
  prix_vente: 'Prix de vente',
  prix_achat: "Prix d'achat",
  montant: 'Montant',
  montant_ttc: 'Montant TTC',
  statut: 'Statut',
  nom: 'Nom',
  postnom: 'Postnom',
  telephone: 'Telephone',
  email: 'Adresse email',
  role: 'Role',
  before: 'Avant la modification',
  after: 'Apres la modification',
  avant: 'Avant la modification',
  apres: 'Apres la modification',
  note_client: 'Note du client'
};

const isEmptyAuditValue = (value) => value === null
  || value === undefined
  || value === ''
  || (Array.isArray(value) && value.length === 0)
  || (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);

function AuditMetadata({ metadata }) {
  let parsed = metadata;
  if (typeof metadata === 'string') {
    try { parsed = JSON.parse(metadata); } catch { parsed = { information: metadata }; }
  }
  const source = parsed?.body && typeof parsed.body === 'object' ? parsed.body : parsed;
  const labelFor = (key) => auditFieldLabels[key] || String(key).replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
  const valueFor = (key, value) => {
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (/prix|montant|total|cout/i.test(key) && !Number.isNaN(Number(value))) return `${Number(value).toLocaleString('fr-FR')} USD`;
    return String(value);
  };
  const renderEntry = (key, value, path) => {
    if (isEmptyAuditValue(value) || ['query', 'params'].includes(key)) return null;
    if (Array.isArray(value)) {
      return (
        <section className="audit-readable-group" key={path}>
          <h4>{labelFor(key)}</h4>
          <div className="audit-readable-list">
            {value.map((item, index) => (
              <article key={`${path}-${index}`}>
                <strong>{key === 'articles' ? `Article ${index + 1}` : `Element ${index + 1}`}</strong>
                {typeof item === 'object'
                  ? Object.entries(item).map(([childKey, childValue]) => renderEntry(childKey, childValue, `${path}-${index}-${childKey}`))
                  : <span>{String(item)}</span>}
              </article>
            ))}
          </div>
        </section>
      );
    }
    if (typeof value === 'object') {
      const children = Object.entries(value).map(([childKey, childValue]) => renderEntry(childKey, childValue, `${path}-${childKey}`)).filter(Boolean);
      if (!children.length) return null;
      return <section className="audit-readable-group" key={path}><h4>{labelFor(key)}</h4><div className="audit-readable-fields">{children}</div></section>;
    }
    return <div className="audit-readable-row" key={path}><span>{labelFor(key)}</span><strong>{valueFor(key, value)}</strong></div>;
  };
  const details = source && typeof source === 'object'
    ? Object.entries(source).map(([key, value]) => renderEntry(key, value, key)).filter(Boolean)
    : [];
  return details.length ? <div className="audit-readable">{details}</div> : <div className="audit-readable-empty">Aucune information complementaire pour cette action.</div>;
}

function AuditJournal({ data, searchQuery = '' }) {
  const [moduleFilter, setModuleFilter] = useState('tous');
  const [actionFilter, setActionFilter] = useState('tous');
  const [userFilter, setUserFilter] = useState('tous');
  const [selected, setSelected] = useState(null);
  const logs = (data.extra.auditLogs || []).filter((log) => ['manager', 'vendeur', 'magasinier'].includes(log.user_role));
  const moduleLabels = {
    clients: 'Clients',
    client: 'Clients',
    produits: 'Produits',
    categories: 'Categories',
    fournisseurs: 'Fournisseurs',
    ventes: 'Ventes',
    paiements: 'Paiements',
    commandes: 'Commandes',
    reclamations: 'Reclamations',
    utilisateurs: 'Utilisateurs',
    mail: 'Emails',
    archives: 'Archivage',
    chat: 'Chat',
    public: 'Accueil / Contact'
  };
  const actionLabels = {
    POST: 'Creation',
    PUT: 'Modification',
    PATCH: 'Modification',
    DELETE: 'Suppression'
  };
  const modules = Array.from(new Set(logs.map((log) => log.module).filter(Boolean))).sort();
  const actions = Array.from(new Set(logs.map((log) => log.action_type).filter(Boolean))).sort();
  const auditUserKey = (log) => String(log.user_id || `${log.user_name || 'inconnu'}|${log.user_role || 'role'}`);
  const users = Array.from(new Map(logs.map((log) => [
    auditUserKey(log),
    { key: auditUserKey(log), name: log.user_name || 'Utilisateur inconnu', role: log.user_role || '-' }
  ])).values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const term = searchQuery.trim().toLowerCase();
  const filtered = logs
    .filter((log) => userFilter === 'tous' || auditUserKey(log) === userFilter)
    .filter((log) => moduleFilter === 'tous' || log.module === moduleFilter)
    .filter((log) => actionFilter === 'tous' || log.action_type === actionFilter)
    .filter((log) => !term || `${log.user_name} ${log.user_role} ${log.description} ${log.module} ${log.entity_id}`.toLowerCase().includes(term));
  const printAllAudit = () => printTableDocument(
    'Journal d’audit',
    ['Date', 'Utilisateur', 'Role', 'Action', 'Module', 'Reference', 'Description'],
    logs.map((log) => [
      formatDate(log.created_at),
      log.user_name || '-',
      log.user_role || '-',
      actionLabels[log.action_type] || log.action_type,
      moduleLabels[log.module] || log.module || '-',
      log.entity_id || '-',
      log.description || '-'
    ])
  );
  const selectedAuditUser = users.find((item) => item.key === userFilter);
  const selectedUserLogs = userFilter === 'tous' ? [] : logs.filter((log) => auditUserKey(log) === userFilter);
  const printSelectedUserAudit = () => {
    if (!selectedAuditUser) return;
    printTableDocument(
      `Audit utilisateur - ${selectedAuditUser.name}`,
      ['Date', 'Utilisateur', 'Role', 'Action', 'Module', 'Reference', 'Description'],
      selectedUserLogs.map((log) => [
        formatDate(log.created_at),
        log.user_name || '-',
        log.user_role || '-',
        actionLabels[log.action_type] || log.action_type,
        moduleLabels[log.module] || log.module || '-',
        log.entity_id || '-',
        log.description || '-'
      ])
    );
  };

  return (
    <div className="grid audit-page">
      <section className="panel">
        <div className="panel-heading client-toolbar">
          <div>
            <h3>Journal d’audit</h3>
            <p>{filtered.length} action{filtered.length > 1 ? 's' : ''} affichee{filtered.length > 1 ? 's' : ''}</p>
          </div>
          <div className="actions">
            <select className="compact-filter" value={userFilter} onChange={(event) => setUserFilter(event.target.value)}>
              <option value="tous">Tous les utilisateurs</option>
              {users.map((auditUser) => <option key={auditUser.key} value={auditUser.key}>{auditUser.name} - {auditUser.role}</option>)}
            </select>
            <select className="compact-filter" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
              <option value="tous">Tous les modules</option>
              {modules.map((module) => <option key={module} value={module}>{moduleLabels[module] || module}</option>)}
            </select>
            <select className="compact-filter" value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
              <option value="tous">Toutes les actions</option>
              {actions.map((action) => <option key={action} value={action}>{actionLabels[action] || action}</option>)}
            </select>
            <button className="btn print small" type="button" onClick={printAllAudit} disabled={!logs.length}><Printer size={16} /> Toute la liste</button>
            <button className="btn secondary small" type="button" onClick={printSelectedUserAudit} disabled={!selectedUserLogs.length}><Printer size={16} /> Actions du user</button>
          </div>
        </div>
        <Table headers={['Date', 'Utilisateur', 'Role', 'Action', 'Module', 'Reference', 'Details']} rows={filtered.map((log) => [
          formatDate(log.created_at),
          log.user_name || '-',
          log.user_role || '-',
          <Badge>{actionLabels[log.action_type] || log.action_type}</Badge>,
          moduleLabels[log.module] || log.module || '-',
          log.entity_id || '-',
          <button className="btn small secondary" type="button" onClick={() => setSelected(log)}><Eye size={15} /> Voir</button>
        ])} />
      </section>
      <section className="panel audit-summary">
        <h3>Lecture rapide</h3>
        <div className="stats-row">
          <article><ShieldCheck /><span>Total actions</span><strong>{logs.length}</strong></article>
          <article><Plus /><span>Creations</span><strong>{logs.filter((log) => log.action_type === 'POST').length}</strong></article>
          <article><Edit3 /><span>Modifications</span><strong>{logs.filter((log) => ['PUT', 'PATCH'].includes(log.action_type)).length}</strong></article>
          <article><Trash2 /><span>Suppressions</span><strong>{logs.filter((log) => log.action_type === 'DELETE').length}</strong></article>
        </div>
        <p className="muted-note">Ouvrez une action pour consulter clairement les informations concernees. Les mots de passe, codes et images restent automatiquement masques.</p>
      </section>
      {selected && (
        <Modal title={`Action ${selected.id_log}`} onClose={() => setSelected(null)} className="audit-modal">
          <div className="audit-detail">
            <div className="debt-preview">
              <span>Utilisateur</span>
              <strong>{selected.user_name || '-'}</strong>
              <em>{selected.user_role || '-'}</em>
            </div>
            <div className="form-row">
              <div className="debt-preview"><span>Action</span><strong>{actionLabels[selected.action_type] || selected.action_type}</strong></div>
              <div className="debt-preview"><span>Module</span><strong>{moduleLabels[selected.module] || selected.module || '-'}</strong></div>
            </div>
            <div className="debt-preview"><span>Description</span><strong>{selected.description || '-'}</strong><em>{formatDate(selected.created_at)}</em></div>
            <div className="audit-readable-block">
              <h4>Informations concernees par cette action</h4>
              <AuditMetadata metadata={selected.metadata} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Mails({ api, notify, data, submit, user, searchQuery = '' }) {
  const status = data.extra.mailStatus || {};
  const emptyMailForm = { to: '', subject: '', message: '' };
  const [form, setForm] = useState(emptyMailForm);
  const [creating, setCreating] = useState(null);
  const [sending, setSending] = useState(false);
  const [mailFeedback, setMailFeedback] = useState(null);
  const term = searchQuery.trim().toLowerCase();
  const messages = (data.extra.mailMessages || []).filter((row) => `${row.to_email || ''} ${row.sender_email || ''} ${row.subject || ''} ${row.status || ''}`.toLowerCase().includes(term));
  const isTeamNotification = creating === 'team';
  const isClientsMail = creating === 'clients';

  const openComposer = (type) => {
    setForm(emptyMailForm);
    setMailFeedback(null);
    setCreating(type);
  };

  const closeComposer = () => {
    if (sending) return;
    setForm(emptyMailForm);
    setMailFeedback(null);
    setCreating(null);
  };

  const sendMessage = async () => {
    if (sending) return;
    setMailFeedback(null);
    setSending(true);
    try {
      let sentMessage = '';
      await submit(async () => {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 18000);
        let response;
        try {
          const endpoint = isTeamNotification ? '/mail/notify-team' : isClientsMail ? '/mail/send-clients' : '/mail/send';
          response = await api(endpoint, {
            method: 'POST',
            body: JSON.stringify(form),
            signal: controller.signal
          });
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error("L'envoi prend trop de temps. Verifiez la configuration email dans Render ou reessayez.");
          }
          throw error;
        } finally {
          window.clearTimeout(timer);
        }
        sentMessage = response.message || (isTeamNotification ? 'Notification equipe envoyee' : isClientsMail ? 'Email envoye aux clients' : 'Email envoye');
      });
      setForm(emptyMailForm);
      setCreating(null);
      notify(sentMessage);
    } catch (error) {
      const message = error.message || "Impossible d'envoyer l'email.";
      setMailFeedback({ type: 'error', message });
      notify(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <h3>Communications envoyees</h3>
          <div className="actions">
            <button className="btn secondary small" type="button" onClick={() => openComposer('team')}><Bell size={16} /> Message equipe</button>
            <button className="btn secondary small" type="button" onClick={() => openComposer('clients')}><Users size={16} /> Tous les clients</button>
            <button className="btn small" type="button" onClick={() => openComposer('email')}><Plus size={16} /> Nouveau message</button>
          </div>
        </div>
        <div className="email-card-list">
          {messages.length ? messages.map((row) => (
            <article className="email-card" key={row.id_mail}>
              <div className="category-icon"><Mail size={24} /></div>
              <div>
                <strong>{row.subject}</strong>
                <p>De {row.sender_email || user?.email || '-'} vers {row.to_email}</p>
                <small>{formatDate(row.created_at)}</small>
              </div>
              <Badge>{row.status || 'envoye'}</Badge>
            </article>
          )) : <div className="empty large">Aucune communication envoyee</div>}
        </div>
      </div>
      <div className="panel">
        <h3>Configuration email</h3>
        <div className="mail-status">
          <Badge>{status.ready ? 'actif' : 'configuration requise'}</Badge>
          <p>Expediteur SMTP: <strong>{status.sender || 'Email serveur indisponible'}</strong></p>
          {!status.ready && <p className="mail-warning">Ajoutez EMAIL_USER et EMAIL_PASS dans Render puis redeployez le backend.</p>}
          <p>Les nouveaux utilisateurs recoivent un email de bienvenue avec un lien securise pour definir leur mot de passe.</p>
        </div>
      </div>
      {creating && (
        <Modal title={isTeamNotification ? "Message a toute l'equipe" : isClientsMail ? 'Message a tous les clients' : 'Nouveau message'} onClose={closeComposer}>
          <Form onSubmit={sendMessage}>
            <div className="debt-preview">
              <span>Expediteur</span>
              <strong>{status.sender || user?.email || 'Email serveur indisponible'}</strong>
            </div>
            {isTeamNotification || isClientsMail ? (
              <div className="debt-preview">
                <span>Destination</span>
                <strong>{isTeamNotification ? "Tous les utilisateurs actifs de l'entreprise" : 'Tous les clients actifs avec email'}</strong>
              </div>
            ) : (
              <Input label="Destinataire" type="email" value={form.to} onChange={(to) => setForm({ ...form, to })} required />
            )}
            <Input label="Sujet" value={form.subject} onChange={(subject) => setForm({ ...form, subject })} required />
            <label>Message
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </label>
            {mailFeedback && (
              <div className={`form-feedback ${mailFeedback.type}`}>
                <AlertTriangle size={18} />
                <span>{mailFeedback.message}</span>
              </div>
            )}
            <button className="btn modal-submit" type="submit" disabled={sending}>
              {isTeamNotification ? <Bell size={18} /> : isClientsMail ? <Users size={18} /> : <Mail size={18} />}
              {sending ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </Form>
        </Modal>
      )}
    </div>
  );
}

function Fournisseurs({ api, notify, data, submit, searchQuery = '', user }) {
  const emptyForm = { nom: '', telephone: '', email: '', adresse: '' };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const fournisseurs = (data.fournisseurs || []).filter((f) => `${f.nom} ${f.telephone || ''} ${f.email || ''}`.toLowerCase().includes(term));

  const create = () => submit(async () => {
    await api('/fournisseurs', { method: 'POST', body: JSON.stringify(form) });
    closeCreate();
    notify('Fournisseur ajoute');
  });
  const closeCreate = () => {
    setForm(emptyForm);
    setCreating(false);
  };

  const saveEdit = () => submit(async () => {
    await api(`/fournisseurs/${editing.id_fournisseur}`, { method: 'PUT', body: JSON.stringify(editing) });
    setEditing(null);
    notify('Fournisseur mis a jour');
  });

  const remove = (fournisseur) => {
    if (!window.confirm(`Supprimer ${fournisseur.nom} ?`)) return;
    submit(async () => {
      await api(`/fournisseurs/${fournisseur.id_fournisseur}`, { method: 'DELETE' });
      notify('Fournisseur supprime');
    });
  };

  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <h3>Fournisseurs</h3>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher fournisseur" />
            {user?.role === 'magasinier' && <button className="btn small" type="button" onClick={() => { setForm(emptyForm); setCreating(true); }}><Plus size={16} /> Ajouter fournisseur</button>}
          </div>
        </div>
        <Table headers={['Nom', 'Telephone', 'Email', 'Approvisionnements', 'Actions']} rows={fournisseurs.map((f) => [
          f.nom,
          f.telephone || '-',
          f.email || '-',
          f.total_approvisionnements || 0,
          <RowActions
            onEdit={user?.role === 'magasinier' ? () => setEditing(f) : null}
            onPrint={() => printDocument('Fournisseur', [['Nom', f.nom], ['Telephone', f.telephone || '-'], ['Email', f.email || '-'], ['Approvisionnements', f.total_approvisionnements || 0]], { paper: 'page' })}
            onDelete={user?.role === 'magasinier' ? () => remove(f) : null}
          />
        ])} />
      </div>
      {creating && (
        <Modal title="Nouveau fournisseur" onClose={closeCreate}>
          <Form onSubmit={create}>
            <Input label="Nom" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
            <Input label="Telephone" value={form.telephone} onChange={(telephone) => setForm({ ...form, telephone })} />
            <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
            <Input label="Adresse" value={form.adresse} onChange={(adresse) => setForm({ ...form, adresse })} />
            <button className="btn modal-submit">Enregistrer <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier fournisseur" onClose={() => setEditing(null)}>
          <Form onSubmit={saveEdit}>
            <Input label="Nom" value={editing.nom || ''} onChange={(nom) => setEditing({ ...editing, nom })} required />
            <Input label="Telephone" value={editing.telephone || ''} onChange={(telephone) => setEditing({ ...editing, telephone })} />
            <Input label="Email" type="email" value={editing.email || ''} onChange={(email) => setEditing({ ...editing, email })} />
            <Input label="Adresse" value={editing.adresse || ''} onChange={(adresse) => setEditing({ ...editing, adresse })} />
            <button className="btn">Mettre a jour</button>
          </Form>
        </Modal>
      )}
    </div>
  );
}

function Categories({ api, notify, data, submit, searchQuery = '', user }) {
  const emptyCategoryForm = { nom: '', description: '', photo_url: '' };
  const [form, setForm] = useState(emptyCategoryForm);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const categories = data.categories.filter((c) => `${c.reference_categorie || ''} ${c.nom} ${c.description || ''}`.toLowerCase().includes(term));
  const save = () => submit(async () => {
    await api('/categories', { method: 'POST', body: JSON.stringify(form) });
    closeCreate();
    notify('Categorie creee');
  });
  const closeCreate = () => {
    setForm(emptyCategoryForm);
    setCreating(false);
  };
  const saveEdit = () => submit(async () => {
    await api(`/categories/${editing.id_categorie}`, { method: 'PUT', body: JSON.stringify(editing) });
    setEditing(null);
    notify('Categorie mise a jour');
  });
  const remove = (categorie) => {
    if (!window.confirm(`Supprimer la categorie ${categorie.nom} ?`)) return;
    submit(async () => {
      await api(`/categories/${categorie.id_categorie}`, { method: 'DELETE' });
      notify('Categorie supprimee');
    });
  };

  return (
    <div className="grid">
      <div className="panel category-market">
        <div className="panel-heading category-market-heading">
          <div>
            <h3>Meilleures categories</h3>
            <p>Classement des familles de produits selon votre catalogue.</p>
          </div>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher categorie" />
            {user?.role === 'magasinier' && <button className="btn small" type="button" onClick={() => { setForm(emptyCategoryForm); setCreating(true); }}><Plus size={16} /> Nouvelle categorie</button>}
          </div>
        </div>
        <div className="category-market-layout">
          <aside className="category-market-nav">
            <strong>Departements</strong>
            {categories.map((c) => <span key={c.id_categorie}>{c.nom}</span>)}
          </aside>
          <div className="category-rank-zone">
            <div className="category-rank-header">
              <h4>Categories populaires</h4>
              <span>Page 1 sur 1</span>
            </div>
            <div className="category-rank-list">
              {categories.map((c, index) => (
                <article className="category-rank-card" key={c.id_categorie}>
                  <b>#{index + 1}</b>
                  <div className="category-rank-visual">
                    <img src={categoryPhotoUrl(c, index)} alt="" />
                  </div>
                  <strong>{c.nom}</strong>
                  <em>Ref. {c.reference_categorie || c.id_categorie}</em>
                  <p>{c.description || 'Aucune description'}</p>
                  <span>{c.total_produits || 0} produits</span>
                  <RowActions onEdit={user?.role === 'magasinier' ? () => setEditing(c) : null} onDelete={user?.role === 'magasinier' ? () => remove(c) : null} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      {creating && (
        <Modal title="Nouvelle categorie" onClose={closeCreate}>
          <Form onSubmit={save}>
            <Input label="Nom" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
            <Input label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
            <PhotoInput label="URL de la photo de la categorie" value={form.photo_url} onChange={(photo_url) => setForm({ ...form, photo_url })} api={api} folder="categories" notify={notify} />
            <button className="btn modal-submit">Enregistrer <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier categorie" onClose={() => setEditing(null)}>
          <Form onSubmit={saveEdit}>
            <Input label="Nom" value={editing.nom || ''} onChange={(nom) => setEditing({ ...editing, nom })} required />
            <Input label="Description" value={editing.description || ''} onChange={(description) => setEditing({ ...editing, description })} />
            <PhotoInput label="URL de la photo de la categorie" value={editing.photo_url || ''} onChange={(photo_url) => setEditing({ ...editing, photo_url })} api={api} folder="categories" notify={notify} />
            <button className="btn">Mettre a jour</button>
          </Form>
        </Modal>
      )}
    </div>
  );
}

function ClientDashboard({ data, setPage, user }) {
  const commandes = data.extra.commandes || [];
  const stats = data.extra.clientDashboard?.stats || {};
  return (
    <div className="client-space">
      <section className="client-hero">
        <div><span>Espace client</span><h2>Bonjour {user?.nom || 'client'}</h2><p>Commandez vos produits et gardez un oeil sur chaque etape.</p></div>
        <button className="btn" type="button" onClick={() => setPage('commandes')}><ShoppingCart size={19} /> Commander</button>
      </section>
      <section className="client-kpis">
        <article><ShoppingCart /><span>Commandes</span><strong>{stats.total_commandes || 0}</strong></article>
        <article><FileText /><span>Achats cumules</span><strong>{moneySmart(stats.total_achats)}</strong></article>
        <article><HelpCircle /><span>Reclamations ouvertes</span><strong>{stats.reclamations_ouvertes || 0}</strong></article>
      </section>
      <section className="panel">
        <div className="panel-heading"><h3>Dernieres commandes</h3><button className="link-button" type="button" onClick={() => setPage('commandes')}>Voir tout</button></div>
        <Table headers={['Commande', 'Date', 'Montant', 'Statut', 'Facture']} rows={commandes.slice(0, 5).map((item) => [item.id_commande, formatDate(item.date_commande), money(item.montant_ttc), <Badge>{item.statut}</Badge>, item.numero_facture || '-'])} />
      </section>
    </div>
  );
}

function Commandes({ api, notify, data, submit, user, searchQuery = '' }) {
  const commandes = data.extra.commandes || [];
  const catalogue = data.extra.catalogue || [];
  const [cart, setCart] = useState({});
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const filtered = commandes.filter((item) => `${item.id_commande} ${item.client_nom || ''} ${item.statut}`.toLowerCase().includes(term));
  const cartItems = catalogue.filter((product) => Number(cart[product.id_produit] || 0) > 0);
  const cartTotal = cartItems.reduce((sum, product) => sum + priceWithTax(product) * Number(cart[product.id_produit]), 0);
  const add = (product, delta = 1) => setCart((current) => ({ ...current, [product.id_produit]: Math.max(0, Math.min(Number(product.quantite_stock), Number(current[product.id_produit] || 0) + delta)) }));
  const placeOrder = () => {
    if (!cartItems.length) return notify('Ajoutez au moins un produit au panier.');
    submit(async () => {
      await api('/commandes', { method: 'POST', body: JSON.stringify({ note_client: note, articles: cartItems.map((product) => ({ produit_id: product.id_produit, quantite: cart[product.id_produit] })) }) });
      setCart({}); setNote(''); notify('Commande envoyee au manager.');
    });
  };
  const updateStatus = (item, statut) => submit(async () => {
    await api(`/commandes/${item.id_commande}/statut`, { method: 'PUT', body: JSON.stringify({ statut }) });
    notify('Commande mise a jour.');
  });
  const convert = (item) => submit(async () => {
    const result = await api(`/commandes/${item.id_commande}/convertir`, { method: 'POST', body: '{}' });
    notify(result.message);
  });
  const printOrder = (item) => {
    const clientName = `${item.client_nom || ''} ${item.client_postnom || ''}`.trim() || '-';
    const articles = (item.lignes || []).map((line) => [
      line.produit_nom || line.produit_id || '-',
      line.quantite,
      moneySmart(priceWithTax(line)),
      moneySmart(Number(line.quantite || 0) * priceWithTax(line))
    ]);
    printLayout({
      title: `Commande ${item.id_commande}`,
      badge: item.statut,
      sections: [
        {
          title: 'Informations commande',
          rows: [
            ['Reference', item.id_commande],
            ['Date', formatDate(item.date_commande)],
            ['Statut', item.statut],
            ['Facture', item.numero_facture || 'Non facturee']
          ]
        },
        {
          title: 'Client',
          rows: [
            ['Nom', clientName],
            ['Telephone', item.client_telephone || '-'],
            ['Montant TTC', moneySmart(item.montant_ttc)]
          ]
        }
      ],
      table: {
        title: 'Articles commandes',
        headers: ['Produit', 'Quantite', 'Prix vente TTC', 'Total TTC'],
        rows: articles.length ? articles : [['Aucun article detaille', '-', '-', '-']]
      },
      note: item.note_client ? `Note client: ${item.note_client}` : 'Document imprime depuis le module Commandes.',
      paper: 'page',
      generatedLine: `Commande imprimee par ${user?.nom || user?.email || 'vendeur'}`
    });
  };

  if (user?.role === 'client') return (
    <div className="client-order-layout">
      <section className="panel catalogue-panel">
        <div className="panel-heading"><div><h3>Catalogue disponible</h3><p>Le stock est confirme lors de la facturation.</p></div></div>
        <div className="client-catalogue">
          {catalogue.map((product, index) => (
            <article key={product.id_produit}>
              <img src={productPhotoUrl(product, index)} alt="" />
              <div><small>{product.categorie_nom || 'Produit'}</small><h4>{product.nom}</h4><span>Stock {product.quantite_stock} {product.unite}</span><strong>{moneySmart(priceWithTax(product))}{hasTax(product.taux_tva) ? ' TTC' : ''}</strong><em>{taxText(product)}</em></div>
              <div className="cart-stepper"><button type="button" onClick={() => add(product, -1)}>-</button><b>{cart[product.id_produit] || 0}</b><button type="button" onClick={() => add(product, 1)}>+</button></div>
            </article>
          ))}
        </div>
      </section>
      <aside className="panel client-cart">
        <h3>Mon panier</h3>
        {cartItems.length ? cartItems.map((product) => <div key={product.id_produit}><span>{product.nom} × {cart[product.id_produit]}</span><strong>{moneySmart(priceWithTax(product) * Number(cart[product.id_produit]))}</strong></div>) : <p className="empty compact">Panier vide</p>}
        <label>Note pour l'equipe<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Livraison, precision sur la commande..." /></label>
        <div className="cart-total"><span>Total estime</span><strong>{moneySmart(cartTotal)}</strong></div>
        <button className="btn" type="button" onClick={placeOrder}>Envoyer la commande <ArrowRight size={18} /></button>
      </aside>
      <section className="panel order-history"><div className="panel-heading"><h3>Suivi de mes commandes</h3></div><Table headers={['Commande', 'Date', 'Articles', 'Montant', 'Statut', 'Facture']} rows={filtered.map((item) => [item.id_commande, formatDate(item.date_commande), item.lignes?.reduce((sum, line) => sum + Number(line.quantite), 0) || 0, money(item.montant_ttc), <Badge>{item.statut}</Badge>, item.numero_facture || '-'])} /></section>
    </div>
  );

  return (
    <section className="panel">
      <div className="panel-heading client-toolbar"><div><h3>Commandes clients</h3><p>{commandes.filter((item) => item.statut === 'en_attente').length} en attente</p></div><SearchInput value={query} onChange={setQuery} placeholder="Commande ou client" /></div>
      <Table headers={['Commande', 'Client', 'Date', 'Articles', 'Montant', 'Statut', 'Actions']} rows={filtered.map((item) => [
        item.id_commande, `${item.client_nom} ${item.client_postnom || ''}`, formatDate(item.date_commande), item.lignes?.map((line) => `${line.produit_nom} × ${line.quantite}`).join(', '), money(item.montant_ttc), <Badge>{item.statut}</Badge>,
        <div className="actions order-actions">
          {!item.vente_id && !['annulee', 'rejetee'].includes(item.statut) && <select value={item.statut} onChange={(event) => updateStatus(item, event.target.value)}><option value="en_attente">En attente</option><option value="confirmee">Confirmee</option><option value="preparee">Preparee</option><option value="livree">Livree</option><option value="annulee">Annulee</option><option value="rejetee">Rejetee</option></select>}
          {user?.role === 'vendeur' && <button className="action print-action" type="button" title="Imprimer la commande" onClick={() => printOrder(item)}><Printer size={17} /></button>}
          {user?.role === 'vendeur' && !item.vente_id && !['annulee', 'rejetee'].includes(item.statut) && <button className="btn small" type="button" onClick={() => convert(item)}>Facturer</button>}
          {item.numero_facture && <Badge>{item.numero_facture}</Badge>}
        </div>
      ])} />
    </section>
  );
}

function AchatsClient({ api, notify, data, submit, setPage, searchQuery = '' }) {
  const rows = (data.extra.achats || []).filter((item) => `${item.numero_facture} ${item.montant_ttc}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const [stripeForm, setStripeForm] = useState({ vente_id: '', montant: '' });
  const openStripePayment = (item) => {
    const reste = Math.max(0, Number(item.reste_a_payer || 0));
    setStripeForm({ vente_id: item.id_ventes, montant: reste ? reste.toFixed(2) : '' });
  };
  const payWithStripe = () => submit(async () => {
    const result = await api('/paiements/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({
        vente_id: stripeForm.vente_id,
        montant: Number(stripeForm.montant)
      })
    });
    const url = result.data?.checkout_url;
    if (!url) throw new Error('Stripe n a pas retourne de lien de paiement.');
    window.location.href = url;
  });
  return <>
    <section className="panel"><div className="panel-heading"><div><h3>Mes achats et factures</h3><p>Consultez vos factures, les montants deja payes et le reste a payer.</p></div></div>{rows.length ? <Table headers={['Facture', 'Date', 'Montant', 'Paye', 'Reste', 'Statut', 'Paiement']} rows={rows.map((item) => [item.numero_facture, formatDate(item.date_vente), money(item.montant_ttc), money(item.total_paye), money(item.reste_a_payer), <Badge>{Number(item.reste_a_payer) <= 0 ? 'Paye' : Number(item.total_paye) > 0 ? 'Partiel' : 'Impaye'}</Badge>, Number(item.reste_a_payer || 0) > 0 ? <button className="btn small stripe-pay-button" type="button" onClick={() => openStripePayment(item)}><CreditCard size={15} /> Payer en ligne</button> : <span className="muted">Solde paye</span>])} /> : <div className="empty purchase-empty"><WalletCards size={32} /><strong>Aucune facture disponible</strong><p>Vos factures apparaitront ici des qu'une commande sera transformee en facture.</p><button className="btn small" type="button" onClick={() => setPage('commandes')}>Voir mes commandes</button></div>}</section>
    {stripeForm.vente_id && <Modal title="Paiement en ligne" onClose={() => setStripeForm({ vente_id: '', montant: '' })}>
      <Form onSubmit={payWithStripe}>
        <div className="payment-test-card">
          <CreditCard size={28} />
          <div>
            <strong>Paiement securise</strong>
            <p>Vous serez redirige vers une page de paiement securisee pour finaliser votre reglement.</p>
          </div>
        </div>
        <Input label="Montant a payer (USD)" type="number" step="0.01" value={stripeForm.montant} onChange={(montant) => setStripeForm({ ...stripeForm, montant })} required />
        <button className="btn modal-submit">Continuer vers Stripe <ArrowRight size={20} /></button>
      </Form>
    </Modal>}
  </>;
}

function Reclamations({ api, notify, data, submit, user, searchQuery = '' }) {
  const [form, setForm] = useState({ sujet: '', message: '', commande_id: '' });
  const [editing, setEditing] = useState(null);
  const rows = (data.extra.reclamations || []).filter((item) => `${item.id_reclamation} ${item.client_nom || ''} ${item.sujet} ${item.statut}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const send = () => submit(async () => {
    await api('/reclamations', { method: 'POST', body: JSON.stringify(form) });
    setForm({ sujet: '', message: '', commande_id: '' }); notify('Reclamation envoyee directement au manager.');
  });
  const save = () => submit(async () => {
    await api(`/reclamations/${editing.id_reclamation}`, { method: 'PUT', body: JSON.stringify(editing) });
    setEditing(null); notify('Reclamation traitee.');
  });
  return (
    <div className="grid">
      {user?.role === 'client' && <section className="panel complaint-form"><div className="panel-heading"><div><h3>Nouvelle reclamation</h3><p>Votre message sera visible par le manager.</p></div></div><Form onSubmit={send}><Input label="Sujet" value={form.sujet} onChange={(sujet) => setForm({ ...form, sujet })} required /><Select label="Commande concernee (optionnel)" value={form.commande_id} onChange={(commande_id) => setForm({ ...form, commande_id })} required={false} options={[["", "Aucune commande"], ...(data.extra.commandes || []).map((item) => [item.id_commande, item.id_commande])]} /><label>Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /></label><button className="btn modal-submit">Envoyer au manager <ArrowRight size={18} /></button></Form></section>}
      <section className="panel"><div className="panel-heading"><div><h3>{user?.role === 'client' ? 'Mes reclamations' : 'Reclamations clientes'}</h3><p>{rows.filter((item) => item.statut === 'ouverte').length} ouverte(s)</p></div></div><Table headers={['Reference', ...(user?.role === 'manager' ? ['Client'] : []), 'Sujet', 'Message', 'Reponse', 'Statut', ...(user?.role === 'manager' ? ['Action'] : [])]} rows={rows.map((item) => [item.id_reclamation, ...(user?.role === 'manager' ? [`${item.client_nom} ${item.client_postnom || ''}`] : []), item.sujet, item.message, item.reponse || 'En attente', <Badge>{item.statut}</Badge>, ...(user?.role === 'manager' ? [<button className="btn small" type="button" onClick={() => setEditing(item)}>Traiter</button>] : [])])} /></section>
      {editing && <Modal title={`Traiter ${editing.id_reclamation}`} onClose={() => setEditing(null)}><Form onSubmit={save}><Select label="Statut" value={editing.statut} onChange={(statut) => setEditing({ ...editing, statut })} options={[['ouverte', 'Ouverte'], ['en_cours', 'En cours'], ['resolue', 'Resolue'], ['cloturee', 'Cloturee']]} /><label>Reponse au client<textarea value={editing.reponse || ''} onChange={(event) => setEditing({ ...editing, reponse: event.target.value })} /></label><button className="btn modal-submit">Enregistrer la reponse</button></Form></Modal>}
    </div>
  );
}

function Commentaires({ api, notify, data, submit, searchQuery = '' }) {
  const rows = (data.extra.commentaires || []).filter((item) => `${item.nom} ${item.email} ${item.sujet} ${item.message}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const update = (item, statut) => submit(async () => {
    await api(`/public/contacts/${item.id_contact}`, { method: 'PUT', body: JSON.stringify({ statut }) });
    notify(statut === 'traite' ? 'Commentaire marque comme traite.' : 'Commentaire marque comme lu.');
  });
  return <section className="panel"><div className="panel-heading"><div><h3>Messages de la page Contact</h3><p>{rows.filter((item) => item.statut === 'nouveau').length} nouveau(x) message(s)</p></div></div><Table headers={['Date', 'Visiteur', 'Email', 'Sujet', 'Message', 'Statut', 'Action']} rows={rows.map((item) => [formatDate(item.created_at), item.nom, item.email, item.sujet, item.message, <Badge>{item.statut}</Badge>, <div className="actions">{item.statut === 'nouveau' && <button className="btn small" type="button" onClick={() => update(item, 'lu')}>Marquer lu</button>}{item.statut !== 'traite' && <button className="btn secondary small" type="button" onClick={() => update(item, 'traite')}>Traite</button>}</div>])} /></section>;
}

function ChatPage({ api, notify, data, user, searchQuery = '' }) {
  const [liveChats, setLiveChats] = useState(data.extra.chats || []);
  const chats = liveChats.filter((chat) => `${chat.id_conversation} ${chat.client_nom || ''} ${chat.dernier_message || ''}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const messagesRef = useRef(null);
  const selected = chats.find((chat) => chat.id_conversation === selectedId) || chats[0] || null;
  const refreshChats = async () => { const result = await api('/chat'); setLiveChats(result.data || []); return result.data || []; };
  useEffect(() => setLiveChats(data.extra.chats || []), [data.extra.chats]);
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (!token) return undefined;
    const stream = new EventSource(`${API_URL}/chat/stream?token=${encodeURIComponent(token)}`);
    stream.addEventListener('chat-update', () => refreshChats().catch(() => null));
    return () => stream.close();
  }, []);
  useEffect(() => { messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' }); }, [selected?.messages?.length]);
  const send = async (quickText = '') => {
    const text = String(quickText || message).trim();
    if (!text) return;
    setMessage('');
    const tempMessage = { id_message: `temp-${Date.now()}`, sender_type: user?.role === 'client' ? 'client' : 'manager', message: text, created_at: new Date().toISOString(), pending: true };
    const currentId = selected?.id_conversation || 'pending';
    setSelectedId(currentId);
    setLiveChats((items) => {
      const exists = items.some((chat) => chat.id_conversation === currentId);
      if (!exists) return [{ id_conversation: currentId, client_nom: user?.nom, statut: 'ouverte', messages: [tempMessage], dernier_message: text }, ...items];
      return items.map((chat) => chat.id_conversation === currentId ? { ...chat, messages: [...(chat.messages || []), tempMessage], dernier_message: text } : chat);
    });
    try {
      const result = await api('/chat/messages', { method: 'POST', body: JSON.stringify({ conversation_id: selected?.id_conversation || undefined, message: text }) });
      setSelectedId(result.conversation_id || selected?.id_conversation || '');
      await refreshChats();
      if (result.escalated) notify('Question transmise au manager. Vous serez notifie de sa reponse.');
    } catch (error) {
      setLiveChats((items) => items.map((chat) => ({ ...chat, messages: (chat.messages || []).filter((item) => item.id_message !== tempMessage.id_message) })));
      setMessage(text);
      notify(error.message);
    }
  };
  const quickQuestions = [
    ['Bonjour', 'Bonjour'],
    ['Aide', 'Comment peux-tu m aider ?'],
    ['Produits disponibles', 'Quels produits sont disponibles actuellement ?'],
    ['Conseil chantier', 'Quels produits me conseillez-vous pour mon chantier ?'],
    ['Paiement', 'Comment payer une facture ?'],
    ['Mes factures', 'Comment consulter ma facture ?'],
    ['Suivi commande', 'Comment suivre ma commande ?'],
    ['Reclamation', 'Comment envoyer une reclamation ?']
  ];
  const analyze = async () => {
    setAnalysisLoading(true);
    try { const result = await api('/chat/manager-analysis'); setAiAnalysis(result.data?.analysis || 'Analyse indisponible.'); }
    catch (error) { notify(error.message); }
    finally { setAnalysisLoading(false); }
  };
  const renderChatMessage = (item) => {
    const mine = item.sender_type === 'client'
      ? user?.role === 'client'
      : item.sender_type === 'manager' && user?.role === 'manager';
    const roleLabel = item.sender_type === 'bot'
      ? 'Bot'
      : item.sender_type === 'manager'
        ? 'Manager'
        : (user?.role === 'client' ? 'Vous' : 'Client');
    const initials = item.sender_type === 'bot'
      ? 'QC'
      : item.sender_type === 'manager'
        ? 'MG'
        : getInitials(selected?.client_nom || user?.nom || 'Client');
    return (
      <div key={item.id_message} className={`chat-message-row ${mine ? 'mine' : 'theirs'} ${item.sender_type === 'bot' ? 'bot-row' : ''}`}>
        {!mine && <div className="chat-message-avatar">{initials}</div>}
        <article className={`chat-bubble ${item.pending ? 'pending' : ''} ${mine ? 'mine' : 'theirs'} ${item.sender_type === 'bot' ? 'bot' : ''}`}>
          <div className="chat-bubble-meta">
            <small>{roleLabel}</small>
            <time>{item.pending ? 'Envoi...' : new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time>
          </div>
          <p>{item.message}</p>
        </article>
        {mine && <div className="chat-message-avatar mine-avatar">{initials}</div>}
      </div>
    );
  };
  return (
    <><div className="chat-page-tools">{user?.role === 'manager' && <button className="btn secondary small" type="button" onClick={analyze} disabled={analysisLoading}><BarChart3 size={17} /> {analysisLoading ? 'Analyse...' : 'Avis IA au manager'}</button>}</div><div className={`chat-shell ${user?.role === 'client' ? 'client-chat-shell' : ''}`}>
      {user?.role === 'manager' && <aside className="chat-list"><div className="chat-list-head"><MessageCircle size={21} /><strong>Conversations</strong></div>{chats.length ? chats.map((chat) => <button key={chat.id_conversation} className={selected?.id_conversation === chat.id_conversation ? 'active' : ''} type="button" onClick={() => setSelectedId(chat.id_conversation)}><span>{getInitials(chat.client_nom)}</span><div><strong>{chat.client_nom} {chat.client_postnom || ''}</strong><small>{chat.dernier_message || 'Nouvelle conversation'}</small></div><Badge>{chat.statut}</Badge></button>) : <p className="empty compact">Aucune conversation</p>}</aside>}
      <section className="chat-window">
        <header><div className="chat-avatar"><MessageCircle size={22} /></div><div><strong>{user?.role === 'client' ? 'Assistant Quincaillerie Centrale' : selected ? `${selected.client_nom} ${selected.client_postnom || ''}` : 'Selectionnez un client'}</strong><span>{selected?.statut === 'en_attente_manager' ? 'Reponse humaine demandee' : 'Assistant automatique disponible'}</span></div></header>
        <div className="chat-messages" ref={messagesRef}>
          {!selected && user?.role === 'client' && <div className="chat-welcome"><MessageCircle size={34} /><h3>Comment pouvons-nous vous aider ?</h3><p>L’assistant consulte vos references de commande et de facture, puis repond aux questions sur les prix, paiements, produits et reclamations. S’il ne dispose pas d’une information fiable, le manager est prevenu immediatement par notification et par email.</p></div>}
          {(selected?.messages || []).map(renderChatMessage)}
        </div>
        {user?.role === 'client' && <div className="chat-suggestions chat-suggestions-bottom">
          {quickQuestions.map(([label, text]) => <button key={label} type="button" onClick={() => send(text)}>{label}</button>)}
        </div>}
        {(user?.role === 'client' || selected) && <Form onSubmit={send}><div className="chat-composer"><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ecrivez votre question..." maxLength={2000} /><button className="btn" disabled={!message.trim()}><Send size={19} /> Envoyer</button></div></Form>}
      </section>
    </div>{aiAnalysis && <Modal title="Analyse IA de l'activite" onClose={() => setAiAnalysis('')}><div className="ai-analysis"><p>{aiAnalysis}</p><small>Cette analyse aide a la decision; les donnees comptables et le jugement du manager restent prioritaires.</small></div></Modal>}</>
  );
}

function Form({ children, onSubmit, ...props }) {
  return <form className="form" onSubmit={(event) => { event.preventDefault(); Promise.resolve(onSubmit()).catch(() => null); }} {...props}>{children}</form>;
}

function Modal({ title, children, onClose, className = '' }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`modal ${className}`.trim()} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <h3>{title}</h3>
          <button className="icon-button ghost-icon" type="button" onClick={onClose} title="Fermer"><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false, ...props }) {
  const [visible, setVisible] = useState(false);
  if (type === 'password') {
    return <label>{label}<span className="password-field"><input type={visible ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} required={required} {...props} /><button type="button" aria-label={visible ? `Masquer ${label}` : `Afficher ${label}`} aria-pressed={visible} onMouseDown={(event) => event.preventDefault()} onClick={() => setVisible(!visible)} title={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{visible ? <Eye size={18} /> : <EyeOff size={18} />}</button></span></label>;
  }
  return <label>{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} {...props} /></label>;
}

function PhotoInput({ label, value, onChange, api, folder = 'products', notify }) {
  const [uploading, setUploading] = useState(false);
  const loadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify?.('Choisissez une image valide.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      notify?.('Image trop lourde. Taille maximum: 3 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result || '';
      if (!api) {
        onChange(dataUrl);
        return;
      }
      setUploading(true);
      try {
        const response = await api('/uploads/image', {
          method: 'POST',
          body: JSON.stringify({ folder, data_url: dataUrl, file_name: file.name })
        });
        onChange(response.data?.url || '');
        notify?.('Photo chargee avec succes.');
      } catch (error) {
        notify?.(error.message || "Impossible de charger la photo.");
      } finally {
        setUploading(false);
        event.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <label>{label}
      <div className="photo-input">
        <input type="url" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Coller le lien de la photo" />
        <input type="file" accept="image/*" onChange={loadFile} disabled={uploading} />
        {uploading && <small>Chargement de la photo...</small>}
        {value && (
          <div className="photo-preview">
            <img src={value} alt="" />
            <button className="action delete" type="button" onClick={() => onChange('')} title="Retirer photo"><Trash2 size={16} /></button>
          </div>
        )}
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options, required = true }) {
  return (
    <label>{label}
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        {options.map(([id, labelText]) => <option key={id} value={id}>{labelText}</option>)}
      </select>
    </label>
  );
}

function SearchableSelect({ label, value, onChange, options, placeholder = 'Rechercher...', required = true }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const selected = options.find(([id]) => id === value);
  const matches = options.filter(([, labelText]) => !term || String(labelText).toLowerCase().includes(term));
  const filtered = selected && !matches.some(([id]) => id === selected[0]) ? [selected, ...matches] : matches;
  return (
    <label>{label}
      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} />
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        {filtered.map(([id, labelText]) => <option key={id} value={id}>{labelText}</option>)}
      </select>
    </label>
  );
}

createRoot(document.querySelector('#app')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
