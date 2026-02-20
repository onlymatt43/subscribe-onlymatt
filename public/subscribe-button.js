(function () {
  if (window.__omSubscribeLoaded) return;
  window.__omSubscribeLoaded = true;
  
  // Random background photo selection (must be before hasSubscribed check)
  var subscriptionPhotos = [
    'subscription_Onlymatt_1.png',
    'subscription_Onlymatt_2.png',
    'subscription_Onlymatt_3.png'
  ];
  var randomPhoto = subscriptionPhotos[Math.floor(Math.random() * subscriptionPhotos.length)];
  var backgroundImageUrl = 'https://onlymatt-public-zone.b-cdn.net/card/' + randomPhoto;
  
  // Show welcome back message for returning subscribers
  if (localStorage.getItem('hasSubscribed') === 'true') {
    var subscribedEmail = localStorage.getItem('subscribedEmail');
    if (subscribedEmail) {
      showWelcomeBack(subscribedEmail);
    }
    return;
  }

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

  function showWelcomeBack(email) {
    var username = email.split('@')[0];
    
    injectStyles();
    
    var root = document.createElement('div');
    root.className = 'om-subscribe-root';
    
    var panel = document.createElement('div');
    panel.className = 'om-subscribe-panel';
    panel.style.textAlign = 'center';
    panel.style.padding = '40px 20px';
    
    var welcomeMsg = document.createElement('div');
    welcomeMsg.style.cssText = 'font-family: "Montserrat", sans-serif; font-weight: 800; font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; color: #fff74d; margin-bottom: 12px;';
    welcomeMsg.textContent = 'WELCOME BACK';
    
    var usernameDiv = document.createElement('div');
    usernameDiv.style.cssText = 'font-family: "Montserrat", sans-serif; font-weight: 700; font-size: 18px; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.8);';
    usernameDiv.textContent = username;
    
    panel.appendChild(welcomeMsg);
    panel.appendChild(usernameDiv);
    root.appendChild(panel);
    document.body.appendChild(root);
    
    setTimeout(function() {
      root.style.transition = 'opacity 0.5s ease';
      root.style.opacity = '0';
      setTimeout(function() {
        root.remove();
      }, 500);
    }, 3000);
  }

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
        width: 100vw;\
        height: 100vh;\
        max-width: 100vw;\
        z-index: 99999;\
        display: flex;\
        align-items: center;\
        justify-content: center;\
        padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom)) 12px;\
        box-sizing: border-box;\
        pointer-events: none;\
      }\
      .om-subscribe-root::before {\
        content: "";\
        position: absolute;\
        inset: 0;\
        background-image: url("' + backgroundImageUrl + '");\
        background-size: cover;\
        background-position: center;\
        background-repeat: no-repeat;\
        pointer-events: none;\
      }\
      .om-subscribe-panel {\
        position: relative;\
        z-index: 10;\
        pointer-events: auto;\
        width: 100%;\
        max-width: min(520px, calc(100vw - 24px));\
        box-sizing: border-box;\
        overflow: hidden;\
        background: rgba(0, 0, 0, 0.4);\
        backdrop-filter: blur(20px) saturate(1.3);\
        -webkit-backdrop-filter: blur(20px) saturate(1.3);\
        border: 1px solid rgba(255, 247, 77, 0.15);\
        border-radius: 28px;\
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);\
        padding: 20px;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        display: flex;\
        flex-direction: column;\
        align-items: center;\
      }\
      .om-enter-btn {\
        display: inline-block;\
        width: auto;\
        box-sizing: border-box;\
        min-width: 0;\
        border-radius: 20px;\
        border: 1px solid rgba(255, 247, 77, 0.2);\
        background: rgba(255, 255, 255, 0.05);\
        backdrop-filter: blur(10px);\
        -webkit-backdrop-filter: blur(10px);\
        color: rgba(255, 247, 77, 0.9);\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-weight: 700;\
        letter-spacing: 0.1em;\
        text-transform: uppercase;\
        cursor: pointer;\
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(255, 247, 77, 0.05);\
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);\
      }\
      .om-enter-btn:hover {\
        transform: translateY(-1px);\
        background: rgba(255, 255, 255, 0.08);\
        border-color: rgba(255, 247, 77, 0.3);\
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(255, 247, 77, 0.1);\
        color: rgba(255, 247, 77, 1);\
      }\
      .om-enter-btn {\
        padding: 14px 32px;\
        font-size: clamp(14px, 2.8vw, 18px);\
      }\
      .om-subscribe-form {\
        display: none;\
        margin-top: 12px;\
        min-width: 0;\
        width: 100%;\
        box-sizing: border-box;\
      }\
      .om-subscribe-form.open {\
        display: grid;\
        gap: 10px;\
      }\
      .om-subscribe-form > * {\
        min-width: 0;\
      }\
      .om-email-input {\
        width: 100%;\
        min-width: 0;\
        box-sizing: border-box;\
        padding: 14px 16px;\
        border-radius: 14px;\
        border: 1px solid rgba(255, 247, 77, 0.25);\
        background: linear-gradient(145deg, rgba(8, 8, 8, 0.95), rgba(15, 15, 15, 0.9));\
        color: #fff74d;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-weight: 700;\
        font-size: 16px;\
        outline: none;\
        box-shadow: \
          inset 3px 3px 8px rgba(0, 0, 0, 0.7),\
          inset -2px -2px 6px rgba(255, 247, 77, 0.05);\
        transition: all 0.3s ease;\
      }\
      .om-email-input::placeholder {\
        color: rgba(189, 183, 107, 0.7);\
      }\
      .om-email-input:focus {\
        border-color: rgba(255, 247, 77, 0.5);\
        box-shadow: \
          inset 3px 3px 10px rgba(0, 0, 0, 0.8),\
          inset -2px -2px 8px rgba(255, 247, 77, 0.08),\
          0 0 12px rgba(255, 247, 77, 0.2);\
      }\
      .om-legal-note {\
        margin: 0;\
        width: 100%;\
        max-width: 100%;\
        min-width: 0;\
        color: #d3cd58;\
        font-size: clamp(10px, 2.8vw, 11px);\
        line-height: 1.5;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-weight: 700;\
        white-space: normal;\
        overflow-wrap: anywhere;\
        word-break: break-word;\
      }\
      .om-status {\
        margin: 2px 0 0 0;\
        min-height: 16px;\
        width: 100%;\
        max-width: 100%;\
        min-width: 0;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-size: clamp(10px, 2.8vw, 11px);\
        font-weight: 700;\
        white-space: normal;\
        overflow-wrap: anywhere;\
        word-break: break-word;\
      }\
      @media (max-width: 480px) {\
        .om-subscribe-panel {\
          width: 100%;\
          padding: 16px;\
          border-radius: 20px;\
        }\
        .om-enter-btn {\
          padding: 12px 24px;\
          letter-spacing: 0.08em;\
          font-size: 14px;\
          border-radius: 14px;\
        }\
        .om-email-input {\
          padding: 12px 14px;\
          font-size: 16px;\
          border-radius: 12px;\
        }\
        .om-legal-note, .om-status {\
          font-size: 10px;\
          line-height: 1.35;\
        }\
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
        var basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
          localStorage.setItem('subscribedEmail', email);
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
      }, 1500);
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
