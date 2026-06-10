(function () {
  'use strict';

  /* -------------------------------------------------------
     DICCIONARIO DE TRADUCCIONES
     Las claves mapean a los atributos en el HTML:
     - data-i18n (para texto de elementos)
     - data-i18n-placeholder (para texto de placeholders)
     - data-i18n-value (para los valores de los botones)
  ------------------------------------------------------- */
  var T = {

    /* ── Inglés (Idioma por defecto) ─────────────────────────────── */
    en: {
      sign_in_title: 'Sign in',
      email_placeholder: 'Email, phone, or Skype',
      email_error: 'Enter a valid email address, phone number, or Skype name.',
      no_account_text: 'No account?',
      create_one: 'Create one!',
      cant_access: "Can't access your account?",
      next_btn: 'Next',
      signin_options_label: 'Sign-in options',
      signin_options_title: 'Sign-in options',
      option1_title: 'Face, fingerprint, PIN or security key',
      option1_subtitle: 'Use your device to sign in with a passkey.',
      option2_title: 'Sign in with GitHub',
      option3_title: 'Sign in to an organization',
      option3_subtitle: "Search for a company or an organization you're working with.",
      back_btn: 'Back',
      enter_password: 'Enter password',
      password_error: 'Please enter the password for your Microsoft account.',
      password_placeholder: 'Password',
      forgot_password: 'Forgot password?',
      signin_btn: 'Sign in',
      troubleshoot_title: 'Troubleshooting details',
      troubleshoot_intro: 'If you contact your administrator, send this info to them.',
      copy_btn: 'Copy info to clipboard',
      flag_title: 'Flag sign-in errors for review:',
      enable_flagging: 'Enable flagging',
      flag_desc: 'If you plan on getting help for this problem, enable flagging and try to reproduce the error within 20 minutes. Flagged events make diagnostics available and are raised to admin attention.',
      terms: 'Terms of Use',
      privacy: 'Privacy & cookies',
      tos_accept: 'I accept the Terms of Use',
      tos_error: 'You must accept the terms before submitting.',
    },

    /* ── Español ────────────────────────────────────────── */
    es: {
      sign_in_title: 'Iniciar sesión',
      email_placeholder: 'Correo electrónico, teléfono o Skype',
      email_error: 'Introduce una dirección de correo, número de teléfono o nombre de Skype válido.',
      no_account_text: '¿No tienes cuenta?',
      create_one: '¡Créala!',
      cant_access: '¿No puedes acceder a tu cuenta?',
      next_btn: 'Siguiente',
      signin_options_label: 'Opciones de inicio de sesión',
      signin_options_title: 'Opciones de inicio de sesión',
      option1_title: 'Cara, huella digital, PIN o clave de seguridad',
      option1_subtitle: 'Usa tu dispositivo para iniciar sesión con una clave de paso.',
      option2_title: 'Iniciar sesión con GitHub',
      option3_title: 'Iniciar sesión en una organización',
      option3_subtitle: 'Busca una empresa u organización con la que trabajes.',
      back_btn: 'Atrás',
      enter_password: 'Escribe la contraseña',
      password_error: 'Escribe la contraseña de tu cuenta de Microsoft.',
      password_placeholder: 'Contraseña',
      forgot_password: '¿Olvidaste tu contraseña?',
      signin_btn: 'Iniciar sesión',
      troubleshoot_title: 'Detalles de solución de problemas',
      troubleshoot_intro: 'Si contactas con tu administrador, envíale esta información.',
      copy_btn: 'Copiar información al portapapeles',
      flag_title: 'Marcar errores de inicio de sesión para revisión:',
      enable_flagging: 'Habilitar marcado',
      flag_desc: 'Si planeas obtener ayuda para este problema, habilita el marcado e intenta reproducir el error en 20 minutos. Los eventos marcados elevan el diagnóstico a la atención del administrador.',
      terms: 'Términos de Uso',
      privacy: 'Privacidad y cookies',
      tos_accept: 'Acepto los Términos de Uso',
      tos_error: 'Debes aceptar los términos antes de enviar.',
    },

  }; // end T

  /* Idiomas que se leen de derecha a izquierda (RTL) */
  var RTL_LANGS = { ar: true, he: true, fa: true, ur: true };

  /* -------------------------------------------------------
     DETECCIÓN DE IDIOMA
     Intenta leer el idioma del navegador usando diferentes propiedades:
     navigator.language → navigator.languages → navigator.userLanguage
     Si no encuentra o no soporta el idioma, usa 'en' (Inglés) por defecto.
  ------------------------------------------------------- */
  function detectLang() {
    var candidates = [];
    if (navigator.languages && navigator.languages.length) {
      candidates = Array.prototype.slice.call(navigator.languages);
    } else if (navigator.language) {
      candidates = [navigator.language];
    } else if (navigator.userLanguage) {
      candidates = [navigator.userLanguage];
    }

    for (var i = 0; i < candidates.length; i++) {
      var full = candidates[i].toLowerCase();            // ej. 'es-es'
      var primary = full.split('-')[0];                    // ej. 'es'

      /* Preferimos la etiqueta completa si está disponible, sino la primaria */
      if (T[full]) return full;
      if (T[primary]) return primary;
    }
    return 'en';
  }

  /* -------------------------------------------------------
     APLICAR TRADUCCIONES AL HTML
  ------------------------------------------------------- */
  function applyTranslations() {
    var lang = detectLang();
    var t = T[lang] || T['en'];

    /* Establecemos el idioma (lang) y la dirección (dir) en la etiqueta <html> 
       para cuestiones de accesibilidad y correcta renderización de estilos CSS */
    document.documentElement.setAttribute('lang', lang);
    if (RTL_LANGS[lang]) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }

    /* Traducir el contenido de texto plano (etiquetas span, div, etc) */
    var textEls = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < textEls.length; i++) {
      var key = textEls[i].getAttribute('data-i18n');
      if (t[key] !== undefined) {
        textEls[i].textContent = t[key];
      }
    }

    /* Traducir los placeholders de los campos de entrada (input, textarea) */
    var phEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < phEls.length; j++) {
      var phKey = phEls[j].getAttribute('data-i18n-placeholder');
      if (t[phKey] !== undefined) {
        phEls[j].placeholder = t[phKey];
      }
    }

    /* Traducir los valores de los botones (input type="button") */
    var valEls = document.querySelectorAll('[data-i18n-value]');
    for (var k = 0; k < valEls.length; k++) {
      var valKey = valEls[k].getAttribute('data-i18n-value');
      if (t[valKey] !== undefined) {
        valEls[k].value = t[valKey];
      }
    }
  }

  /* Ejecutar las traducciones tan pronto como sea posible */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }

})();
