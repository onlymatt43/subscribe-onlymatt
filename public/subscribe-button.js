(function () {
  if (window.__omSubscribeLoaded) return;
  window.__omSubscribeLoaded = true;
  
  function getDefaultApiBase() {
    try {
      if (document.currentScript && document.currentScript.src) {
        return new URL(document.currentScript.src).origin;
      }
    } catch (_) {}
    return window.location.origin;
  }
  
  var apiBase = (window.OM_SUBSCRIBE_API_BASE || getDefaultApiBase()).replace(/\/$/, '');
  
  // Image fixe demandée par le user (zone de saisie déjà dessinée sur la photo)
  var backgroundImageUrl = 'https://onlymatt-public-zone.b-cdn.net/subscription/subscription1.jpg?v=' + Date.now();
  
  // Show welcome back message for returning subscribers
  if (localStorage.getItem('hasSubscribed') === 'true') {
    var subscribedEmail = localStorage.getItem('subscribedEmail');
    if (subscribedEmail) {
      showWelcomeBack(subscribedEmail);
    }
    return;
  }

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
        pointer-events: auto;\
      }\
      .om-subscribe-root::before {\
        content: "";\
        position: absolute;\
        width: min(900px, 90vw);\
        height: min(520px, 50vh);\
        top: 50%;\
        left: 50%;\
        transform: translate(-50%, -50%);\
        background-image: linear-gradient(rgba(0,0,0,0.22), rgba(0,0,0,0.22)), url("' + backgroundImageUrl + '");\
        background-size: contain;\
        background-position: center;\
        background-repeat: no-repeat;\
        pointer-events: none;\
      }\
      .om-subscribe-panel {\
        position: relative;\
        z-index: 10;\
        pointer-events: auto;\
        width: 100%;\
        max-width: min(720px, calc(100vw - 24px));\
        height: 100%;\
        max-height: min(90vh, 960px);\
        display: flex;\
        align-items: center;\
        justify-content: center;\
        box-sizing: border-box;\
        background: transparent;\
        border: none;\
        box-shadow: none;\
        padding: 0;\
      }\
      .om-subscribe-form {\
        position: relative;\
        width: 100%;\
        height: 100%;\
        display: flex;\
        align-items: center;\
        justify-content: center;\
      }\
      .om-email-hitbox {\
        position: absolute;\
        top: 60%;\
        left: 50%;\
        transform: translate(-50%, -50%);\
        width: min(420px, 82vw);\
        height: 64px;\
        display: flex;\
        align-items: center;\
        justify-content: center;\
        padding: 4px 0;\
        box-sizing: border-box;\
      }\
      .om-email-input {\
        width: 100%;\
        height: 100%;\
        padding: 0 12px;\
        background: transparent;\
        border: none;\
        outline: none;\
        color: #ffffff;\
        caret-color: #ffffff;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-weight: 700;\
        font-size: clamp(16px, 4vw, 22px);\
        letter-spacing: 0.04em;\
        text-align: center;\
        box-sizing: border-box;\
      }\
      .om-email-input::placeholder {\
        color: rgba(255,255,255,0.55);\
      }\
      .om-email-input:focus {\
        outline: none;\
      }\
      .om-legal-note {\
        display: none;\
      }\
      .om-status {\
        position: absolute;\
        bottom: 14px;\
        left: 50%;\
        transform: translateX(-50%);\
        margin: 0;\
        padding: 4px 10px;\
        border-radius: 10px;\
        background: rgba(0,0,0,0.35);\
        color: #d3cd58;\
        font-family: \"Montserrat\", system-ui, -apple-system, sans-serif;\
        font-size: clamp(11px, 3vw, 13px);\
        font-weight: 700;\
        text-align: center;\
        white-space: normal;\
        pointer-events: none;\
      }\
      @media (max-width: 480px) {\
        .om-email-hitbox {\
          top: 62%;\
          height: 56px;\
        }\
        .om-status {\
          font-size: 11px;\
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

    var form = document.createElement('form');
    form.className = 'om-subscribe-form';

    var hitbox = document.createElement('div');
    hitbox.className = 'om-email-hitbox';

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

    hitbox.appendChild(input);
    form.appendChild(hitbox);
    form.appendChild(note);
    form.appendChild(msg);
    form.appendChild(honeypot);

    panel.appendChild(form);
    root.appendChild(panel);
    document.body.appendChild(root);

    setTimeout(function() {
      input.focus();
    }, 50);

    var submitTimeout = null;
    var isSubmitting = false;
    var hasSubmitted = false;

    function showSuccessVideo() {
      isSubmitting = false;
      msg.style.display = 'none';
      note.style.display = 'none';

      var videoWrapper = document.createElement('div');
      videoWrapper.style.cssText = 'position: relative; width: min(820px, 95vw); max-height: 82vh; display: flex; align-items: center; justify-content: center;';

      var video = document.createElement('video');
      video.src = 'https://onlymatt-public-zone.b-cdn.net/subscription/video-subscription1.mp4';
      video.autoplay = true;
      video.muted = true;
      video.controls = true;
      video.playsInline = true;
      video.style.cssText = 'width: 100%; max-height: 82vh; border-radius: 18px; box-shadow: 0 12px 50px rgba(0,0,0,0.45); background: #000;';

      videoWrapper.appendChild(video);
      panel.innerHTML = '';
      panel.appendChild(videoWrapper);

      // Best effort to start playback on mobile without user gesture issues
      video.play().catch(function() {});
    }

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
          showSuccessVideo();
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
