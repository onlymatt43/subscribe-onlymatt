(function () {
  if (window.__omSubscribeLoaded) return;
  window.__omSubscribeLoaded = true;
  if (localStorage.getItem('hasSubscribed') === 'true') return;

  function getDefaultApiBase() {
    try {
      if (document.currentScript && document.currentScript.src) {
        return new URL(document.currentScript.src).origin;
      }
    } catch (_) {}
    return window.location.origin;
  }

  var apiBase = (window.OM_SUBSCRIBE_API_BASE || getDefaultApiBase()).replace(/\/$/, '');
  var endpoint = apiBase + '/api/subscribe';
  var source = (window.OM_SUBSCRIBE_SOURCE || window.location.hostname || 'embed').toLowerCase();
  var blockedPatterns = [
    /tempmail/i, /throwaway/i, /disposable/i,
    /guerrillamail/i, /mailinator/i, /10minutemail/i,
    /trashmail/i, /yopmail/i, /sharklasers/i
  ];

  function injectStyles() {
    if (document.getElementById('om-subscribe-styles')) return;

    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&display=swap';
    document.head.appendChild(fontLink);

    var style = document.createElement('style');
    style.id = 'om-subscribe-styles';
    style.textContent = '\
      .om-subscribe-root {\
        position: fixed;\
        inset: 0;\
        z-index: 99999;\
        display: flex;\
        align-items: center;\
        justify-content: center;\
        pointer-events: none;\
      }\
      .om-subscribe-panel {\
        pointer-events: auto;\
        width: min(92vw, 520px);\
        background: rgba(8, 8, 8, 0.95);\
        border: 1px solid rgba(255, 247, 77, 0.45);\
        border-radius: 14px;\
        box-shadow: 0 14px 44px rgba(0,0,0,0.45);\
        padding: 16px;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
      }\
      .om-enter-btn {\
        width: 100%;\
        border-radius: 10px;\
        border: 1px solid rgba(255, 247, 77, 0.6);\
        background: #101010;\
        color: #fff74d;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-weight: 800;\
        letter-spacing: 0.14em;\
        text-transform: uppercase;\
        cursor: pointer;\
      }\
      .om-enter-btn {\
        padding: 14px 16px;\
        font-size: clamp(14px, 2.8vw, 18px);\
      }\
      .om-subscribe-form {\
        display: none;\
        margin-top: 12px;\
      }\
      .om-subscribe-form.open {\
        display: grid;\
        gap: 10px;\
      }\
      .om-email-input {\
        width: 100%;\
        box-sizing: border-box;\
        padding: 12px 14px;\
        border-radius: 10px;\
        border: 1px solid #3f3f3f;\
        background: #121212;\
        color: #fff74d;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-weight: 700;\
        font-size: 14px;\
        outline: none;\
      }\
      .om-email-input::placeholder {\
        color: #bdb76b;\
      }\
      .om-email-input:focus {\
        border-color: #fff74d;\
      }\
      .om-legal-note {\
        margin: 0;\
        color: #d3cd58;\
        font-size: 11px;\
        line-height: 1.5;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-weight: 700;\
      }\
      .om-status {\
        margin: 2px 0 0 0;\
        min-height: 16px;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-size: 11px;\
        font-weight: 700;\
      }\
    ';
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();

    var root = document.createElement('div');
    root.className = 'om-subscribe-root';

    var panel = document.createElement('div');
    panel.className = 'om-subscribe-panel';

    var enterBtn = document.createElement('button');
    enterBtn.type = 'button';
    enterBtn.className = 'om-enter-btn';
    enterBtn.textContent = 'ENTER';

    var form = document.createElement('form');
    form.className = 'om-subscribe-form';

    var input = document.createElement('input');
    input.type = 'email';
    input.required = true;
    input.className = 'om-email-input';
    input.placeholder = 'enter your email';

    var note = document.createElement('p');
    note.className = 'om-legal-note';
    note.textContent = 'By dropping your email, you agree aux cookies, a notre vibe de confidentialite, et tu confirmes que tu es majeur selon les lois de ton pays.';

    var msg = document.createElement('p');
    msg.className = 'om-status';
    msg.style.color = '#d3cd58';
    msg.textContent = 'Type ton email, on connect auto.';

    var honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    honeypot.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';

    form.appendChild(input);
    form.appendChild(note);
    form.appendChild(msg);
    form.appendChild(honeypot);

    panel.appendChild(enterBtn);
    panel.appendChild(form);
    root.appendChild(panel);
    document.body.appendChild(root);

    enterBtn.addEventListener('click', function () {
      form.classList.add('open');
      enterBtn.style.display = 'none';
      input.focus();
    });

    var submitTimeout = null;
    var isSubmitting = false;
    var hasSubmitted = false;

    async function submitEmail() {
      if (isSubmitting || hasSubmitted) return;

      try {
        var email = input.value.trim().toLowerCase();
        if (!email) {
          msg.style.color = '#ff7a7a';
          msg.textContent = 'Email required';
          return;
        }
        var basicEmailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!basicEmailRegex.test(email)) {
          msg.style.color = '#d3cd58';
          msg.textContent = 'Complete ton email.';
          return;
        }
        if (blockedPatterns.some(function (p) { return p.test(email); })) {
          msg.style.color = '#ff7a7a';
          msg.textContent = 'Disposable email refused';
          return;
        }
        if (honeypot.value) {
          msg.style.color = '#ff7a7a';
          msg.textContent = 'Validation failed';
          return;
        }

        isSubmitting = true;
        msg.style.color = '#d3cd58';
        msg.textContent = 'Connecting...';

        var res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, source: source, website: honeypot.value || '' })
        });
        var data = await res.json();

        if (!res.ok) {
          isSubmitting = false;
          msg.style.color = '#ff7a7a';
          msg.textContent = data.error || 'Error';
        } else {
          hasSubmitted = true;
          msg.style.color = '#9cff77';
          msg.textContent = data.message || 'Email saved';
          localStorage.setItem('hasSubscribed', 'true');
          input.value = '';
          setTimeout(function () {
            root.remove();
          }, 1000);
        }
      } catch (_) {
        isSubmitting = false;
        msg.style.color = '#ff7a7a';
        msg.textContent = 'Network error';
      }
    }

    input.addEventListener('input', function () {
      if (submitTimeout) clearTimeout(submitTimeout);
      submitTimeout = setTimeout(function () {
        submitEmail();
      }, 750);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitEmail();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
