import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
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
  FileText,
  Grid2X2,
  HelpCircle,
  LockKeyhole,
  LogOut,
  LogIn,
  Mail,
  Menu,
  Moon,
  Package,
  Plus,
  Printer,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  SunMedium,
  Tags,
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
  if (text.includes('OK') || text.includes('actif') || text.includes('Paye') || text.includes('converti')) return 'ok';
  if (text.includes('ALERTE') || text.includes('attente') || text.includes('Partiel')) return 'warn';
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
  mails: Mail,
};

function IconButton({ title, children, className = '' }) {
  return <button className={`icon-button ${className}`} title={title} type="button">{children}</button>;
}

function Table({ headers, rows }) {
  if (!rows.length) return <div className="empty">Aucune donnee</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, i) => <td key={i} data-label={headers[i]}>{cell ?? '-'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
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
      userLabel,
      contact: user?.email || ''
    };
  } catch {
    return { company: APP_NAME, userLabel: 'utilisateur', contact: '' };
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
              <div class="brand"><div class="print-logo"><img src="${LOGO_URL}" alt=""></div><h1>${escapePrint(identity.company)}</h1></div>
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
          <footer>${escapePrint(identity.company)} - Etat imprime depuis ${escapePrint(APP_NAME)}</footer>
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
    note: `Ce document est genere automatiquement depuis ${APP_NAME}.`,
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
    note: options.note || `Cet etat de sortie est transmis par ${APP_NAME} pour consultation et archivage.`,
    paper: options.paper || 'page',
    generatedLine: options.generatedLine,
    showSignatures: Boolean(options.showSignatures)
  });
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
  const [showPasswordSettings, setShowPasswordSettings] = useState(false);
  const [passwordTargetEmail, setPasswordTargetEmail] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json().then((body) => ({ response, body })))
      .then(({ response, body }) => {
        if (!response.ok || !body.user || cancelled) return;
        const refreshedUser = { ...body.user, id: body.user.id_utilisateur, type: 'utilisateur' };
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
    setToken(result.token);
    setUser(connectedUser);
    setAuthType('user');
    setPage('dashboard');
    localStorage.setItem('crm_token', result.token);
    localStorage.setItem('crm_user', JSON.stringify(connectedUser));
    localStorage.setItem('crm_auth_type', 'user');
    notify('Connexion reussie');
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    localStorage.removeItem('crm_auth_type');
    setToken('');
    setUser(null);
    setAuthType('user');
    setPage('dashboard');
  };

  const navItems = useMemo(() => {
    const role = user?.role;
    return [
      { id: 'dashboard', label: tr(lang, 'dashboard'), roles: ['manager', 'caissier', 'magasinier'] },
      { id: 'clients', label: tr(lang, 'clients'), roles: ['manager', 'caissier'] },
      { id: 'ventes', label: 'Ventes', roles: ['manager', 'caissier'] },
      { id: 'paiements', label: tr(lang, 'paiements'), roles: ['manager', 'caissier'] },
      { id: 'categories', label: tr(lang, 'categories'), roles: ['manager', 'magasinier'] },
      { id: 'fournisseurs', label: tr(lang, 'fournisseurs'), roles: ['manager', 'magasinier'] },
      { id: 'produits', label: 'Produits et stock', roles: ['manager', 'caissier', 'magasinier'] },
      { id: 'rapports', label: tr(lang, 'rapports'), roles: ['manager', 'caissier', 'magasinier'] },
      { id: 'utilisateurs', label: tr(lang, 'utilisateurs'), roles: ['manager'] },
      { id: 'mails', label: tr(lang, 'mails'), roles: ['manager'] }
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
    const text = `${notification?.titre || ''} ${notification?.message || ''}`;
    const targetEmail = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
    if (notification?.id_notification) {
      api(`/notifications/${notification.id_notification}/read`, { method: 'PUT', body: '{}' })
        .then(() => setNotifications((items) => items.map((item) => (
          item.id_notification === notification.id_notification ? { ...item, lu: true } : item
        ))))
        .catch(() => null);
    }
    if (/recuperation|mot de passe|password/i.test(text)) {
      setPasswordTargetEmail(targetEmail);
      setShowPasswordSettings(true);
      return;
    }
    setSelectedNotification(notification);
  };

  if (booting) {
    return <main className="app-boot"><QcLoader label="Ouverture de Quincaillerie Centrale" /></main>;
  }

  if (!token) {
    return <Login authType={authType} setAuthType={setAuthType} onLogin={login} notify={notify} toast={toast} lang={lang} />;
  }

  const titles = {
    dashboard: [tr(lang, 'dashboard'), "Bienvenue, voici l'activite de votre entreprise aujourd'hui."],
    clients: ['Clients', 'Fiche client 360 et historique commercial.'],
    produits: ['Produits et stock', 'Catalogue, alertes et entrees de stock.'],
    ventes: ['Ventes', 'Factures, details et reste a payer.'],
    paiements: ['Paiements', 'Argent recu et rapport de caisse.'],
    utilisateurs: ['Utilisateurs', 'Comptes, roles et acces de votre equipe.'],
    mails: ['Emails', 'Envoyer des notifications et messages clients.'],
    categories: ['Categories', 'Classification simple des produits et services.'],
    fournisseurs: ['Fournisseurs', 'Contacts et historique des approvisionnements.'],
    rapports: user?.role === 'magasinier'
      ? ['Rapports produits', 'Inventaire, stock et entrees de stock.']
      : user?.role === 'caissier'
        ? ['Rapports caisse', 'Factures, dettes et paiements recus.']
        : ['Rapports', 'Factures, creances, stock et meilleurs clients.'],
  };
  const [title, subtitle] = titles[page] || [APP_NAME, ''];
  const sidebarTitle = user?.entreprise_nom || user?.raison_sociale || user?.entreprise_id || APP_NAME;

  return (
    <div className={`shell ${mobileMenuOpen ? 'menu-open' : ''}`}>
      {mobileMenuOpen && <button className="sidebar-scrim" type="button" aria-label="Fermer le menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark logo-mark"><img src={LOGO_URL} alt="" /></div>
          <div>
            <strong title={sidebarTitle}>{sidebarTitle}</strong>
            <span>{APP_TAGLINE}</span>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}>
              {React.createElement(iconMap[item.id] || Package, { size: 23, strokeWidth: 2.2 })}
              {item.label}
            </button>
          ))}
          <button className="nav-logout" type="button" onClick={logout}>
            <LogOut size={23} />
            {tr(lang, 'logout')}
          </button>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Ouvrir le menu">
            <Menu size={22} />
            <span>Menu</span>
          </button>
          <SearchInput value={platformSearch} onChange={setPlatformSearch} placeholder={searchPlaceholders[page] || 'Rechercher...'} />
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
                      <small>{/recuperation|mot de passe|password/i.test(`${n.titre} ${n.message}`) ? 'Reconfigurer le mot de passe' : formatDate(n.created_at)}</small>
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
        <Page page={page} api={api} notify={notify} lang={lang} user={user} searchQuery={platformSearch} setPage={setPage} />
      </main>
      {showPasswordSettings && (
        <PasswordSettings api={api} notify={notify} user={user} targetEmail={passwordTargetEmail} onClose={() => { setShowPasswordSettings(false); setPasswordTargetEmail(''); }} />
      )}
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
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Login({ onLogin, notify, toast }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [forgotMotif, setForgotMotif] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

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

  const forgot = async (event) => {
    event.preventDefault();
    if (!form.email) {
      notify("Saisissez d'abord votre adresse e-mail de connexion.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, motif: forgotMotif })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Demande impossible');
      notify(body.message);
      setShowForgot(false);
      setForgotMotif('');
    } catch (error) {
      notify(error.message);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-box">
          <div className="login-card-brand">
            <img className="login-logo" src={LOGO_URL} alt="" />
            <div>
              <strong>{APP_NAME}</strong>
              <span>{APP_TAGLINE}</span>
            </div>
          </div>
          <h2>Connexion</h2>
          <p>Accedez a votre espace de gestion commerciale.</p>
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
                <button className="password-eye" type="button" onMouseDown={(event) => event.preventDefault()} onClick={togglePassword} title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  <Eye size={22} />
                </button>
              </span>
              <button className="forgot-inline" type="button" onClick={() => setShowForgot(!showForgot)}>Mot de passe oublie ?</button>
            </label>
            <button className="btn login-submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'} <LogIn size={20} />
            </button>
          </form>
          {showForgot && (
            <form className="forgot-box" onSubmit={forgot}>
              <p className="muted">La demande sera envoyee avec l'adresse saisie ci-dessus.</p>
              <label>Motif de la demande
                <textarea value={forgotMotif} onChange={(e) => setForgotMotif(e.target.value)} placeholder="Ex: je n'arrive plus a acceder a mon compte" />
              </label>
              <button className="btn secondary">Envoyer la demande</button>
            </form>
          )}
        </div>
      </section>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function PasswordSettings({ api, notify, user, targetEmail, onClose }) {
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const accountEmail = targetEmail || user?.email || '';

  const save = async () => {
    if (saving) return;
    setFeedback(null);
    if (form.new_password !== form.confirm_password) {
      setFeedback({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (String(form.new_password || '').length < 6) {
      setFeedback({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caracteres.' });
      return;
    }
    if (!accountEmail) {
      setFeedback({ type: 'error', message: 'Aucun identifiant detecte pour cette reconfiguration.' });
      return;
    }

    setSaving(true);
    try {
      let message = '';
      if (targetEmail && targetEmail !== user?.email) {
        const response = await api('/auth/reset-request-password', { method: 'POST', body: JSON.stringify({ email: targetEmail, new_password: form.new_password }) });
        message = response.message || `Mot de passe reinitialise pour ${targetEmail}.`;
      } else {
        const response = await api('/auth/change-password', { method: 'POST', body: JSON.stringify(form) });
        message = response.message || 'Mot de passe mis a jour.';
      }
      setFeedback({ type: 'success', message });
      notify(message);
      setForm({ new_password: '', confirm_password: '' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Operation refusee.' });
      notify(error.message || 'Operation refusee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Reconfiguration du mot de passe" onClose={onClose}>
      <Form onSubmit={save}>
        <div className="debt-preview">
          <span>Identifiant</span>
          <strong>{accountEmail || 'Demande sans email detecte'}</strong>
        </div>
        <Input label="Nouveau mot de passe" type="password" value={form.new_password} onChange={(new_password) => setForm({ ...form, new_password })} required />
        <Input label="Confirmer le mot de passe" type="password" value={form.confirm_password} onChange={(confirm_password) => setForm({ ...form, confirm_password })} required />
        {feedback && (
          <div className={`form-feedback ${feedback.type}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}
        <button className="btn modal-submit" type="submit" disabled={saving}>
          <LockKeyhole size={18} />
          {saving ? 'Traitement en cours...' : 'Mettre a jour'}
        </button>
      </Form>
    </Modal>
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
    magasinier: [common.dashboard, common.produits, common.categories, common.fournisseurs, common.rapportsStock],
    caissier: [common.dashboard, common.clients, common.ventes, common.paiements, common.rapportsCaisse],
    manager: [common.dashboard, common.clients, common.ventes, common.paiements, common.produits, common.fournisseurs, common.rapportsManager, common.utilisateurs, common.mails]
  };

  const pageAliases = {
    rapports: role === 'magasinier' ? 'rapportsStock' : role === 'caissier' ? 'rapportsCaisse' : 'rapportsManager'
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
      const response = await api('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) });
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
    await api('/auth/change-password', { method: 'POST', body: JSON.stringify(form) });
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

function Page({ page, api, notify, lang, user, searchQuery, setPage }) {
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
      if (page === 'paiements') tasks.push(api('/paiements/rapport-caisse').then((r) => { next.extra.caisse = r.data || []; }).catch(() => {}));
      if (page === 'utilisateurs') tasks.push(api('/utilisateurs').then((r) => { next.extra.utilisateurs = r.data || []; }));
      if (page === 'mails') {
        tasks.push(api('/mail/status').then((r) => { next.extra.mailStatus = r.data || {}; }).catch(() => {}));
        tasks.push(api('/mail/messages').then((r) => { next.extra.mailMessages = r.data || []; }).catch(() => {}));
      }
      if (page === 'rapports') {
        tasks.push(api('/rapports/factures').then((r) => { next.extra.factures = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/creances').then((r) => { next.extra.creances = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/stock-inventaire').then((r) => { next.extra.stock = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/top-acheteurs').then((r) => { next.extra.top = r.data || []; }).catch(() => {}));
        tasks.push(api('/paiements/rapport-caisse').then((r) => { next.extra.caisse = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/bilan').then((r) => { next.extra.bilan = r.data || {}; }).catch(() => {}));
        tasks.push(api('/rapports/journal').then((r) => { next.extra.journal = r.data || []; }).catch(() => {}));
        tasks.push(api('/rapports/livre-caisse').then((r) => { next.extra.livreCaisse = r.data || []; }).catch(() => {}));
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
    }
  };

  if (loading) return <QcLoader label="Chargement des donnees" />;
  if (error) return <p className="notice">{error}</p>;

  const props = { api, notify, data, submit, lang, user, searchQuery, setPage };
  if (page === 'dashboard') return <Dashboard data={data} searchQuery={searchQuery} setPage={setPage} user={user} />;
  if (page === 'clients') return <Clients {...props} />;
  if (page === 'produits') return <Produits {...props} />;
  if (page === 'fournisseurs') return <Fournisseurs {...props} />;
  if (page === 'ventes') return <Ventes {...props} />;
  if (page === 'paiements') return <Paiements {...props} />;
  if (page === 'utilisateurs') return <Utilisateurs {...props} />;
  if (page === 'mails') return <Mails {...props} />;
  if (page === 'categories') return <Categories {...props} />;
  if (page === 'rapports') return <Rapports data={data} searchQuery={searchQuery} user={user} />;
  return null;
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
      mobile_money: 'Mobile Money',
      especes: 'Especes',
      virement: 'Virement',
      carte: 'Carte'
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
  const canSales = ['manager', 'caissier'].includes(role);
  const canStock = ['manager', 'magasinier'].includes(role);
  const canClients = ['manager', 'caissier'].includes(role);
  const canPayments = ['manager', 'caissier'].includes(role);
  const stockTotal = (data.produits || []).reduce((sum, produit) => sum + Number(produit.quantite_stock || 0), 0);
  const stockAlerts = alertes.length || (data.produits || []).filter((produit) => produit.statut_stock && produit.statut_stock !== 'OK').length;
  const monthlyCash = Number(stats.argent_recu_mois ?? paymentTotal);
  const dashboardKpis = [
    canSales && { icon: CreditCard, tone: 'orange', label: 'Total vendu ce mois', value: moneySmart(stats.ca_mois_en_cours), page: 'ventes' },
    canPayments && { icon: WalletCards, tone: 'green', label: 'Argent deja recu', value: moneySmart(monthlyCash), page: 'paiements' },
    canSales && { icon: Coins, tone: 'blue', label: 'Cout des produits vendus', value: moneySmart(stats.cout_achat_mois), page: 'rapports' },
    canSales && { icon: BarChart3, tone: Number(stats.resultat_mois || 0) >= 0 ? 'green' : 'danger', label: Number(stats.resultat_mois || 0) >= 0 ? 'Gain du mois' : 'Perte du mois', value: moneySmart(stats.resultat_mois), page: 'rapports', negative: Number(stats.resultat_mois || 0) < 0 },
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
      {canSales && (
        <div className="finance-explainer">
          <div>
            <strong>D'ou viennent ces montants ?</strong>
            <span>Total vendu ce mois = total TTC des factures creees ce mois-ci.</span>
            <span>Argent deja recu = paiements deja enregistres ce mois-ci.</span>
            <span>Cout des produits vendus = quantite vendue x prix d'achat du produit.</span>
          </div>
          <div>
            <strong>Calcul simple</strong>
            <span>Gain du mois = ventes hors taxe - cout des produits vendus.</span>
            <span>Une facture peut etre creee sans etre totalement payee, donc le total vendu et l'argent recu peuvent etre differents.</span>
          </div>
        </div>
      )}

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
                  <strong>{paymentPercent}%</strong>
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
              {Number(stats.resultat_mois || 0) >= 0 ? 'Benefice mois en cours' : 'Perte mois en cours'} {moneySmart(stats.resultat_mois)}
            </span>
          </div>
          <div className="result-summary-grid">
            <article><span>Ventes HT</span><strong>{moneySmart(stats.ventes_ht_mois)}</strong></article>
            <article><span>Cout achat</span><strong>{moneySmart(stats.cout_achat_mois)}</strong></article>
            <article><span>Resultat</span><strong className={Number(stats.resultat_mois || 0) >= 0 ? 'profit' : 'loss'}>{moneySmart(stats.resultat_mois)}</strong></article>
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
          {topProducts.length ? topProducts.map((product, index) => {
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
          <span className="panel-pill">{(data.extra.mouvementsStock || []).length} mouvements</span>
        </div>
        <Table headers={['Produit', 'Type', 'Quantite', 'Fournisseur', 'Prix achat', 'Total', 'Date']} rows={(data.extra.mouvementsStock || []).map((m) => [
          m.produit_nom,
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
    const safeQuantity = Math.max(1, Number(quantite || 1));
    setLignes(normalizeLines(activeLines.map((ligne) => (
      ligne.produit_id === produit_id ? { ...ligne, quantite: safeQuantity } : ligne
    ))));
  };
  const updatePrice = (produit_id, prix) => {
    const safePrice = Number(prix);
    setLignes(normalizeLines(activeLines.map((ligne) => (
      ligne.produit_id === produit_id ? { ...ligne, prix: Number.isFinite(safePrice) ? safePrice : '' } : ligne
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
            </div>
            <div className="line-qty">
              <Input label="Quantite" type="number" min="1" value={ligne.quantite} onChange={(quantite) => updateQuantity(ligne.produit_id, quantite)} />
              <Input label="Prix vente unitaire" type="number" min="0" step="0.01" value={prixVente} onChange={(prix) => updatePrice(ligne.produit_id, prix)} />
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

function QuoteComposer({ form, setForm, clients, produits, submitLabel }) {
  const selectedClient = clients.find((client) => client.id_client === form.client_id) || clients[0];
  const subtotal = quoteTotal(form.lignes, produits);
  const totalTtc = subtotal * 1.16;
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
        <div><span>TVA estimee</span><strong>{money(totalTtc - subtotal)}</strong></div>
        <div className="quote-total"><span>Total TTC</span><strong>{money(totalTtc)}</strong></div>
      </aside>
      <button className="btn modal-submit">{submitLabel} <ArrowRight size={20} /></button>
    </div>
  );
}

function Clients({ api, notify, data, submit, searchQuery = '' }) {
  const [form, setForm] = useState({ nom: '', postnom: '', telephone: '' });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const clients = data.clients
    .filter((c) => `${c.nom} ${c.postnom || ''} ${c.telephone || ''}`.toLowerCase().includes(term))
    .filter((c) => {
      if (statusFilter === 'actifs') return Number(c.nombre_achats || 0) > 0;
      if (statusFilter === 'sans_achat') return Number(c.nombre_achats || 0) === 0;
      if (statusFilter === 'vip') return Number(c.ca_total || 0) >= 1000;
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
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <h3>Portefeuille clients</h3>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un client" />
            <select className="compact-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="tous">Tous</option>
              <option value="actifs">Actifs</option>
              <option value="sans_achat">Sans achat</option>
              <option value="vip">VIP</option>
            </select>
            <button className="btn secondary small" type="button" onClick={() => printTableDocument('Archive clients', ['Nom', 'Telephone', 'Achats', 'CA'], clients.map((c) => [`${c.nom} ${c.postnom || ''}`, c.telephone || '-', c.nombre_achats || 0, moneySmart(c.ca_total)]), { badge: 'ARCHIVE', tableTitle: 'Liste complete des clients', paper: 'page' })}><Printer size={16} /> Archiver</button>
            <button className="btn small" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Ajouter client</button>
          </div>
        </div>
        <Table headers={['Nom', 'Telephone', 'Achats', 'CA', 'Actions']} rows={clients.map((c) => [
          `${c.nom} ${c.postnom || ''}`,
          c.telephone || '-',
          c.nombre_achats || 0,
          money(c.ca_total),
          <RowActions
            onEdit={() => setEditing(c)}
            onPrint={() => printDocument('Fiche client', [['Nom', `${c.nom} ${c.postnom || ''}`], ['Telephone', c.telephone || '-'], ['Achats', c.nombre_achats || 0], ['CA', money(c.ca_total)]], { paper: 'page' })}
            onToggle={() => showHistory(c)}
            toggleLabel="Historique"
            onDelete={() => remove(c)}
          />
        ])} />
      </div>
      {creating && (
        <Modal title="Nouveau client" onClose={() => setCreating(false)}>
          <Form onSubmit={() => submit(async () => { await api('/clients', { method: 'POST', body: JSON.stringify(form) }); setForm({ nom: '', postnom: '', telephone: '' }); setCreating(false); notify('Client cree'); })}>
            <div className="form-row">
              <Input label="Nom" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
              <Input label="Postnom" value={form.postnom} onChange={(postnom) => setForm({ ...form, postnom })} />
            </div>
            <Input label="Telephone" value={form.telephone} onChange={(telephone) => setForm({ ...form, telephone })} />
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
  const emptyProductForm = { reference_produit: '', nom: '', categorie_id: '', unite: 'piece', photo_url: '', prix_ht: '', prix_achat: '', taux_tva: 16, quantite_stock: 0, seuil_alerte: 5 };
  const [form, setForm] = useState(emptyProductForm);
  const [stock, setStock] = useState({ id: '', fournisseur_id: '', quantite: 1, prix_achat: '', note: '' });
  const [creating, setCreating] = useState(false);
  const [stocking, setStocking] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [page, setPage] = useState(1);
  const categoryOptions = [['', 'Sans categorie'], ...data.categories.map((c) => [c.id_categorie, c.nom])];
  const canManageProducts = user?.role !== 'caissier';
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
            <h3>Meilleures ventes du catalogue</h3>
            <p>Produits classes selon le stock et les ventes de votre entreprise.</p>
          </div>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher produit ou categorie" />
            <select className="compact-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="tous">Tous les statuts</option>
              <option value="OK">OK</option>
              <option value="ALERTE">Alerte</option>
              <option value="RUPTURE">Rupture</option>
            </select>
            {canManageProducts && <button className="btn small" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Ajouter produit</button>}
            {canManageProducts && <button className="btn secondary small" type="button" onClick={() => setStocking(true)}><Package size={16} /> Approvisionnement</button>}
          </div>
        </div>
        {!canManageProducts && <div className="notice">Votre role permet de consulter les produits, sans ajout ni modification.</div>}
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
                    <span>{money(p.prix_ht)}</span>
                    <Badge>{p.statut_stock}</Badge>
                    <em>Stock {p.quantite_stock} {p.unite || 'piece'}</em>
                  </div>
                  <div className="actions">
                    {canManageProducts && <button className="action edit" type="button" title="Modifier" onClick={() => setEditing(p)}><Edit3 size={17} /></button>}
                    <button className="action print-action" type="button" title="Imprimer" onClick={() => printDocument('Fiche stock produit', [['Reference', p.reference_produit], ['Produit', p.nom], ['Prix HT', money(p.prix_ht)], ['Stock', p.quantite_stock], ['Statut', p.statut_stock]], { paper: 'page' })}><Printer size={17} /></button>
                    {user?.role === 'manager' && <button className="action delete" type="button" title="Supprimer" onClick={() => remove(p)}><Trash2 size={17} /></button>}
                  </div>
                </article>
              ))}
            </div>
            <div className="product-pagination">
              <button className="btn secondary small" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1}>
                <ChevronLeft size={16} /> Precedent
              </button>
              <strong>{produits.length} produit{produits.length > 1 ? 's' : ''}</strong>
              <button className="btn secondary small" type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages}>
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
        <Table headers={['Produit', 'Reference', 'Type', 'Quantite', 'Date']} rows={(data.extra.mouvementsStock || []).map((m) => [
          m.produit_nom,
          m.reference_produit,
          <Badge>{m.type_mouvement}</Badge>,
          m.quantite,
          formatDate(m.date_mouvement)
        ])} />
      </div>
      {creating && (
        <Modal title="Nouveau produit" onClose={() => setCreating(false)}>
          <Form onSubmit={() => submit(async () => { await api('/produits', { method: 'POST', body: JSON.stringify(form) }); setForm(emptyProductForm); setCreating(false); notify('Produit cree'); })}>
            <div className="form-row">
              <Input label="Designation" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
              <Select label="Categorie" value={form.categorie_id} onChange={(categorie_id) => setForm({ ...form, categorie_id })} options={categoryOptions} required={false} />
            </div>
            <div className="form-row">
              <Select label="Unite" value={form.unite} onChange={(unite) => setForm({ ...form, unite })} options={unitOptions} />
              <Input label="Prix d'achat unitaire (CMP)" type="number" step="0.01" value={form.prix_achat} onChange={(prix_achat) => setForm({ ...form, prix_achat })} placeholder="Prix d'achat initial" />
            </div>
            <PhotoInput label="URL de la photo du produit" value={form.photo_url} onChange={(photo_url) => setForm({ ...form, photo_url })} />
            <div className="form-row">
              <Input label="Prix de vente HT" type="number" value={form.prix_ht} onChange={(prix_ht) => setForm({ ...form, prix_ht })} required />
              <Input label="TVA %" type="number" value={form.taux_tva} onChange={(taux_tva) => setForm({ ...form, taux_tva })} />
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
        <Modal title="Approvisionnement" onClose={() => setStocking(false)}>
          <Form onSubmit={() => submit(async () => {
            await api(`/produits/${stock.id || data.produits[0]?.id_produit}/approvisionner`, { method: 'POST', body: JSON.stringify(stock) });
            setStock({ id: '', fournisseur_id: '', quantite: 1, prix_achat: '', note: '' });
            setStocking(false);
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
            <PhotoInput label="URL de la photo du produit" value={editing.photo_url || ''} onChange={(photo_url) => setEditing({ ...editing, photo_url })} />
            <div className="form-row">
              <Input label="Prix d'achat (CMP)" type="number" step="0.01" value={editing.prix_achat || ''} onChange={(prix_achat) => setEditing({ ...editing, prix_achat })} />
              <Input label="Prix de vente HT" type="number" value={editing.prix_ht || ''} onChange={(prix_ht) => setEditing({ ...editing, prix_ht })} required />
            </div>
            <div className="form-row">
              <Input label="TVA %" type="number" value={editing.taux_tva || 16} onChange={(taux_tva) => setEditing({ ...editing, taux_tva })} />
              <Input label="Seuil alerte" type="number" value={editing.seuil_alerte || 5} onChange={(seuil_alerte) => setEditing({ ...editing, seuil_alerte })} />
            </div>
            <button className="btn">Mettre a jour</button>
          </Form>
        </Modal>
      )}
    </>
  );
}

function Ventes({ api, notify, data, submit, searchQuery = '' }) {
  const emptyLine = () => ({ produit_id: '', quantite: 1 });
  const [form, setForm] = useState({ client_id: '', lignes: [emptyLine()] });
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
            <button className="btn small" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Nouvelle facture</button>
          </div>
        </div>
        <Table headers={['Facture', 'Client', 'Montant', 'Paye', 'Reste', 'Actions']} rows={ventesList.map((v) => [
          v.numero_facture,
          v.client_nom,
          money(v.montant_ttc),
          money(v.total_paye),
          money(v.reste_a_payer),
          <RowActions
            onEdit={() => startEdit(v)}
            onPrint={() => printDocument('Facture', [['Facture', v.numero_facture], ['Client', v.client_nom], ['Montant', money(v.montant_ttc)], ['Paye', money(v.total_paye)], ['Reste', money(v.reste_a_payer)]], { paper: 'page' })}
            onDelete={() => remove(v)}
          />
        ])} />
      </div>
      {creating && (
        <Modal title="Vente directe" onClose={() => setCreating(false)} className="quote-modal">
          <Form onSubmit={() => submit(async () => {
            const articles = form.lignes.filter((ligne) => ligne.produit_id).map((ligne) => ({ produit_id: ligne.produit_id, quantite: Math.max(1, Number(ligne.quantite || 1)), prix: Number(ligne.prix || 0) }));
            if (articles.length === 0) {
              notify('Selectionnez au moins un produit.');
              return;
            }
            await api('/ventes', { method: 'POST', body: JSON.stringify({ client_id: form.client_id || data.clients[0]?.id_client, articles }) });
            setCreating(false);
            notify('Facture creee');
          })}>
            <SearchableSelect label="Client" value={form.client_id} onChange={(client_id) => setForm({ ...form, client_id })} options={data.clients.map((c) => [c.id_client, `${c.nom} ${c.postnom || ''} ${c.telephone || ''}`])} placeholder="Rechercher client, postnom ou telephone" />
            <LineEditor lignes={form.lignes} setLignes={(lignes) => setForm({ ...form, lignes })} produits={data.produits} />
            <button className="btn modal-submit">Facturer <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier facture" onClose={() => setEditing(null)}>
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

function Paiements({ api, notify, data, submit, searchQuery = '' }) {
  const factures = data.ventes.filter((v) => Number(v.reste_a_payer) > 0);
  const [form, setForm] = useState({ vente_id: '', montant: '', mode_paiement: 'especes', reference_externe: '', telephone_payeur: '' });
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const filteredFactures = factures.filter((v) => `${v.numero_facture} ${v.client_nom || ''} ${v.reste_a_payer || ''}`.toLowerCase().includes(invoiceQuery.toLowerCase()));
  const selectedFacture = filteredFactures.find((v) => v.id_ventes === (form.vente_id || filteredFactures[0]?.id_ventes)) || factures.find((v) => v.id_ventes === form.vente_id);
  const mobileMoneyRequired = form.mode_paiement === 'mobile_money';
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const caisseRows = (data.extra.caisse || []).filter((r) => `${r.Date} ${r.Mode_Paiement} ${r.Total_Encaisse}`.toLowerCase().includes(term));
  const savePayment = () => {
    if (mobileMoneyRequired && (!form.reference_externe.trim() || !form.telephone_payeur.trim())) {
      notify('Reference et numero obligatoires pour Mobile Money');
      return;
    }
    submit(async () => {
      await api('/paiements', {
        method: 'POST',
        body: JSON.stringify({ ...form, vente_id: form.vente_id || filteredFactures[0]?.id_ventes || factures[0]?.id_ventes })
      });
      setCreating(false);
      notify('Paiement enregistre');
    });
  };
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <h3>Caisse du jour</h3>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher paiement" />
            <button className="btn small" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Nouveau paiement</button>
          </div>
        </div>
        <Table headers={['Date', 'Mode', 'Transactions', 'Total']} rows={caisseRows.map((r) => [formatDate(r.Date), r.Mode_Paiement, r.Nombre_Transactions, money(r.Total_Encaisse)])} />
      </div>
      {creating && (
        <Modal title="Encaisser un paiement" onClose={() => setCreating(false)}>
          <Form onSubmit={savePayment}>
            <SearchInput value={invoiceQuery} onChange={setInvoiceQuery} placeholder="Rechercher une facture ou un client" />
            <Select label="Facture" value={form.vente_id} onChange={(vente_id) => setForm({ ...form, vente_id })} options={filteredFactures.map((v) => [v.id_ventes, `${v.numero_facture} - ${v.client_nom} - reste ${money(v.reste_a_payer)}`])} />
            <div className="form-row">
              <Input label="Montant" type="number" value={form.montant} onChange={(montant) => setForm({ ...form, montant })} required />
              <Select label="Mode" value={form.mode_paiement} onChange={(mode_paiement) => setForm({ ...form, mode_paiement })} options={[['especes', 'Especes'], ['mobile_money', 'Mobile Money'], ['carte', 'Carte'], ['virement', 'Virement']]} />
            </div>
            {selectedFacture && (
              <div className="debt-preview">
                <span>Client debiteur</span>
                <strong>{selectedFacture.client_nom}</strong>
                <em>Reste a payer: {money(selectedFacture.reste_a_payer)}</em>
              </div>
            )}
            <div className="form-row">
              <Input label={mobileMoneyRequired ? 'Reference Mobile Money' : 'Reference'} value={form.reference_externe} onChange={(reference_externe) => setForm({ ...form, reference_externe })} required={mobileMoneyRequired} />
              <Input label={mobileMoneyRequired ? 'Numero Mobile Money' : 'Telephone payeur'} value={form.telephone_payeur} onChange={(telephone_payeur) => setForm({ ...form, telephone_payeur })} required={mobileMoneyRequired} />
            </div>
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
    const date = new Date(rawDate);
    return !Number.isNaN(date.getTime()) && date >= start && date <= end;
  });
}

function Rapports({ data, searchQuery = '', user }) {
  const source = data.extra;
  const term = searchQuery.trim().toLowerCase();
  const [period, setPeriod] = useState('mensuel');
  const [dateRange, setDateRange] = useState({ debut: '', fin: '' });
  const role = user?.role || 'manager';
  const canSalesReports = ['manager', 'caissier'].includes(role);
  const canStockReports = ['manager', 'magasinier'].includes(role);
  const canCashReports = ['manager', 'caissier'].includes(role);
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
  const livreCaisse = byPeriod(source.livreCaisse || [], ['date_paiement']).filter((r) => !term || `${r.numero_facture} ${r.client_nom || ''} ${r.mode_paiement || ''}`.toLowerCase().includes(term));
  const bilan = source.bilan || {};
  const stockValue = stock.reduce((sum, row) => sum + Number(row.valeur_stock_achat || 0), 0);
  const stockRisks = stock.filter((row) => String(row.statut || '').toUpperCase() !== 'OK').length;
  const reportTitle = role === 'magasinier' ? 'Rapports produits' : role === 'caissier' ? 'Rapports caisse' : 'Rapports';
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
            <p>Etat de sortie {periodText.toLowerCase()} pret pour impression.</p>
          </div>
          <div className="actions">
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
          {canSalesReports && <Stat label={Number(bilan.resultat || 0) >= 0 ? 'Benefice' : 'Perte'} value={moneySmart(bilan.resultat)} />}
          {canStockReports && <Stat label="A surveiller" value={stockRisks} />}
        </div>
      </div>
      {canSalesReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Dettes clients</h3><button className="btn print" onClick={() => printRows(`Dettes clients - ${periodText}`, ['Facture', 'Client', 'Du', 'Paye', 'Reste'], creances.map((r) => [r.numero_facture, r.client_nom, moneySmart(r.montant_du), moneySmart(r.montant_paye), moneySmart(r.reste_a_payer)]))}><Printer size={18} /> Imprimer</button></div><Table headers={['Facture', 'Client', 'Du', 'Paye', 'Reste']} rows={creances.map((r) => [r.numero_facture, r.client_nom, moneySmart(r.montant_du), moneySmart(r.montant_paye), moneySmart(r.reste_a_payer)])} /></div>}
      {canSalesReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Ventes</h3><button className="btn print" onClick={() => printRows('Ventes', ['Facture', 'Client', 'Montant', 'Reste'], factures.map((r) => [r.numero_facture, `${r.client_nom} ${r.client_postnom || ''}`, moneySmart(r.montant_ttc), moneySmart(r.reste_a_payer)]))}><Printer size={18} /> Imprimer</button></div><Table headers={['Facture', 'Client', 'Montant', 'Reste']} rows={factures.map((r) => [r.numero_facture, `${r.client_nom} ${r.client_postnom || ''}`, moneySmart(r.montant_ttc), moneySmart(r.reste_a_payer)])} /></div>}
      {canCashReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Livre de caisse</h3><button className="btn print" onClick={() => printRows(`Livre de caisse - ${periodText}`, ['Date', 'Facture', 'Client', 'Mode', 'Montant'], livreCaisse.map((r) => [formatDate(r.date_paiement), r.numero_facture, r.client_nom, r.mode_paiement, moneySmart(r.montant)]))}><Printer size={18} /> Imprimer</button></div><Table headers={['Date', 'Facture', 'Client', 'Mode', 'Montant']} rows={livreCaisse.map((r) => [formatDate(r.date_paiement), r.numero_facture, r.client_nom, r.mode_paiement, moneySmart(r.montant)])} /></div>}
      {canSalesReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Bilan</h3><button className="btn print" onClick={() => printRows(`Bilan - ${periodText}`, ['Ventes HT', 'Cout achat', 'Resultat', 'Factures'], [[moneySmart(bilan.ventes_ht), moneySmart(bilan.cout_achat), moneySmart(bilan.resultat), bilan.total_factures || 0]])}><Printer size={18} /> Imprimer</button></div><Table headers={['Ventes HT', 'Cout achat', 'Resultat', 'Factures']} rows={[[moneySmart(bilan.ventes_ht), moneySmart(bilan.cout_achat), <Badge>{Number(bilan.resultat || 0) >= 0 ? moneySmart(bilan.resultat) : moneySmart(bilan.resultat)}</Badge>, bilan.total_factures || 0]]} /></div>}
      {canSalesReports && <div className="panel report-table-panel"><div className="panel-heading"><h3>Journal</h3><button className="btn print" onClick={() => printRows(`Journal - ${periodText}`, ['Date', 'Reference', 'Libelle', 'Entree', 'Sortie'], journal.map((r) => [formatDate(r.date_operation), r.reference, r.libelle, moneySmart(r.entree), moneySmart(r.sortie)]))}><Printer size={18} /> Imprimer</button></div><Table headers={['Date', 'Reference', 'Libelle', 'Entree', 'Sortie']} rows={journal.map((r) => [formatDate(r.date_operation), r.reference, r.libelle, moneySmart(r.entree), moneySmart(r.sortie)])} /></div>}
      <div className="grid report-detail-grid">
        {canStockReports && <div className="panel report-table-panel inventory-panel">
          <div className="panel-heading">
            <h3>Inventaire</h3>
            <button className="btn print" onClick={() => printTableDocument('Fiche de stock', ['Produit', 'Stock', 'P. Achat (CMP)', 'Valeur (Achat)', 'Statut'], stock.map((r) => [r.nom, `${r.quantite_stock} ${r.unite || ''}`, moneySmart(r.prix_achat_moyen), moneySmart(r.valeur_stock_achat), r.statut]), { badge: 'INVENTAIRE', period: 'Inventaire courant', tableTitle: 'Etat du stock detaille' })}><Printer size={18} /> Imprimer</button>
          </div>
          <Table headers={['Produit', 'Stock', 'P. Achat (CMP)', 'Valeur (Achat)', 'Statut']} rows={stock.map((r) => [r.nom, `${r.quantite_stock} ${r.unite || ''}`, moneySmart(r.prix_achat_moyen), moneySmart(r.valeur_stock_achat), <Badge>{r.statut}</Badge>])} />
        </div>}
        {canSalesReports && <div className="panel">
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
  const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: 'User@123', role: 'caissier' });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [query, setQuery] = useState('');
  const roles = [['manager', 'Manager'], ['caissier', 'Caissier'], ['magasinier', 'Magasinier']];
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const users = (data.extra.utilisateurs || []).filter((u) => `${u.nom} ${u.email} ${u.role}`.toLowerCase().includes(term));
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
    setForm({ nom: '', email: '', mot_de_passe: 'User@123', role: 'caissier' });
    setCreating(false);
    notify('Utilisateur cree et email envoye');
  });
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
          <h3>Equipe</h3>
          <div className="actions">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher utilisateur" />
            <button className="btn small" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Nouvel utilisateur</button>
          </div>
        </div>
        <Table headers={['Nom', 'Email', 'Role', 'Statut', 'Actions']} rows={users.map((u) => [
          u.nom,
          u.email,
          u.role,
          <Badge>{u.actif ? 'actif' : 'suspendu'}</Badge>,
          <RowActions
            onEdit={() => setEditing({ ...u, mot_de_passe: '' })}
            onPrint={() => printDocument('Utilisateur', [['Nom', u.nom], ['Email', u.email], ['Role', u.role], ['Statut', u.actif ? 'actif' : 'suspendu']], { paper: 'page' })}
            onToggle={() => openHistory(u)}
            toggleLabel="Vision et historique"
            onDelete={canDeleteUser(u) ? () => remove(u) : null}
          />
        ])} />
      </div>
      {creating && (
        <Modal title="Nouvel utilisateur" onClose={() => setCreating(false)}>
          <Form onSubmit={create}>
            <Input label="Nom" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
            <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required />
            <Input label="Mot de passe temporaire" type="password" value={form.mot_de_passe} onChange={(mot_de_passe) => setForm({ ...form, mot_de_passe })} required />
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

function Mails({ api, notify, data, submit, user, searchQuery = '' }) {
  const status = data.extra.mailStatus || {};
  const [form, setForm] = useState({ to: '', subject: '', message: '' });
  const [creating, setCreating] = useState(null);
  const term = searchQuery.trim().toLowerCase();
  const messages = (data.extra.mailMessages || []).filter((row) => `${row.to_email || ''} ${row.sender_email || ''} ${row.subject || ''} ${row.status || ''}`.toLowerCase().includes(term));
  const isTeamNotification = creating === 'team';

  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-heading client-toolbar">
          <h3>Communications envoyees</h3>
          <div className="actions">
            <button className="btn secondary small" type="button" onClick={() => setCreating('team')}><Bell size={16} /> Message equipe</button>
            <button className="btn small" type="button" onClick={() => setCreating('email')}><Plus size={16} /> Nouveau message</button>
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
          <p>Expediteur courant: <strong>{user?.email || status.sender || 'Email utilisateur indisponible'}</strong></p>
          <p>Les nouveaux utilisateurs et managers recoivent automatiquement un email de bienvenue avec leurs acces temporaires.</p>
        </div>
      </div>
      {creating && (
        <Modal title={isTeamNotification ? "Message a toute l'equipe" : 'Nouveau message'} onClose={() => setCreating(null)}>
          <Form onSubmit={() => submit(async () => {
            const response = await api(isTeamNotification ? '/mail/notify-team' : '/mail/send', { method: 'POST', body: JSON.stringify(form) });
            setForm({ to: '', subject: '', message: '' });
            setCreating(null);
            notify(response.message || (isTeamNotification ? 'Notification equipe envoyee' : 'Email envoye'));
          })}>
            <div className="debt-preview">
              <span>Expediteur</span>
              <strong>{user?.email || 'Utilisateur en cours'}</strong>
            </div>
            {isTeamNotification ? (
              <div className="debt-preview">
                <span>Destination</span>
                <strong>Tous les utilisateurs actifs de l'entreprise</strong>
              </div>
            ) : (
              <Input label="Destinataire" type="email" value={form.to} onChange={(to) => setForm({ ...form, to })} required />
            )}
            <Input label="Sujet" value={form.subject} onChange={(subject) => setForm({ ...form, subject })} required />
            <label>Message
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </label>
            <button className="btn modal-submit">{isTeamNotification ? <Bell size={18} /> : <Mail size={18} />} Envoyer</button>
          </Form>
        </Modal>
      )}
    </div>
  );
}

function Fournisseurs({ api, notify, data, submit, searchQuery = '' }) {
  const emptyForm = { nom: '', telephone: '', email: '', adresse: '' };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const fournisseurs = (data.fournisseurs || []).filter((f) => `${f.nom} ${f.telephone || ''} ${f.email || ''}`.toLowerCase().includes(term));

  const create = () => submit(async () => {
    await api('/fournisseurs', { method: 'POST', body: JSON.stringify(form) });
    setForm(emptyForm);
    setCreating(false);
    notify('Fournisseur ajoute');
  });

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
            <button className="btn small" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Ajouter fournisseur</button>
          </div>
        </div>
        <Table headers={['Nom', 'Telephone', 'Email', 'Approvisionnements', 'Actions']} rows={fournisseurs.map((f) => [
          f.nom,
          f.telephone || '-',
          f.email || '-',
          f.total_approvisionnements || 0,
          <RowActions
            onEdit={() => setEditing(f)}
            onPrint={() => printDocument('Fournisseur', [['Nom', f.nom], ['Telephone', f.telephone || '-'], ['Email', f.email || '-'], ['Approvisionnements', f.total_approvisionnements || 0]], { paper: 'page' })}
            onDelete={() => remove(f)}
          />
        ])} />
      </div>
      {creating && (
        <Modal title="Nouveau fournisseur" onClose={() => setCreating(false)}>
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

function Categories({ api, notify, data, submit, searchQuery = '' }) {
  const emptyCategoryForm = { nom: '', description: '', photo_url: '' };
  const [form, setForm] = useState(emptyCategoryForm);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const term = `${searchQuery} ${query}`.trim().toLowerCase();
  const categories = data.categories.filter((c) => `${c.reference_categorie || ''} ${c.nom} ${c.description || ''}`.toLowerCase().includes(term));
  const save = () => submit(async () => {
    await api('/categories', { method: 'POST', body: JSON.stringify(form) });
    setForm(emptyCategoryForm);
    setCreating(false);
    notify('Categorie creee');
  });
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
            <button className="btn small" type="button" onClick={() => setCreating(true)}><Plus size={16} /> Nouvelle categorie</button>
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
                  <RowActions onEdit={() => setEditing(c)} onDelete={() => remove(c)} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      {creating && (
        <Modal title="Nouvelle categorie" onClose={() => setCreating(false)}>
          <Form onSubmit={save}>
            <Input label="Nom" value={form.nom} onChange={(nom) => setForm({ ...form, nom })} required />
            <Input label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
            <PhotoInput label="URL de la photo de la categorie" value={form.photo_url} onChange={(photo_url) => setForm({ ...form, photo_url })} />
            <button className="btn modal-submit">Enregistrer <ArrowRight size={20} /></button>
          </Form>
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier categorie" onClose={() => setEditing(null)}>
          <Form onSubmit={saveEdit}>
            <Input label="Nom" value={editing.nom || ''} onChange={(nom) => setEditing({ ...editing, nom })} required />
            <Input label="Description" value={editing.description || ''} onChange={(description) => setEditing({ ...editing, description })} />
            <PhotoInput label="URL de la photo de la categorie" value={editing.photo_url || ''} onChange={(photo_url) => setEditing({ ...editing, photo_url })} />
            <button className="btn">Mettre a jour</button>
          </Form>
        </Modal>
      )}
    </div>
  );
}

function Form({ children, onSubmit }) {
  return <form className="form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>{children}</form>;
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
  return <label>{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} {...props} /></label>;
}

function PhotoInput({ label, value, onChange }) {
  const loadFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result || '');
    reader.readAsDataURL(file);
  };

  return (
    <label>{label}
      <div className="photo-input">
        <input type="url" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Coller le lien de la photo" />
        <input type="file" accept="image/*" onChange={loadFile} />
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
