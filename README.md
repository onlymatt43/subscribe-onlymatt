# Subscribe OnlyMatt

Système autonome de collecte d'emails avec bouton embeddable et API Vercel.

## Composants

- **API**: `POST /api/subscribe` (Vercel serverless)
- **Bouton**: `public/subscribe-button.js` (embeddable partout)
- **Database**: Turso (SQLite cloud)
- **Demo**: `public/index.html`

## Configuration requise

### Variables d'environnement (Vercel)

```bash
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-token
```

**Sans ces variables, l'API retournera une erreur 500.**

### Schéma de base de données

Le schéma est créé automatiquement au premier appel:

```sql
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  source TEXT NOT NULL,
  ip TEXT NOT NULL DEFAULT 'unknown',
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_source_idx
ON subscribers(email, source);
```

**Règle d'upsert**: Clé unique sur `(email, source)`. Si la paire existe déjà, mise à jour de `ip`, `user_agent`, `updated_at` au lieu d'insertion.

## Développement local

```bash
npm install
npm run dev
```

Puis ouvre:
- `http://localhost:3000/public/index.html` (demo principale)
- `http://localhost:3000/public/test.html` (page de test)

## Intégration du bouton

### Intégration basique

```html
<script src="https://subscribe-onlymatt.vercel.app/subscribe-button.js"></script>
```

Le bouton détecte automatiquement son domaine d'origine et poste vers `/api/subscribe` du même domaine.

### Intégration avec options

```html
<script>
  window.OM_SUBSCRIBE_SOURCE = 'instagram-bio';
  window.OM_SUBSCRIBE_API_BASE = 'https://subscribe-onlymatt.vercel.app';
</script>
<script src="https://subscribe-onlymatt.vercel.app/subscribe-button.js"></script>
```

**Options disponibles**:
- `OM_SUBSCRIBE_SOURCE`: Force une source spécifique (défaut: hostname actuel)
- `OM_SUBSCRIBE_API_BASE`: Force un backend différent (défaut: domaine du script)

## API

### Endpoint

`POST /api/subscribe`

### Headers

- `Content-Type: application/json`
- CORS activé (`*`)

### Payload

```json
{
  "email": "user@example.com",
  "source": "instagram-post",
  "website": ""
}
```

**Champs**:
- `email` (requis): Email de l'utilisateur
- `source` (optionnel): Source de la souscription (défaut: `direct-share`)
- `website` (honeypot): Si rempli, requête rejetée (protection anti-bot)

### Validations

- Email converti en lowercase
- Validation regex basique: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Emails jetables bloqués**: tempmail, guerrillamail, mailinator, 10minutemail, trashmail, yopmail, sharklasers, disposable, throwaway
- Source validée par regex: `/^[a-z0-9._-]{2,60}$/i`
- Honeypot: Si `website` non vide → bot détecté
- Capture automatique IP et User-Agent

### Réponses

**Succès (200)**:
```json
{
  "success": true,
  "message": "Email saved",
  "source": "instagram-post"
}
```

**Erreurs**:
- `400`: Email invalide/jetable ou bot détecté
  ```json
  { "error": "Invalid email" }
  { "error": "Disposable email refused" }
  { "error": "Bot detected" }
  ```
- `405`: Méthode non autorisée (uniquement POST/OPTIONS acceptés)
- `500`: Erreur serveur ou configuration Turso manquante

## Comportement du bouton

1. Vérifie `localStorage` → Si `hasSubscribed === 'true'`, n'affiche rien
2. Injecte overlay avec bouton "ENTER" centré
3. Au clic, affiche formulaire email
4. Soumission auto après 750ms d'inactivité dans le champ
5. Validation côté client (regex + emails jetables)
6. POST vers API
7. Affiche statut (succès vert / erreur rouge)
8. Si succès: marque `hasSubscribed` et ferme après 1s

## Déploiement Vercel

```bash
vercel --prod
```

Assure-toi d'avoir configuré les variables d'environnement dans Vercel:
- Settings → Environment Variables
- Ajoute `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN`

## Ce que le système ne fait pas

- ❌ Pas de double opt-in email
- ❌ Pas d'envoi newsletter automatique
- ❌ Pas de captcha visuel (utilise honeypot)
- ❌ Pas de panneau admin intégré
- ❌ Pas de suppression d'emails (RGPD à gérer manuellement via Turso)
