(function () {
  if (window.__omSubscribeLoaded) return;
  window.__omSubscribeLoaded = true;

  var apiBase = (window.OM_SUBSCRIBE_API_BASE || '').replace(/\/$/, '');
  var endpoint = (apiBase ? apiBase : 'https://connect.onlymatt.ca') + '/api/subscribe';
  var source = (window.OM_SUBSCRIBE_SOURCE || window.location.hostname || 'embed').toLowerCase();

  function init() {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:99999;font-family:system-ui,-apple-system,sans-serif;';

    var form = document.createElement('form');
    form.style.cssText = 'display:flex;gap:8px;background:#0b0b0b;border:1px solid #2a2a2a;padding:10px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);';

    var input = document.createElement('input');
    input.type = 'email';
    input.required = true;
    input.placeholder = 'your@email.com';
    input.style.cssText = 'background:#121212;color:#fff;border:1px solid #333;border-radius:8px;padding:10px;min-width:200px;outline:none;';

    var btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Subscribe';
    btn.style.cssText = 'background:#fff;color:#000;border:0;border-radius:8px;padding:10px 12px;font-weight:700;cursor:pointer;';

    var msg = document.createElement('div');
    msg.style.cssText = 'margin-top:8px;font-size:12px;color:#c9c9c9;min-height:16px;';

    form.appendChild(input);
    form.appendChild(btn);
    wrap.appendChild(form);
    wrap.appendChild(msg);
    document.body.appendChild(wrap);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      msg.textContent = '';
      btn.disabled = true;
      btn.textContent = '...';

      try {
        var res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: input.value.trim(), source: source })
        });
        var data = await res.json();
        if (!res.ok) {
          msg.style.color = '#ff6b6b';
          msg.textContent = data.error || 'Error';
        } else {
          msg.style.color = '#5ee07f';
          msg.textContent = data.message || 'Saved';
          input.value = '';
        }
      } catch (_) {
        msg.style.color = '#ff6b6b';
        msg.textContent = 'Network error';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Subscribe';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
