# Subscribe System - Specification Exacte

Ce document décrit exactement ce que fait le systeme `subscribe-onlymatt`.

## 1) Objectif

Le systeme collecte des emails via un bouton embeddable et les enregistre dans Turso.

## 2) Composants

- Bouton frontend embeddable:
  - `/Users/mathieucourchesne/onlymatt-ca/subscribe/public/subscribe-button.js`
- API backend:
  - `/Users/mathieucourchesne/onlymatt-ca/subscribe/api/subscribe.js`
- Acces base de donnees:
  - `/Users/mathieucourchesne/onlymatt-ca/subscribe/api/db.js`
- Page principale (demo active du bouton):
  - `/Users/mathieucourchesne/onlymatt-ca/subscribe/public/index.html`

## 3) Flux complet

1. Une page web charge `subscribe-button.js`.
2. Le script injecte un mini formulaire flottant (email + bouton Subscribe).
3. Au submit, le script envoie un `POST` JSON vers `/api/subscribe`.
4. L'API valide l'email.
5. L'API prepare la source (`source`) et lit l'IP/UA.
6. L'API appelle la couche DB pour `upsert` dans Turso.
7. Turso enregistre ou met a jour l'entree.
8. L'API retourne une reponse JSON (`success` ou `error`).
9. Le bouton affiche le statut a l'utilisateur.

## 4) Endpoint API

- Methode: `POST`
- URL: `/api/subscribe`
- CORS: ouvert (`*`)
- Payload attendu:

```json
{
  "email": "user@example.com",
  "source": "global"
}
```

## 5) Validation / normalisation

Dans `api/subscribe.js`:

- `email`:
  - requis
  - converti en lowercase
  - valide par regex email simple
- `source`:
  - si fournie et valide (regex), elle est conservee en lowercase
  - sinon fallback: `direct-share`

## 6) Base Turso

Variables requises (Vercel/env):

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Schema cree automatiquement:

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
```

Index unique:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_source_idx
ON subscribers(email, source);
```

## 7) Regle d'upsert

Cle unique: `(email, source)`.

- Si la paire `(email, source)` n'existe pas: insertion.
- Si elle existe deja: mise a jour de `ip`, `user_agent`, `updated_at`.

Donc:
- meme email avec source differente => nouvelle ligne.
- meme email + meme source => pas de doublon, ligne mise a jour.

## 8) Comportement du bouton (autonomie)

Dans `public/subscribe-button.js`:

- Le script detecte automatiquement son domaine d'origine (`document.currentScript.src`).
- Par defaut, il poste vers `https://[meme-domaine]/api/subscribe`.
- Optionnel:
  - `window.OM_SUBSCRIBE_API_BASE` pour forcer un autre backend.
  - `window.OM_SUBSCRIBE_SOURCE` pour forcer une source fixe.

Donc le systeme est autonome par defaut: meme domaine pour script + API.

## 9) Ce que le systeme ne fait pas

- Pas de double opt-in email.
- Pas d'envoi newsletter automatique.
- Pas de captcha.
- Pas de panneau admin inclus.
- Pas de variable `API_URL` obligatoire.

## 10) Reponses API actuelles

Succes:

```json
{ "success": true, "message": "Email saved", "source": "global" }
```

Erreurs possibles:

- `400` -> email invalide
- `405` -> methode non autorisee
- `500` -> erreur serveur / config Turso manquante / erreur DB

## 11) Snippet minimal d'integration

```html
<script src="https://subscribe-onlymatt.vercel.app/subscribe-button.js"></script>
```

Optionnel avec source fixe:

```html
<script>
  window.OM_SUBSCRIBE_SOURCE = 'global';
</script>
<script src="https://subscribe-onlymatt.vercel.app/subscribe-button.js"></script>
```
