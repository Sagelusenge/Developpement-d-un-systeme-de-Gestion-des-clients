import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';

const API_URL = 'https://developpement-d-un-systeme-de-gestion.onrender.com/api';
const APP_NAME = 'Quincaillerie Centrale';

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline', roles: ['manager', 'caissier', 'magasinier'] },
  { id: 'clients', label: 'Clients', icon: 'people-outline', roles: ['manager', 'caissier'] },
  { id: 'produits', label: 'Produits', icon: 'cube-outline', roles: ['manager', 'magasinier', 'caissier'] },
  { id: 'fournisseurs', label: 'Fournisseurs', icon: 'briefcase-outline', roles: ['manager', 'magasinier', 'caissier'] },
  { id: 'ventes', label: 'Ventes', icon: 'cart-outline', roles: ['manager', 'caissier'] },
  { id: 'paiements', label: 'Paiements', icon: 'card-outline', roles: ['manager', 'caissier'] },
  { id: 'rapports', label: 'Rapports', icon: 'bar-chart-outline', roles: ['manager', 'caissier', 'magasinier'] }
];

const lightTheme = {
  bg: '#f3f5f9',
  card: '#fff',
  surface: '#fff',
  text: '#172033',
  muted: '#64748b',
  border: '#d9e0ec',
  input: '#f8fafc',
  primary: '#001342',
  primarySoft: '#eef3fb',
  accent: '#0b3b82',
  appbar: '#001342'
};

const darkTheme = {
  bg: '#08111f',
  card: '#f8fafc',
  surface: '#101b2d',
  text: '#172033',
  muted: '#a9b6ca',
  border: '#263750',
  input: '#f4f6fa',
  primary: '#f8fafc',
  primarySoft: '#1d2d47',
  accent: '#7fb0ff',
  appbar: '#050b16'
};

const printRows = async (title, rows) => {
  const body = rows.map(([label, value]) => `<tr><th>${label}</th><td>${value ?? '-'}</td></tr>`).join('');
  await Print.printAsync({
    html: `
      <html>
        <body style="font-family: Arial; padding: 24px;">
          <h1 style="color:#001342;">${title}</h1>
          <table style="width:100%; border-collapse:collapse;">
            ${body}
          </table>
          <style>
            th, td { border:1px solid #d9e0ec; padding:10px; text-align:left; }
            th { background:#f3f5f9; width:36%; }
          </style>
        </body>
      </html>`
  });
};

const money = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })} USD`;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const normalizeRole = (user) => user?.role || 'manager';

const statusTone = (value) => {
  const text = String(value || '').toLowerCase();
  if (text.includes('ok') || text.includes('paye') || text.includes('actif')) return styles.badgeOk;
  if (text.includes('alerte') || text.includes('partiel') || text.includes('attente')) return styles.badgeWarn;
  if (text.includes('rupture') || text.includes('impaye') || text.includes('suspendu')) return styles.badgeDanger;
  return styles.badgeNeutral;
};

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false, theme = lightTheme, right }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <TextInput
          value={String(value ?? '')}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={theme.muted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={[styles.input, { color: theme.text }]}
        />
        {right}
      </View>
    </View>
  );
}

function SelectLike({ label, value, options, onChange, theme = lightTheme }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentRow}>
        {options.map((option) => {
          const [id, text] = Array.isArray(option) ? option : [option, option];
          const active = String(value || '') === String(id || '');
          return (
            <TouchableOpacity key={String(id)} style={[styles.segment, { backgroundColor: theme.input, borderColor: theme.border }, active && styles.segmentActive]} onPress={() => onChange(id)}>
              <Text style={[styles.segmentText, { color: active ? '#fff' : theme.text }, active && styles.segmentTextActive]}>{text}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Card({ children, style, theme = lightTheme }) {
  return <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]}>{children}</View>;
}

function Badge({ children }) {
  return <Text style={[styles.badge, statusTone(children)]}>{children || '-'}</Text>;
}

function PrimaryButton({ children, onPress, disabled, tone = 'primary', icon }) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.button, tone === 'secondary' && styles.buttonSecondary, disabled && styles.buttonDisabled]}>
      {icon && <Ionicons name={icon} size={18} color={tone === 'secondary' ? '#001342' : '#fff'} />}
      <Text style={[styles.buttonText, tone === 'secondary' && styles.buttonSecondaryText]}>{children}</Text>
    </TouchableOpacity>
  );
}

function ActionButton({ icon, label, onPress, theme = lightTheme }) {
  return (
    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primarySoft, borderColor: theme.border }]} onPress={onPress}>
      <Ionicons name={icon} size={17} color={theme.accent} />
      <Text style={[styles.actionText, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function IntroSplash({ onDone }) {
  const scale = useRef(new Animated.Value(0.72)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 900, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true })
    ]).start();
    const timer = setTimeout(onDone, 1450);
    return () => clearTimeout(timer);
  }, [onDone, opacity, scale]);

  return (
    <SafeAreaView style={styles.splash}>
      <Animated.View style={[styles.splashLogo, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.splashLogoText}>QC</Text>
      </Animated.View>
      <Animated.Text style={[styles.splashTitle, { opacity }]}>{APP_NAME}</Animated.Text>
      <Animated.Text style={[styles.splashSub, { opacity }]}>Gestion commerciale mobile</Animated.Text>
    </SafeAreaView>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('meshe.munihire@quincaillerie-centrale.cd');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() })
      });
      const body = await response.json();
      if (!response.ok || body.success === false || !body.token) {
        throw new Error(body.message || 'Connexion impossible');
      }
      onLogin(body.token, body.user);
    } catch (error) {
      Alert.alert('Connexion', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.loginShell}>
      <StatusBar barStyle="light-content" backgroundColor="#001342" />
      <View style={styles.loginHero}>
        <Text style={styles.brandMark}>QC</Text>
        <Text style={styles.loginTitle}>{APP_NAME}</Text>
        <Text style={styles.loginSubtitle}>Application mobile de gestion commerciale</Text>
      </View>
      <Card style={styles.loginCard}>
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={(
            <TouchableOpacity onPress={() => setShowPassword((value) => !value)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#475569" />
            </TouchableOpacity>
          )}
        />
        <PrimaryButton icon="log-in-outline" onPress={submit} disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</PrimaryButton>
      </Card>
    </SafeAreaView>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const [data, setData] = useState({
    clients: [],
    produits: [],
    categories: [],
    fournisseurs: [],
    ventes: [],
    paiements: [],
    extra: {}
  });
  const [loading, setLoading] = useState(false);
  const role = normalizeRole(user);
  const nav = pages.filter((item) => item.roles.includes(role));
  const theme = darkMode ? darkTheme : lightTheme;

  const api = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.success === false) throw new Error(body.message || `Erreur ${response.status}`);
    return body;
  }, [token]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const tasks = [
        api('/clients').then((r) => ['clients', r.data || []]).catch(() => ['clients', []]),
        api('/produits').then((r) => ['produits', r.data || []]).catch(() => ['produits', []]),
        api('/categories').then((r) => ['categories', r.data || []]).catch(() => ['categories', []]),
        api('/fournisseurs').then((r) => ['fournisseurs', r.data || []]).catch(() => ['fournisseurs', []]),
        api('/ventes').then((r) => ['ventes', r.data || []]).catch(() => ['ventes', []]),
        api('/paiements').then((r) => ['paiements', r.data || []]).catch(() => ['paiements', []]),
        api('/dashboard/stats').then((r) => ['stats', r.data || {}]).catch(() => ['stats', {}]),
        api('/dashboard/ventes-mensuelles').then((r) => ['ventesMensuelles', r.data || []]).catch(() => ['ventesMensuelles', []]),
        api('/dashboard/resultat-mensuel').then((r) => ['resultatMensuel', r.data || []]).catch(() => ['resultatMensuel', []]),
        api('/dashboard/alertes-stock').then((r) => ['alertes', r.data || []]).catch(() => ['alertes', []]),
        api('/rapports/factures').then((r) => ['facturesRapport', r.data || []]).catch(() => ['facturesRapport', []]),
        api('/rapports/livre-caisse').then((r) => ['livreCaisse', r.data || []]).catch(() => ['livreCaisse', []]),
        api('/rapports/bilan').then((r) => ['bilan', r.data || {}]).catch(() => ['bilan', {}])
      ];
      const entries = await Promise.all(tasks);
      const next = { clients: [], produits: [], categories: [], fournisseurs: [], ventes: [], paiements: [], extra: {} };
      entries.forEach(([key, value]) => {
        if (key in next) next[key] = value;
        else next.extra[key] = value;
      });
      setData(next);
    } catch (error) {
      Alert.alert('Chargement', error.message);
    } finally {
      setLoading(false);
    }
  }, [api, token]);

  useEffect(() => { load(); }, [load]);

  const submit = async (task, message = 'Operation reussie') => {
    try {
      await task();
      Alert.alert('Succes', message);
      await load();
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setPage('dashboard');
    setSearch('');
  };

  if (booting) return <IntroSplash onDone={() => setBooting(false)} />;
  if (!token) return <LoginScreen onLogin={(nextToken, nextUser) => { setToken(nextToken); setUser(nextUser); }} />;

  return (
    <SafeAreaView style={[styles.shell, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.appbar} />
      <View style={[styles.appbar, { backgroundColor: theme.appbar }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.appbarTitleWrap}>
          <Text style={styles.appbarTitle}>{pages.find((item) => item.id === page)?.label || APP_NAME}</Text>
          <Text style={styles.appbarSubtitle}>{user?.nom || user?.email || APP_NAME}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => setDarkMode((value) => !value)}>
          <Ionicons name={darkMode ? 'sunny-outline' : 'moon-outline'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#001342" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher..."
          placeholderTextColor={theme.muted}
          style={[styles.search, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {loading && <ActivityIndicator color="#001342" style={styles.loader} />}
        <Screen page={page} data={data} api={api} submit={submit} search={search} user={user} setPage={setPage} theme={theme} />
      </ScrollView>

      <BottomBar nav={nav.slice(0, 5)} page={page} theme={theme} setPage={(id) => { setPage(id); setSearch(''); }} />

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.drawerScrim} onPress={() => setMenuOpen(false)}>
          <Pressable style={[styles.drawer, { backgroundColor: theme.card }]}>
            <Text style={styles.drawerBrand}>QC</Text>
            <Text style={[styles.drawerTitle, { color: theme.text }]}>{APP_NAME}</Text>
            <Text style={[styles.drawerUser, { color: theme.muted }]}>{role.toUpperCase()}</Text>
            {nav.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.drawerItem, page === item.id && styles.drawerItemActive]} onPress={() => { setPage(item.id); setSearch(''); setMenuOpen(false); }}>
                <Ionicons name={item.icon} size={19} color={page === item.id ? '#fff' : theme.accent} />
                <Text style={[styles.drawerItemText, { color: theme.text }, page === item.id && styles.drawerItemTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <PrimaryButton tone="secondary" onPress={logout}>Deconnexion</PrimaryButton>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function BottomBar({ nav, page, setPage, theme = lightTheme }) {
  return (
    <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {nav.map((item) => (
        <TouchableOpacity key={item.id} style={[styles.bottomItem, page === item.id && styles.bottomItemActive]} onPress={() => setPage(item.id)}>
          <Ionicons name={item.icon} size={20} color={page === item.id ? '#001342' : theme.muted} />
          <Text style={[styles.bottomText, { color: theme.muted }, page === item.id && styles.bottomTextActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Screen(props) {
  const map = {
    dashboard: Dashboard,
    clients: Clients,
    produits: Produits,
    fournisseurs: Fournisseurs,
    ventes: Ventes,
    paiements: Paiements,
    rapports: Rapports
  };
  const Component = map[props.page] || Dashboard;
  return <Component {...props} />;
}

function Dashboard({ data, setPage }) {
  const stats = data.extra.stats || {};
  const ventes = data.extra.ventesMensuelles || [];
  const resultat = data.extra.resultatMensuel || [];
  const maxVente = Math.max(...ventes.map((item) => Number(item.total || 0)), 1);
  const maxResult = Math.max(...resultat.map((item) => Math.abs(Number(item.resultat || 0))), 1);
  const kpis = [
    ['Ventes facturees', money(stats.ca_mois_en_cours), 'ventes'],
    ['Argent encaisse', money(stats.argent_recu_mois), 'paiements'],
    ['Cout marchandises', money(stats.cout_achat_mois), 'rapports'],
    ['Benefice brut', money(stats.resultat_mois), 'rapports']
  ];

  return (
    <View>
      <View style={styles.kpiGrid}>
        {kpis.map(([label, value, target]) => (
          <TouchableOpacity key={label} style={styles.kpiCard} onPress={() => setPage(target)}>
            <Text style={styles.kpiLabel}>{label}</Text>
            <Text style={styles.kpiValue}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Ventes des 6 derniers mois</Text>
        <View style={styles.chartRow}>
          {ventes.map((row) => (
            <View key={row.mois} style={styles.chartColumn}>
              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, { height: Math.max(6, (Number(row.total || 0) / maxVente) * 120) }]} />
              </View>
              <Text style={styles.chartLabel}>{row.mois}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Resultat mensuel</Text>
        {resultat.map((row) => {
          const value = Number(row.resultat || 0);
          return (
            <View key={row.mois} style={styles.resultRow}>
              <Text style={styles.resultMonth}>{row.mois}</Text>
              <View style={styles.resultTrack}>
                <View style={[value >= 0 ? styles.resultFill : styles.resultFillLoss, { width: `${Math.max(4, Math.abs(value) / maxResult * 100)}%` }]} />
              </View>
              <Text style={styles.resultValue}>{money(value)}</Text>
            </View>
          );
        })}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Dernieres factures</Text>
        {(data.ventes || []).slice(0, 5).map((vente) => (
          <View key={vente.id_ventes} style={styles.listLine}>
            <View>
              <Text style={styles.lineTitle}>{vente.numero_facture}</Text>
              <Text style={styles.lineMeta}>{vente.client_nom || '-'} - {formatDate(vente.date_vente)}</Text>
            </View>
            <Text style={styles.lineAmount}>{money(vente.montant_ttc)}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

function Clients({ data, api, submit, search, theme = lightTheme }) {
  const [form, setForm] = useState({ nom: '', postnom: '', telephone: '' });
  const rows = (data.clients || []).filter((client) => `${client.nom || ''} ${client.postnom || ''} ${client.telephone || ''}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <View>
      <Card>
        <Text style={styles.sectionTitle}>Ajouter client</Text>
        <Field label="Nom" value={form.nom} onChangeText={(nom) => setForm({ ...form, nom })} />
        <Field label="Postnom" value={form.postnom} onChangeText={(postnom) => setForm({ ...form, postnom })} />
        <Field label="Telephone" value={form.telephone} onChangeText={(telephone) => setForm({ ...form, telephone })} keyboardType="phone-pad" />
        <PrimaryButton onPress={() => submit(async () => {
          await api('/clients', { method: 'POST', body: JSON.stringify(form) });
          setForm({ nom: '', postnom: '', telephone: '' });
        }, 'Client ajoute')}>Enregistrer</PrimaryButton>
      </Card>
      {rows.map((client) => (
        <Card key={client.id_client}>
          <Text style={styles.lineTitle}>{client.nom} {client.postnom || ''}</Text>
          <Text style={styles.lineMeta}>{client.telephone || '-'}</Text>
          <View style={styles.metaGrid}>
            <Text style={styles.metaPill}>Achats: {client.nombre_achats || 0}</Text>
            <Text style={styles.metaPill}>CA: {money(client.ca_total)}</Text>
          </View>
          <View style={styles.actionRow}>
            <ActionButton theme={theme} icon="print-outline" label="Imprimer" onPress={() => printRows('Fiche client', [
              ['Nom', `${client.nom} ${client.postnom || ''}`],
              ['Telephone', client.telephone || '-'],
              ['Achats', client.nombre_achats || 0],
              ['CA', money(client.ca_total)]
            ])} />
          </View>
        </Card>
      ))}
    </View>
  );
}

function Produits({ data, api, submit, search, theme = lightTheme }) {
  const [form, setForm] = useState({ nom: '', categorie_id: '', unite: 'piece', prix_ht: '', prix_achat: '', taux_tva: '16', quantite_stock: '0', seuil_alerte: '5' });
  const [stock, setStock] = useState({ id: '', fournisseur_id: '', quantite: '1', prix_achat: '', note: '' });
  const [statusFilter, setStatusFilter] = useState('tous');
  const products = (data.produits || [])
    .filter((product) => `${product.nom || ''} ${product.reference_produit || ''} ${product.categorie_nom || ''}`.toLowerCase().includes(search.toLowerCase()))
    .filter((product) => statusFilter === 'tous' || product.statut_stock === statusFilter);
  const categoryOptions = [['', 'Sans categorie'], ...(data.categories || []).map((item) => [item.id_categorie, item.nom])];
  const productOptions = (data.produits || []).map((item) => [item.id_produit, item.nom]);
  const supplierOptions = (data.fournisseurs || []).map((item) => [item.id_fournisseur, item.nom]);

  return (
    <View>
      <Card>
        <Text style={styles.sectionTitle}>Ajouter produit</Text>
        <Field label="Designation" value={form.nom} onChangeText={(nom) => setForm({ ...form, nom })} />
        <SelectLike label="Categorie" value={form.categorie_id} options={categoryOptions} onChange={(categorie_id) => setForm({ ...form, categorie_id })} />
        <SelectLike label="Unite" value={form.unite} options={['piece', 'kilogramme', 'carton', 'sac', 'litre', 'metre']} onChange={(unite) => setForm({ ...form, unite })} />
        <Field label="Prix achat" value={form.prix_achat} onChangeText={(prix_achat) => setForm({ ...form, prix_achat })} keyboardType="numeric" />
        <Field label="Prix vente HT" value={form.prix_ht} onChangeText={(prix_ht) => setForm({ ...form, prix_ht })} keyboardType="numeric" />
        <Field label="Stock initial" value={form.quantite_stock} onChangeText={(quantite_stock) => setForm({ ...form, quantite_stock })} keyboardType="numeric" />
        <PrimaryButton onPress={() => submit(async () => {
          await api('/produits', { method: 'POST', body: JSON.stringify(form) });
          setForm({ nom: '', categorie_id: '', unite: 'piece', prix_ht: '', prix_achat: '', taux_tva: '16', quantite_stock: '0', seuil_alerte: '5' });
        }, 'Produit ajoute')}>Ajouter produit</PrimaryButton>
      </Card>

      <SelectLike theme={theme} label="Filtrer stock" value={statusFilter} options={['tous', 'OK', 'ALERTE', 'RUPTURE']} onChange={setStatusFilter} />

      <Card>
        <Text style={styles.sectionTitle}>Approvisionnement</Text>
        <SelectLike label="Produit" value={stock.id} options={productOptions} onChange={(id) => setStock({ ...stock, id })} />
        <SelectLike label="Fournisseur" value={stock.fournisseur_id} options={supplierOptions} onChange={(fournisseur_id) => setStock({ ...stock, fournisseur_id })} />
        <Field label="Quantite" value={stock.quantite} onChangeText={(quantite) => setStock({ ...stock, quantite })} keyboardType="numeric" />
        <Field label="Prix achat unitaire" value={stock.prix_achat} onChangeText={(prix_achat) => setStock({ ...stock, prix_achat })} keyboardType="numeric" />
        <PrimaryButton onPress={() => submit(async () => {
          const id = stock.id || data.produits?.[0]?.id_produit;
          await api(`/produits/${id}/approvisionner`, { method: 'POST', body: JSON.stringify(stock) });
          setStock({ id: '', fournisseur_id: '', quantite: '1', prix_achat: '', note: '' });
        }, 'Stock mis a jour')}>Approvisionner</PrimaryButton>
      </Card>

      {products.map((product) => (
        <Card key={product.id_produit}>
          <View style={styles.listLine}>
            <View style={styles.flex}>
              <Text style={styles.lineTitle}>{product.nom}</Text>
              <Text style={styles.lineMeta}>{product.reference_produit} - {product.categorie_nom || 'Sans categorie'}</Text>
            </View>
            <Badge>{product.statut_stock}</Badge>
          </View>
          <View style={styles.metaGrid}>
            <Text style={styles.metaPill}>Stock: {product.quantite_stock} {product.unite || 'piece'}</Text>
            <Text style={styles.metaPill}>Vente: {money(product.prix_ht)}</Text>
            <Text style={styles.metaPill}>Achat: {money(product.prix_achat)}</Text>
          </View>
          <View style={styles.actionRow}>
            <ActionButton theme={theme} icon="print-outline" label="Imprimer" onPress={() => printRows('Fiche produit', [
              ['Reference', product.reference_produit],
              ['Produit', product.nom],
              ['Stock', `${product.quantite_stock} ${product.unite || 'piece'}`],
              ['Prix vente', money(product.prix_ht)],
              ['Prix achat', money(product.prix_achat)],
              ['Statut', product.statut_stock]
            ])} />
          </View>
        </Card>
      ))}
    </View>
  );
}

function Fournisseurs({ data, api, submit, search, theme = lightTheme }) {
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', adresse: '' });
  const rows = (data.fournisseurs || []).filter((item) => `${item.nom || ''} ${item.telephone || ''} ${item.email || ''}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <View>
      <Card>
        <Text style={styles.sectionTitle}>Ajouter fournisseur</Text>
        <Field label="Nom" value={form.nom} onChangeText={(nom) => setForm({ ...form, nom })} />
        <Field label="Telephone" value={form.telephone} onChangeText={(telephone) => setForm({ ...form, telephone })} keyboardType="phone-pad" />
        <Field label="Email" value={form.email} onChangeText={(email) => setForm({ ...form, email })} keyboardType="email-address" />
        <Field label="Adresse" value={form.adresse} onChangeText={(adresse) => setForm({ ...form, adresse })} />
        <PrimaryButton onPress={() => submit(async () => {
          await api('/fournisseurs', { method: 'POST', body: JSON.stringify(form) });
          setForm({ nom: '', telephone: '', email: '', adresse: '' });
        }, 'Fournisseur ajoute')}>Enregistrer</PrimaryButton>
      </Card>
      {rows.map((item) => (
        <Card key={item.id_fournisseur}>
          <Text style={styles.lineTitle}>{item.nom}</Text>
          <Text style={styles.lineMeta}>{item.telephone || '-'} - {item.email || '-'}</Text>
          <View style={styles.metaGrid}>
            <Text style={styles.metaPill}>Achats: {money(item.total_achats)}</Text>
            <Text style={styles.metaPill}>Appro: {item.total_approvisionnements || 0}</Text>
          </View>
          <View style={styles.actionRow}>
            <ActionButton theme={theme} icon="print-outline" label="Imprimer" onPress={() => printRows('Fiche fournisseur', [
              ['Nom', item.nom],
              ['Telephone', item.telephone || '-'],
              ['Email', item.email || '-'],
              ['Adresse', item.adresse || '-'],
              ['Achats', money(item.total_achats)],
              ['Approvisionnements', item.total_approvisionnements || 0]
            ])} />
          </View>
        </Card>
      ))}
    </View>
  );
}

function Ventes({ data, api, submit, search, setPage, theme = lightTheme }) {
  const [form, setForm] = useState({ client_id: '', produit_id: '', quantite: '1', prix_unitaire_ht: '' });
  const rows = (data.ventes || []).filter((vente) => `${vente.numero_facture || ''} ${vente.client_nom || ''}`.toLowerCase().includes(search.toLowerCase()));
  const clientOptions = (data.clients || []).map((item) => [item.id_client, `${item.nom} ${item.postnom || ''}`]);
  const productOptions = (data.produits || []).map((item) => [item.id_produit, `${item.nom} - ${money(item.prix_ht)}`]);

  const selectedProduct = data.produits.find((item) => item.id_produit === form.produit_id);
  const totalHt = Number(form.quantite || 0) * Number(form.prix_unitaire_ht || 0);
  const tva = totalHt * 0.16;
  const totalTtc = totalHt + tva;

  return (
    <View>
      <Card>
        <Text style={styles.sectionTitle}>Nouvelle vente simple</Text>
        <SelectLike label="Client" value={form.client_id} options={clientOptions} onChange={(client_id) => setForm({ ...form, client_id })} />
        <SelectLike label="Produit" value={form.produit_id} options={productOptions} onChange={(produit_id) => {
          const produit = data.produits.find((item) => item.id_produit === produit_id);
          setForm({ ...form, produit_id, prix_unitaire_ht: String(produit?.prix_ht || '') });
        }} />
        <Field label="Quantite" value={form.quantite} onChangeText={(quantite) => setForm({ ...form, quantite })} keyboardType="numeric" />
        <Field label="Prix vente HT" value={form.prix_unitaire_ht} onChangeText={(prix_unitaire_ht) => setForm({ ...form, prix_unitaire_ht })} keyboardType="numeric" />
        {selectedProduct && <Text style={styles.helpText}>Stock disponible: {selectedProduct.quantite_stock} {selectedProduct.unite || 'piece'}</Text>}
        <View style={styles.totalBox}>
          <View><Text style={styles.kpiLabel}>Total HT</Text><Text style={styles.totalValue}>{money(totalHt)}</Text></View>
          <View><Text style={styles.kpiLabel}>TVA 16%</Text><Text style={styles.totalValue}>{money(tva)}</Text></View>
          <View><Text style={styles.kpiLabel}>Total a payer</Text><Text style={styles.totalValueMain}>{money(totalTtc)}</Text></View>
        </View>
        <PrimaryButton icon="receipt-outline" onPress={() => submit(async () => {
          const body = {
            client_id: form.client_id,
            articles: [{ produit_id: form.produit_id, quantite: Number(form.quantite), prix: Number(form.prix_unitaire_ht) }]
          };
          await api('/ventes', { method: 'POST', body: JSON.stringify(body) });
          setForm({ client_id: '', produit_id: '', quantite: '1', prix_unitaire_ht: '' });
        }, 'Vente creee')}>Facturer</PrimaryButton>
        <View style={styles.actionRow}>
          <ActionButton theme={theme} icon="card-outline" label="Aller aux paiements" onPress={() => setPage('paiements')} />
        </View>
      </Card>
      {rows.map((vente) => (
        <Card key={vente.id_ventes}>
          <View style={styles.listLine}>
            <View>
              <Text style={styles.lineTitle}>{vente.numero_facture}</Text>
              <Text style={styles.lineMeta}>{vente.client_nom || '-'} - {formatDate(vente.date_vente)}</Text>
            </View>
            <Text style={styles.lineAmount}>{money(vente.montant_ttc)}</Text>
          </View>
          <Badge>{Number(vente.reste_a_payer || 0) <= 0 ? 'PAYE' : 'IMPAYE'}</Badge>
          <View style={styles.actionRow}>
            <ActionButton theme={theme} icon="print-outline" label="Imprimer" onPress={() => printRows('Facture', [
              ['Facture', vente.numero_facture],
              ['Client', vente.client_nom || '-'],
              ['Date', formatDate(vente.date_vente)],
              ['Montant TTC', money(vente.montant_ttc)],
              ['Reste a payer', money(vente.reste_a_payer)]
            ])} />
            <ActionButton theme={theme} icon="card-outline" label="Encaisser" onPress={() => setPage('paiements')} />
          </View>
        </Card>
      ))}
    </View>
  );
}

function Paiements({ data, api, submit, search, theme = lightTheme }) {
  const [form, setForm] = useState({ vente_id: '', montant: '', mode_paiement: 'especes', reference_externe: '', telephone_payeur: '' });
  const [modeFilter, setModeFilter] = useState('tous');
  const invoiceOptions = (data.ventes || []).map((item) => [item.id_ventes, `${item.numero_facture} - ${money(item.reste_a_payer ?? item.montant_ttc)}`]);
  const rows = (data.paiements || [])
    .filter((item) => `${item.numero_facture || ''} ${item.client_nom || ''} ${item.mode_paiement || ''}`.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => modeFilter === 'tous' || item.mode_paiement === modeFilter);
  return (
    <View>
      <Card>
        <Text style={styles.sectionTitle}>Nouveau paiement</Text>
        <SelectLike label="Facture" value={form.vente_id} options={invoiceOptions} onChange={(vente_id) => setForm({ ...form, vente_id })} />
        <Field label="Montant" value={form.montant} onChangeText={(montant) => setForm({ ...form, montant })} keyboardType="numeric" />
        <SelectLike label="Mode" value={form.mode_paiement} options={['especes', 'mobile_money', 'virement', 'carte']} onChange={(mode_paiement) => setForm({ ...form, mode_paiement })} />
        {form.mode_paiement === 'mobile_money' && (
          <>
            <Field label="Reference Mobile Money" value={form.reference_externe} onChangeText={(reference_externe) => setForm({ ...form, reference_externe })} />
            <Field label="Telephone payeur" value={form.telephone_payeur} onChangeText={(telephone_payeur) => setForm({ ...form, telephone_payeur })} keyboardType="phone-pad" />
          </>
        )}
        <PrimaryButton onPress={() => submit(async () => {
          await api('/paiements', { method: 'POST', body: JSON.stringify(form) });
          setForm({ vente_id: '', montant: '', mode_paiement: 'especes', reference_externe: '', telephone_payeur: '' });
        }, 'Paiement enregistre')}>Encaisser</PrimaryButton>
      </Card>
      <SelectLike theme={theme} label="Filtrer mode paiement" value={modeFilter} options={['tous', 'especes', 'mobile_money', 'virement', 'carte']} onChange={setModeFilter} />
      {rows.map((item) => (
        <Card key={item.id_paiement}>
          <View style={styles.listLine}>
            <View>
              <Text style={styles.lineTitle}>{item.numero_facture || item.vente_id}</Text>
              <Text style={styles.lineMeta}>{item.mode_paiement} - {formatDate(item.date_paiement)}</Text>
            </View>
            <Text style={styles.lineAmount}>{money(item.montant)}</Text>
          </View>
          <View style={styles.actionRow}>
            <ActionButton theme={theme} icon="print-outline" label="Imprimer recu" onPress={() => printRows('Recu de paiement', [
              ['Facture', item.numero_facture || item.vente_id],
              ['Mode', item.mode_paiement],
              ['Date', formatDate(item.date_paiement)],
              ['Montant', money(item.montant)]
            ])} />
          </View>
        </Card>
      ))}
    </View>
  );
}

function Rapports({ data, theme = lightTheme }) {
  const bilan = data.extra.bilan || {};
  const [reportFilter, setReportFilter] = useState('factures');
  const factures = data.extra.facturesRapport || [];
  const caisse = data.extra.livreCaisse || [];
  return (
    <View>
      <View style={styles.kpiGrid}>
        <Card style={styles.reportMini}><Text style={styles.kpiLabel}>Ventes HT</Text><Text style={styles.kpiValue}>{money(bilan.ventes_ht)}</Text></Card>
        <Card style={styles.reportMini}><Text style={styles.kpiLabel}>Cout achat</Text><Text style={styles.kpiValue}>{money(bilan.cout_achat)}</Text></Card>
        <Card style={styles.reportMini}><Text style={styles.kpiLabel}>Resultat</Text><Text style={styles.kpiValue}>{money(bilan.resultat)}</Text></Card>
        <Card style={styles.reportMini}><Text style={styles.kpiLabel}>Factures</Text><Text style={styles.kpiValue}>{bilan.total_factures || 0}</Text></Card>
      </View>
      <SelectLike theme={theme} label="Type de rapport" value={reportFilter} options={[['factures', 'Factures'], ['caisse', 'Livre caisse']]} onChange={setReportFilter} />
      <View style={styles.actionRow}>
        <ActionButton theme={theme} icon="print-outline" label="Imprimer bilan" onPress={() => printRows('Bilan', [
          ['Ventes HT', money(bilan.ventes_ht)],
          ['Cout achat', money(bilan.cout_achat)],
          ['Resultat', money(bilan.resultat)],
          ['Factures', bilan.total_factures || 0]
        ])} />
      </View>
      {reportFilter === 'factures' && (
      <Card>
        <Text style={styles.sectionTitle}>Factures</Text>
        {factures.slice(0, 15).map((item) => (
          <View key={item.id_ventes || item.numero_facture} style={styles.listLine}>
            <View>
              <Text style={styles.lineTitle}>{item.numero_facture}</Text>
              <Text style={styles.lineMeta}>{item.client_nom || '-'} - {formatDate(item.date_vente)}</Text>
            </View>
            <Text style={styles.lineAmount}>{money(item.montant_ttc)}</Text>
          </View>
        ))}
      </Card>
      )}
      {reportFilter === 'caisse' && (
      <Card>
        <Text style={styles.sectionTitle}>Livre de caisse</Text>
        {caisse.slice(0, 15).map((item) => (
          <View key={item.id_paiement || `${item.numero_facture}-${item.date_paiement}`} style={styles.listLine}>
            <View>
              <Text style={styles.lineTitle}>{item.numero_facture}</Text>
              <Text style={styles.lineMeta}>{item.client_nom || '-'} - {item.mode_paiement}</Text>
            </View>
            <Text style={styles.lineAmount}>{money(item.montant)}</Text>
          </View>
        ))}
      </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#f3f5f9' },
  splash: { alignItems: 'center', backgroundColor: '#001342', flex: 1, justifyContent: 'center', padding: 24 },
  splashLogo: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, height: 112, justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, width: 112 },
  splashLogoText: { color: '#001342', fontSize: 38, fontWeight: '900' },
  splashTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 22, textAlign: 'center' },
  splashSub: { color: '#c8d3e6', fontSize: 15, marginTop: 8, textAlign: 'center' },
  loginShell: { flex: 1, backgroundColor: '#001342', padding: 18, justifyContent: 'center' },
  loginHero: { marginBottom: 22 },
  brandMark: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 8, color: '#001342', fontSize: 24, fontWeight: '900', paddingHorizontal: 14, paddingVertical: 10, overflow: 'hidden' },
  loginTitle: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 20 },
  loginSubtitle: { color: '#c8d3e6', fontSize: 15, marginTop: 6 },
  loginCard: { backgroundColor: '#fff' },
  appbar: { alignItems: 'center', backgroundColor: '#001342', flexDirection: 'row', gap: 10, paddingBottom: 12, paddingHorizontal: 14, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12 },
  appbarTitleWrap: { flex: 1 },
  appbarTitle: { color: '#fff', fontSize: 19, fontWeight: '900' },
  appbarSubtitle: { color: '#b9c5dc', fontSize: 12, marginTop: 2 },
  iconButton: { alignItems: 'center', borderColor: '#24416f', borderRadius: 8, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  iconButtonText: { color: '#fff', fontWeight: '800' },
  logoutButton: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  logoutText: { color: '#001342', fontWeight: '900' },
  searchWrap: { backgroundColor: '#fff', borderBottomColor: '#dde4ef', borderBottomWidth: 1, padding: 12 },
  search: { backgroundColor: '#f4f6fa', borderColor: '#d3dbea', borderRadius: 8, borderWidth: 1, color: '#172033', fontSize: 15, padding: 12 },
  content: { flex: 1 },
  contentInner: { padding: 14, paddingBottom: 104 },
  loader: { marginVertical: 8 },
  card: { backgroundColor: '#fff', borderColor: '#d9e0ec', borderRadius: 8, borderWidth: 1, marginBottom: 12, padding: 14 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  kpiCard: { backgroundColor: '#fff', borderColor: '#d9e0ec', borderRadius: 8, borderWidth: 1, minHeight: 104, padding: 14, width: '48%' },
  kpiLabel: { color: '#536176', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  kpiValue: { color: '#001342', fontSize: 21, fontWeight: '900', marginTop: 12 },
  reportMini: { width: '48%', marginBottom: 8 },
  sectionTitle: { color: '#001342', fontSize: 18, fontWeight: '900', marginBottom: 12 },
  chartRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 10, height: 164, justifyContent: 'space-between' },
  chartColumn: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  chartTrack: { backgroundColor: '#edf2f7', borderRadius: 999, height: 128, justifyContent: 'flex-end', overflow: 'hidden', width: 18 },
  chartFill: { backgroundColor: '#0b3b82', borderRadius: 999, width: '100%' },
  chartLabel: { color: '#607086', fontSize: 11, fontWeight: '800', marginTop: 7 },
  resultRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 12 },
  resultMonth: { color: '#001342', fontWeight: '900', width: 38 },
  resultTrack: { backgroundColor: '#edf2f7', borderRadius: 999, flex: 1, height: 11, overflow: 'hidden' },
  resultFill: { backgroundColor: '#047857', borderRadius: 999, height: '100%' },
  resultFillLoss: { backgroundColor: '#b91c1c', borderRadius: 999, height: '100%' },
  resultValue: { color: '#172033', fontSize: 12, fontWeight: '900', width: 82, textAlign: 'right' },
  listLine: { alignItems: 'center', borderBottomColor: '#eef2f7', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  flex: { flex: 1 },
  lineTitle: { color: '#172033', fontSize: 15, fontWeight: '900' },
  lineMeta: { color: '#64748b', fontSize: 13, marginTop: 3 },
  lineAmount: { color: '#001342', fontSize: 14, fontWeight: '900', marginLeft: 10 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metaPill: { backgroundColor: '#f4f6fa', borderRadius: 8, color: '#263244', fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 7 },
  field: { marginBottom: 12 },
  fieldLabel: { color: '#334155', fontSize: 12, fontWeight: '900', marginBottom: 6, textTransform: 'uppercase' },
  inputWrap: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', minHeight: 48, paddingHorizontal: 12 },
  input: { color: '#172033', flex: 1, fontSize: 15, paddingVertical: 12 },
  eyeButton: { paddingHorizontal: 4, paddingVertical: 6 },
  segmentRow: { gap: 8, paddingVertical: 2 },
  segment: { backgroundColor: '#f4f6fa', borderColor: '#d7dfec', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  segmentActive: { backgroundColor: '#001342', borderColor: '#001342' },
  segmentText: { color: '#334155', fontSize: 12, fontWeight: '900' },
  segmentTextActive: { color: '#fff' },
  button: { alignItems: 'center', backgroundColor: '#002f70', borderRadius: 8, flexDirection: 'row', gap: 8, justifyContent: 'center', padding: 14 },
  buttonSecondary: { backgroundColor: '#eef3fb', borderColor: '#cfd8e6', borderWidth: 1 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '900' },
  buttonSecondaryText: { color: '#001342' },
  badge: { alignSelf: 'flex-start', borderRadius: 999, fontSize: 11, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  badgeOk: { backgroundColor: '#dcfce7', color: '#166534' },
  badgeWarn: { backgroundColor: '#fef3c7', color: '#854d0e' },
  badgeDanger: { backgroundColor: '#fee2e2', color: '#991b1b' },
  badgeNeutral: { backgroundColor: '#eef2f7', color: '#334155' },
  helpText: { color: '#64748b', fontSize: 13, marginBottom: 12 },
  totalBox: { backgroundColor: '#f4f7fb', borderColor: '#d9e0ec', borderRadius: 8, borderWidth: 1, gap: 10, marginBottom: 12, padding: 12 },
  totalValue: { color: '#172033', fontSize: 15, fontWeight: '900', marginTop: 4 },
  totalValueMain: { color: '#001342', fontSize: 22, fontWeight: '900', marginTop: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  actionButton: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 9 },
  actionText: { fontSize: 12, fontWeight: '900' },
  bottomBar: { backgroundColor: '#fff', borderTopColor: '#d9e0ec', borderTopWidth: 1, bottom: 0, flexDirection: 'row', left: 0, paddingBottom: 8, paddingHorizontal: 8, paddingTop: 8, position: 'absolute', right: 0 },
  bottomItem: { alignItems: 'center', borderRadius: 8, flex: 1, paddingVertical: 10 },
  bottomItemActive: { backgroundColor: '#eef3fb' },
  bottomText: { color: '#64748b', fontSize: 11, fontWeight: '900' },
  bottomTextActive: { color: '#001342' },
  drawerScrim: { backgroundColor: 'rgba(0, 0, 0, 0.38)', flex: 1 },
  drawer: { backgroundColor: '#fff', borderBottomRightRadius: 18, borderTopRightRadius: 18, flex: 1, padding: 18, width: '78%' },
  drawerBrand: { alignSelf: 'flex-start', backgroundColor: '#001342', borderRadius: 8, color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 20, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 9 },
  drawerTitle: { color: '#001342', fontSize: 20, fontWeight: '900', marginTop: 16 },
  drawerUser: { color: '#64748b', fontSize: 12, fontWeight: '900', marginBottom: 16, marginTop: 4 },
  drawerItem: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', gap: 10, marginBottom: 7, paddingHorizontal: 12, paddingVertical: 13 },
  drawerItemActive: { backgroundColor: '#001342' },
  drawerItemText: { color: '#334155', fontSize: 15, fontWeight: '900' },
  drawerItemTextActive: { color: '#fff' }
});
