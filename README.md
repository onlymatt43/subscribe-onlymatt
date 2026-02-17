# Subscribe

Standalone subscribe system:
- API: `POST /api/subscribe`
- Button: `public/subscribe-button.js`

## Local

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/public/test.html`

## Embed button on any site

```html
<script>
  window.OM_SUBSCRIBE_API_BASE = 'https://your-subscribe-domain.com';
  window.OM_SUBSCRIBE_SOURCE = 'instagram-post';
</script>
<script src="https://your-subscribe-domain.com/subscribe-button.js"></script>
```

## API payload

```json
{
  "email": "user@example.com",
  "source": "instagram-post"
}
```
