(() => {
  'use strict';
  const DATA = window.SELYS_DATA;
  if (!DATA) return;

  const extra = {
    de: {
      'intro.eyebrow': 'Ihr persönlicher Look', 'location.welcome': 'Wir freuen uns auf Sie.', 'location.demoData': 'SÉLYS Hair & Beauty · DEMO-DATEN', 'location.checkingHours': 'Öffnungszeiten werden geprüft …',
      'services.bookService': 'Termin für diese Leistung',
      'booking.stepLabel1': 'Schritt 1', 'booking.stepLabel2': 'Schritt 2', 'booking.stepLabel3': 'Schritt 3', 'booking.stepLabel4': 'Schritt 4', 'booking.stepLabel5': 'Schritt 5',
      'booking.privacy': 'Ich willige in die Verarbeitung meiner Angaben zur Termin-Demo ein und habe die Datenschutzerklärung gelesen.', 'booking.errorYear': 'Bitte verwenden Sie ein gültiges Datum mit genau 4-stelliger Jahreszahl.', 'booking.contactDescription': 'Damit wir Ihre Demo-Anfrage zuordnen können, benötigen wir noch Ihre Kontaktdaten.', 'booking.demoReference': 'Demo-Referenz:',
      'booking.errorRequiredDate': 'Bitte wählen Sie ein Datum aus.', 'booking.errorNameRequired': 'Bitte geben Sie Ihren Namen ein.', 'booking.errorNameLength': 'Der Name muss mindestens 3 Zeichen lang sein.', 'booking.errorNameLetters': 'Bitte verwenden Sie nur lateinische Buchstaben. Leerzeichen, Bindestrich und Apostroph sind erlaubt.', 'booking.errorNameMinLetters': 'Der Name muss mindestens 3 Buchstaben enthalten.', 'booking.errorPhoneRequired': 'Bitte geben Sie Ihre Telefonnummer ein.', 'booking.errorPhoneFormat': 'Bitte verwenden Sie nur Ziffern und optional ein Pluszeichen am Anfang (z. B. +49123456789).', 'booking.errorEmailRequired': 'Bitte geben Sie Ihre E-Mail-Adresse ein.', 'booking.errorEmailFormat': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'booking.errorPrivacy': 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.',
      'booking.errorStepTitle': 'Schritt noch nicht verfügbar', 'booking.errorStepService': 'Bitte wählen Sie zuerst eine Leistung.', 'booking.errorStepStaff': 'Bitte wählen Sie zuerst eine Leistung und ein Teammitglied.', 'booking.errorStepTime': 'Bitte wählen Sie zuerst einen gültigen Termin mit Uhrzeit.', 'booking.errorStepFinish': 'Bitte schließen Sie zuerst die Demo-Anfrage ab.', 'booking.errorCaptcha': 'Bitte bestätigen Sie, dass Sie kein Roboter sind.', 'booking.errorLeadDate': 'Bitte wählen Sie heute oder ein zukünftiges Datum.', 'booking.errorTimeTitle': 'Uhrzeit auswählen',
      'contact.onlineTitle': 'Kontaktformular nur online', 'contact.onlineNote': 'Der echte Spam-Schutz im Kontaktformular benötigt eine gehostete HTTPS-Seite. Die Termin-Demo verwendet eine einfache Demo-Checkbox.', 'contact.setupTitle': 'Web3Forms noch nicht eingerichtet', 'contact.setupNote': 'Bitte tragen Sie den Web3Forms Access Key einmal in config.js ein.', 'contact.captchaTitle': 'hCaptcha fehlt', 'contact.captchaNote': 'Bitte lösen Sie zuerst die hCaptcha-Prüfung.', 'contact.sentTitle': 'Anfrage gesendet', 'contact.sentNote': 'Vielen Dank! Ihre Demo-Anfrage wurde übermittelt.', 'contact.errorTitle': 'Fehler beim Senden', 'contact.errorNote': 'Bitte versuchen Sie es später erneut.',
      'staff.anna.role': 'Creative Director · Color & Cut', 'staff.lukas.role': 'Master Stylist · Damen, Herren & Styling', 'staff.sophie.role': 'Color Expert · Blond & Pflege',
      'checkout.title': 'Bestellung abschließen', 'checkout.description': 'Bitte geben Sie Beispieldaten ein. Es wird keine echte Zahlung ausgelöst.', 'checkout.fulfilment': 'Wie möchten Sie Ihre Bestellung erhalten?', 'checkout.payment': 'Zahlungsart (Demo)', 'checkout.submit': 'Demo-Bestellung abschließen', 'checkout.success': 'Ihre Demo-Bestellung wurde lokal gespeichert. Es wurde kein Geld eingezogen.',
      'common.storageError': 'Der Browser konnte die Demo-Daten nicht speichern. Bitte prüfen Sie die Speichereinstellungen.',
      'service.cut.name': 'Damen Haarschnitt', 'service.cut.description': 'Beratung, Waschen, typgerechter Schnitt und professionelles Styling.',
      'service.balayage.name': 'Balayage', 'service.balayage.description': 'Natürlich wirkende Highlights mit individueller Farbberatung und Glossing.',
      'service.men.name': 'Herren Styling', 'service.men.description': 'Präziser Schnitt, Konturen und individuelles Styling für einen gepflegten Look.',
      'service.care.name': 'Pflegebehandlung', 'service.care.description': 'Intensivpflege für geschmeidiges, glänzendes und gesund aussehendes Haar.',
      'booking.errorDate': 'Bitte wählen Sie einen Öffnungstag innerhalb der nächsten 14 Tage.', 'booking.errorTime': 'Bitte wählen Sie eine verfügbare Uhrzeit.', 'booking.errorSlotTaken': 'Dieser Termin wurde gerade belegt. Bitte wählen Sie eine andere Uhrzeit.',
      'booking.noTimes': 'Für diesen Tag und diese Auswahl sind keine passenden Zeiten verfügbar.', 'booking.chooseDate': 'Bitte wählen Sie zuerst ein Datum.', 'booking.todayNoTimes': 'Für heute sind keine passenden Zeiten mehr verfügbar. Bitte wählen Sie einen anderen Tag.',
      'booking.successToast': 'Ihre Demo-Auswahl wurde lokal gespeichert. Es wurde kein echter Termin übermittelt.',
      'booking.savedEyebrow': 'Lokale Demo-Daten', 'booking.savedTitle': 'Ihre Demo-Termine', 'booking.savedNote': 'Nur in diesem Browser gespeichert. Keine echten Termine und keine Kontaktdaten werden gespeichert.', 'booking.reference': 'Referenz', 'booking.reschedule': 'Verschieben', 'booking.cancel': 'Stornieren', 'booking.confirmCancel': 'Diesen Demo-Termin wirklich stornieren?', 'booking.cancelledTitle': 'Demo-Termin storniert', 'booking.cancelledNote': 'Der lokale Demo-Termin wurde storniert.', 'booking.rescheduleTitle': 'Demo-Termin ändern', 'booking.rescheduleNote': 'Wählen Sie jetzt einen neuen Tag und eine neue Uhrzeit.', 'booking.errorTitle': 'Demo-Termin nicht gefunden', 'booking.errorMissing': 'Dieser Demo-Termin kann nicht geändert werden.'
    },
    en: {
      'intro.eyebrow': 'Your personal look', 'location.welcome': 'We look forward to seeing you.', 'location.demoData': 'SÉLYS Hair & Beauty · DEMO DATA', 'location.checkingHours': 'Checking opening hours …',
      'services.bookService': 'Book this service',
      'booking.stepLabel1': 'Step 1', 'booking.stepLabel2': 'Step 2', 'booking.stepLabel3': 'Step 3', 'booking.stepLabel4': 'Step 4', 'booking.stepLabel5': 'Step 5',
      'booking.privacy': 'I agree to the processing of my details for this booking demo and have read the privacy policy.', 'booking.errorYear': 'Please enter a valid date with a four-digit year.', 'booking.contactDescription': 'We need your contact details to associate them with this demo request.', 'booking.demoReference': 'Demo reference:',
      'booking.errorRequiredDate': 'Please choose a date.', 'booking.errorNameRequired': 'Please enter your name.', 'booking.errorNameLength': 'Your name must contain at least 3 characters.', 'booking.errorNameLetters': 'Please use Latin letters only. Spaces, hyphens and apostrophes are allowed.', 'booking.errorNameMinLetters': 'Your name must contain at least 3 letters.', 'booking.errorPhoneRequired': 'Please enter your phone number.', 'booking.errorPhoneFormat': 'Use digits and an optional leading plus sign (e.g. +49123456789).', 'booking.errorEmailRequired': 'Please enter your email address.', 'booking.errorEmailFormat': 'Please enter a valid email address.', 'booking.errorPrivacy': 'Please agree to the processing of your details.',
      'booking.errorStepTitle': 'Step not available yet', 'booking.errorStepService': 'Please choose a service first.', 'booking.errorStepStaff': 'Please choose a service and a team member first.', 'booking.errorStepTime': 'Please choose a valid appointment date and time first.', 'booking.errorStepFinish': 'Please complete the demo request first.', 'booking.errorCaptcha': 'Please confirm that you are not a robot.', 'booking.errorLeadDate': 'Please choose today or a future date.', 'booking.errorTimeTitle': 'Choose a time',
      'contact.onlineTitle': 'Contact form requires hosting', 'contact.onlineNote': 'The live spam protection requires a hosted HTTPS page. The appointment demo uses a simple demo checkbox.', 'contact.setupTitle': 'Web3Forms is not configured', 'contact.setupNote': 'Please add the Web3Forms Access Key to config.js.', 'contact.captchaTitle': 'hCaptcha is missing', 'contact.captchaNote': 'Please complete the hCaptcha check first.', 'contact.sentTitle': 'Enquiry sent', 'contact.sentNote': 'Thank you! Your demo enquiry has been submitted.', 'contact.errorTitle': 'Sending failed', 'contact.errorNote': 'Please try again later.',
      'staff.anna.role': 'Creative Director · Colour & Cut', 'staff.lukas.role': 'Master Stylist · Women, Men & Styling', 'staff.sophie.role': 'Colour Expert · Blonde & Care',
      'checkout.title': 'Complete your order', 'checkout.description': 'Please enter sample details. No real payment will be made.', 'checkout.fulfilment': 'How would you like to receive your order?', 'checkout.payment': 'Payment method (demo)', 'checkout.submit': 'Complete demo order', 'checkout.success': 'Your demo order has been saved locally. No money was charged.',
      'common.storageError': 'The browser could not save demo data. Please check your storage settings.',
      'service.cut.name': "Women's Haircut", 'service.cut.description': 'Consultation, wash, a tailored haircut and professional styling.',
      'service.balayage.name': 'Balayage', 'service.balayage.description': 'Natural-looking highlights with individual colour consultation and glossing.',
      'service.men.name': "Men's Styling", 'service.men.description': 'A precise cut, clean contours and individual styling for a polished look.',
      'service.care.name': 'Care Treatment', 'service.care.description': 'An intensive treatment for soft, glossy and healthy-looking hair.',
      'booking.errorDate': 'Please choose an opening day within the next 14 days.', 'booking.errorTime': 'Please choose an available time.', 'booking.errorSlotTaken': 'This appointment was just taken. Please choose another time.',
      'booking.noTimes': 'No suitable times are available for this day and selection.', 'booking.chooseDate': 'Please choose a date first.', 'booking.todayNoTimes': 'No suitable times remain today. Please choose another day.',
      'booking.successToast': 'Your demo selection has been saved locally. No real appointment was sent.',
      'booking.savedEyebrow': 'Local demo data', 'booking.savedTitle': 'Your demo appointments', 'booking.savedNote': 'Stored only in this browser. No real appointments or contact details are stored.', 'booking.reference': 'Reference', 'booking.reschedule': 'Reschedule', 'booking.cancel': 'Cancel', 'booking.confirmCancel': 'Do you really want to cancel this demo appointment?', 'booking.cancelledTitle': 'Demo appointment cancelled', 'booking.cancelledNote': 'The local demo appointment has been cancelled.', 'booking.rescheduleTitle': 'Change demo appointment', 'booking.rescheduleNote': 'Choose a new date and time.', 'booking.errorTitle': 'Demo appointment not found', 'booking.errorMissing': 'This demo appointment cannot be changed.'
    }
  };

  let current = 'de';
  const translation = (key) => extra[current]?.[key] ?? DATA.translations[current]?.[key] ?? key;

  function applyLanguage(nextLanguage) {
    current = nextLanguage === 'en' ? 'en' : 'de';
    window.SELYS_LANG = current;
    document.documentElement.lang = current;
    try { localStorage.setItem('selys-language', current); } catch (_) {}

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const value = translation(element.dataset.i18n);
      if (value !== element.dataset.i18n) element.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const value = translation(element.dataset.i18nPlaceholder);
      if (value !== element.dataset.i18nPlaceholder) element.setAttribute('placeholder', value);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const value = translation(element.dataset.i18nTitle);
      if (value !== element.dataset.i18nTitle) element.setAttribute('title', value);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      const value = translation(element.dataset.i18nAriaLabel);
      if (value !== element.dataset.i18nAriaLabel) element.setAttribute('aria-label', value);
    });

    const pageTitle = current === 'en'
      ? 'SÉLYS Hair & Beauty – Demo Website'
      : 'SÉLYS Hair & Beauty – Demo Website';
    document.title = pageTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = current === 'en'
      ? 'Premium hair salon website demo in Münster with online appointment booking and a demo shop.'
      : 'Premium Hair Salon Website Demo in Münster mit Online-Terminbuchung und Demo-Shop.';

    const nextLabel = current === 'de' ? 'EN' : 'DE';
    ['languageToggle', 'languageToggleMobile'].forEach(id => {
      const button = document.getElementById(id);
      if (button) {
        button.textContent = nextLabel;
        button.setAttribute('aria-label', current === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln');
      }
    });

    const map = document.getElementById('locationMap');
    if (map) {
      const base = map.dataset.mapBase || '';
      map.src = `${base}${base.includes('?') ? '&' : '?'}hl=${current}`;
      map.title = current === 'en' ? 'Google Maps – example area in Münster city centre' : 'Google Maps – Beispielregion Münster Innenstadt';
    }

    window.SELYS_T = translation;
    window.SELYS_RENDER_ALL?.();
    window.dispatchEvent(new CustomEvent('selys:language-change', { detail: { language: current } }));
    window.updateSalonOpeningStatus?.();
    window.refreshSelysBookingUi?.();
  }

  function toggle() { applyLanguage(current === 'de' ? 'en' : 'de'); }
  document.getElementById('languageToggle')?.addEventListener('click', toggle);
  document.getElementById('languageToggleMobile')?.addEventListener('click', toggle);

  try {
    const saved = localStorage.getItem('selys-language');
    applyLanguage(saved === 'en' ? 'en' : 'de');
  } catch (_) { applyLanguage('de'); }

  window.SELYS_SET_LANGUAGE = applyLanguage;
  window.SELYS_T = translation;
})();
