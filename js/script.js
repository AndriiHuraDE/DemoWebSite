const menuButton = document.getElementById('menuButton');

    const mobileMenu = document.getElementById('mobileMenu');

    menuButton.addEventListener('click', () => { const open = mobileMenu.classList.toggle('open'); menuButton.setAttribute('aria-expanded', open ? 'true' : 'false'); });

    document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => { mobileMenu.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); }));



    function showToast(title, text) {

      const toast = document.getElementById('toast');

      document.getElementById('toastTitle').textContent = title;

      document.getElementById('toastText').textContent = text;

      toast.classList.add('show');

      clearTimeout(window.toastTimer);

      window.toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);

    }



    if (window.location.protocol === 'file:') {

      setTimeout(() => showToast('hCaptcha: bitte online testen','hCaptcha funktioniert nicht direkt aus einer file://-Datei. Öffnen Sie die Website über einen echten Webserver/Hosting. 🎯'), 900);

    }



    document.getElementById('whatsappHero').addEventListener('click', () => showToast('WhatsApp-Buchung','In der echten Website wird hier direkt der WhatsApp-Chat des Salons geöffnet.'));



    const bookingState = { service:'', price:'', staff:'', date:'', time:'' };



    // Web3Forms Access Key is stored once in config.js and reused by every form.

    const WEB3_ACCESS_KEY = String(window.WEB3FORMS_ACCESS_KEY || '').trim();

    document.querySelectorAll('input[name="access_key"]').forEach(input => {

      input.value = WEB3_ACCESS_KEY;

    });

    const bookingForm = document.getElementById('bookingSubmitForm');

    const bookingDate = document.getElementById('bookingDate');

    const bookingDateError = document.getElementById('bookingDateError');

    const leadDate = document.getElementById('preferred_time');

    const leadDateError = document.getElementById('leadDateError');

    const timeButtons = Array.from(document.querySelectorAll('.time-option'));



    function getTodayISO() {

      const now = new Date();

      const y = now.getFullYear();

      const m = String(now.getMonth() + 1).padStart(2, '0');

      const d = String(now.getDate()).padStart(2, '0');

      return `${y}-${m}-${d}`;

    }



    function getCurrentMinutes() {

      const now = new Date();

      return now.getHours() * 60 + now.getMinutes();

    }



    function isFourDigitYearValue(value) {

      return /^\d{4}-\d{2}-\d{2}$/.test(value);

    }



    function showBookingStep(step) {

      for (let i = 1; i <= 5; i++) {

        document.getElementById(`bookingStep${i}`).classList.toggle('hidden', i !== step);

        const indicator = document.getElementById(`stepIndicator${i}`);

        indicator.classList.remove('active', 'completed');

        if (i === step) indicator.classList.add('active');

        if (i < step) indicator.classList.add('completed');

      }

    }



    function setDateLimits() {

      const today = getTodayISO();

      bookingDate.min = today;

      bookingDate.max = '2099-12-31';

      leadDate.min = today;

      leadDate.max = '2099-12-31';

    }



    function validateBookingDate() {

      const value = bookingDate.value;

      const today = getTodayISO();

      let message = '';

      let valid = true;



      if (!value) {

        valid = false;

        message = 'Bitte wählen Sie ein Datum aus.';

      } else if (!isFourDigitYearValue(value)) {

        valid = false;

        message = 'Bitte verwenden Sie eine vierstellige Jahreszahl.';

      } else if (value < today) {

        valid = false;

        message = 'Ein Termin in der Vergangenheit kann nicht gebucht werden.';

      } else if (value > '2099-12-31') {

        valid = false;

        message = 'Bitte wählen Sie ein gültiges Datum.';

      }



      bookingDate.setCustomValidity(valid ? '' : message);

      bookingDateError.textContent = message;

      bookingDateError.classList.toggle('hidden', valid);

      return valid;

    }



    function validateLeadDate() {

      const value = leadDate.value;

      const today = getTodayISO();

      let message = '';

      let valid = true;



      if (value && !isFourDigitYearValue(value)) {

        valid = false;

        message = 'Bitte verwenden Sie eine vierstellige Jahreszahl.';

      } else if (value && value < today) {

        valid = false;

        message = 'Bitte wählen Sie heute oder ein zukünftiges Datum.';

      }



      leadDate.setCustomValidity(valid ? '' : message);

      leadDateError.textContent = message;

      leadDateError.classList.toggle('hidden', valid);

      return valid;

    }



    function refreshTimeButtons() {

      const selectedDate = bookingDate.value;

      const today = getTodayISO();

      const currentMinutes = getCurrentMinutes();

      let anyAvailable = false;



      timeButtons.forEach(button => {

        const [hours, minutes] = button.dataset.time.split(':').map(Number);

        const timeMinutes = hours * 60 + minutes;

        const isPastToday = selectedDate === today && timeMinutes <= currentMinutes;

        const shouldDisable = !selectedDate || selectedDate < today || isPastToday;



        button.disabled = shouldDisable;

        button.setAttribute('aria-disabled', shouldDisable ? 'true' : 'false');



        if (shouldDisable) {

          button.classList.add('opacity-30', 'cursor-not-allowed', 'line-through');

          button.classList.remove('selected');

          if (bookingState.time === button.dataset.time) bookingState.time = '';

        } else {

          anyAvailable = true;

          button.classList.remove('opacity-30', 'cursor-not-allowed', 'line-through');

        }

      });



      if (selectedDate === today && !anyAvailable) {

        showToast('Keine Zeiten mehr verfügbar', 'Für heute sind keine späteren Demo-Termine mehr verfügbar. Bitte wählen Sie ein anderes Datum.');

      }



      validateStep3();

    }



    function validateStep3() {

      const validDate = validateBookingDate();

      const validTime = !!bookingState.time && timeButtons.some(button => button.dataset.time === bookingState.time && !button.disabled);

      document.getElementById('nextToStep4').disabled = !(validDate && validTime);

    }



    setDateLimits();



    bookingDate.addEventListener('input', () => {

      validateBookingDate();

      bookingState.date = bookingDate.value;

      bookingState.time = '';

      timeButtons.forEach(button => button.classList.remove('selected'));

      refreshTimeButtons();

    });



    bookingDate.addEventListener('change', () => {

      validateBookingDate();

      bookingState.date = bookingDate.value;

      bookingState.time = '';

      timeButtons.forEach(button => button.classList.remove('selected'));

      refreshTimeButtons();

    });



    leadDate.addEventListener('input', validateLeadDate);

    leadDate.addEventListener('change', validateLeadDate);



    document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {

      document.querySelectorAll('[data-service]').forEach(x => x.classList.remove('selected'));

      button.classList.add('selected');

      bookingState.service = button.dataset.service;

      bookingState.price = button.dataset.price;

      document.getElementById('nextToStep2').disabled = false;

    }));



    document.getElementById('nextToStep2').addEventListener('click', () => {

      if (bookingState.service) showBookingStep(2);

    });



    document.querySelectorAll('[data-staff]').forEach(button => button.addEventListener('click', () => {

      document.querySelectorAll('[data-staff]').forEach(x => x.classList.remove('selected'));

      button.classList.add('selected');

      bookingState.staff = button.dataset.staff;

      document.getElementById('nextToStep3').disabled = false;

    }));



    document.getElementById('backToStep1').addEventListener('click', () => showBookingStep(1));

    document.getElementById('nextToStep3').addEventListener('click', () => {

      if (bookingState.staff) showBookingStep(3);

    });

    document.getElementById('backToStep2').addEventListener('click', () => showBookingStep(2));



    timeButtons.forEach(button => button.addEventListener('click', () => {

      if (button.disabled) return;

      document.querySelectorAll('.time-option').forEach(x => x.classList.remove('selected'));

      button.classList.add('selected');

      bookingState.time = button.dataset.time;

      document.getElementById('bookingHiddenTime').value = bookingState.time;

      validateStep3();

    }));



    document.getElementById('nextToStep4').addEventListener('click', () => {

      validateBookingDate();

      refreshTimeButtons();



      const validDate = validateBookingDate();

      const validTime = !!bookingState.time && timeButtons.some(button => button.dataset.time === bookingState.time && !button.disabled);



      if (!validDate) {

        bookingDate.focus();

        return;

      }



      if (!validTime) {

        showToast('Uhrzeit auswählen', 'Bitte wählen Sie eine verfügbare Uhrzeit.');

        return;

      }



      document.getElementById('bookingHiddenService').value = bookingState.service;

      document.getElementById('bookingHiddenPrice').value = bookingState.price;

      document.getElementById('bookingHiddenStaff').value = bookingState.staff;

      document.getElementById('bookingHiddenDate').value = bookingState.date;

      showBookingStep(4);

    });



    document.getElementById('backToStep3').addEventListener('click', () => showBookingStep(3));



    function getCaptchaToken(form) {

      const field = form.querySelector('textarea[name="h-captcha-response"]');

      return field ? String(field.value || '').trim() : '';

    }



    function resetBooking() {

      bookingState.service='';

      bookingState.price='';

      bookingState.staff='';

      bookingState.date='';

      bookingState.time='';



      document.querySelectorAll('.booking-option,.time-option').forEach(x => x.classList.remove('selected'));

      document.getElementById('nextToStep2').disabled = true;

      document.getElementById('nextToStep3').disabled = true;

      document.getElementById('nextToStep4').disabled = true;

      bookingForm.reset();

      setDateLimits();



      document.getElementById('summaryService').textContent='';

      document.getElementById('summaryStaff').textContent='';

      document.getElementById('summaryDate').textContent='';

      document.getElementById('summaryTime').textContent='';

      document.getElementById('summaryContact').textContent='';



      if (window.hcaptcha && document.getElementById('bookingCaptcha')) {

        try { window.hcaptcha.reset(document.getElementById('bookingCaptcha')); } catch (_) {}

      }



      showBookingStep(1);

      refreshTimeButtons();

    }



    // DEMO BOOKING: all fields are validated, but NOTHING is sent anywhere.

    document.getElementById('bookingSubmit').addEventListener('click', () => {

      const name = document.getElementById('bookingName');

      const phone = document.getElementById('bookingPhone');

      const email = document.getElementById('bookingEmail');

      const privacy = document.getElementById('bookingPrivacy');



      // Final protection against choosing a past date/time.

      bookingDate.value = bookingState.date;

      if (!validateBookingDate()) {

        showBookingStep(3);

        bookingDate.focus();

        return;

      }

      refreshTimeButtons();

      const chosenTimeButton = timeButtons.find(button => button.dataset.time === bookingState.time);

      if (!chosenTimeButton || chosenTimeButton.disabled) {

        showBookingStep(3);

        showToast('Termin nicht verfügbar', 'Die ausgewählte Uhrzeit liegt bereits in der Vergangenheit. Bitte wählen Sie eine andere Uhrzeit.');

        return;

      }



      // Validate ALL customer fields before moving to step 5.

      if (!name.value.trim()) {

        name.setCustomValidity('Bitte geben Sie Ihren Namen ein.');

        name.reportValidity();

        name.setCustomValidity('');

        return;

      }

      if (!phone.value.trim()) {

        phone.setCustomValidity('Bitte geben Sie Ihre Telefonnummer ein.');

        phone.reportValidity();

        phone.setCustomValidity('');

        return;

      }

      if (!email.value.trim()) {

        email.setCustomValidity('Bitte geben Sie Ihre E-Mail-Adresse ein.');

        email.reportValidity();

        email.setCustomValidity('');

        return;

      }

      if (!email.checkValidity()) {

        email.reportValidity();

        return;

      }

      if (!privacy.checked) {

        privacy.setCustomValidity('Bitte stimmen Sie der Kontaktaufnahme zu.');

        privacy.reportValidity();

        privacy.setCustomValidity('');

        return;

      }

      if (!getCaptchaToken(bookingForm)) {

        showToast('hCaptcha fehlt','Bitte lösen Sie zuerst die hCaptcha-Prüfung.');

        return;

      }



      const date = new Date(`${bookingState.date}T00:00:00`).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});



      document.getElementById('summaryService').textContent = `${bookingState.service} (${bookingState.price})`;

      document.getElementById('summaryStaff').textContent = bookingState.staff;

      document.getElementById('summaryDate').textContent = date;

      document.getElementById('summaryTime').textContent = `${bookingState.time} Uhr`;

      document.getElementById('summaryContact').textContent = `${name.value.trim()} · ${email.value.trim()} · ${phone.value.trim()}`;



      showBookingStep(5);

      showToast('Demo abgeschlossen','So würde die Terminbestätigung nach der Buchung aussehen.');

    });



    document.getElementById('restartBooking').addEventListener('click', resetBooking);



    // Keep today's available times up to date while the page is open.

    setInterval(() => {

      if (bookingState.date === getTodayISO()) refreshTimeButtons();

    }, 30000);



    const leadForm = document.getElementById('leadForm');

    const submitButton = document.getElementById('submitButton');

    const formSuccess = document.getElementById('formSuccess');



    leadForm.addEventListener('submit', async event => {

      event.preventDefault();

      if (!leadForm.reportValidity() || !validateLeadDate()) return;

      if (!WEB3_ACCESS_KEY) {

        showToast('Web3Forms noch nicht eingerichtet','Bitte tragen Sie den Web3Forms Access Key einmal in config.js ein.');

        return;

      }

      if (!getCaptchaToken(leadForm)) {

        showToast('hCaptcha fehlt','Bitte lösen Sie zuerst die hCaptcha-Prüfung.');

        return;

      }

      const original = submitButton.textContent;

      submitButton.disabled = true; submitButton.textContent = 'Wird gesendet …';

      try {

        // Web3Forms recommends JSON when the form is submitted through JavaScript.

        // This avoids redirects/CORS problems caused by mixing content types.

        const formData = new FormData(leadForm);

        const payload = Object.fromEntries(formData.entries());



        const response = await fetch(leadForm.action, {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

            'Accept': 'application/json'

          },

          body: JSON.stringify(payload)

        });



        let result = null;

        const rawText = await response.text();

        try {

          result = rawText ? JSON.parse(rawText) : null;

        } catch (_) {

          result = null;

        }



        const serverMessage =

          result?.message ||

          result?.body?.message ||

          result?.body?.data?.message ||

          (rawText ? rawText.slice(0, 220) : 'Keine Serverantwort erhalten.');



        if (!response.ok || !result?.success) {

          throw new Error(`HTTP ${response.status}: ${serverMessage}`);

        }



        leadForm.classList.add('hidden'); formSuccess.classList.remove('hidden');

        showToast('Anfrage gesendet','Vielen Dank! Ihre Demo-Anfrage wurde übermittelt.');

      } catch (error) {

        console.error('Web3Forms error:', error);

        showToast('Fehler beim Senden', error?.message || 'Bitte versuchen Sie es später erneut.');

      } finally { submitButton.disabled = false; submitButton.textContent = original; }

    });



    showBookingStep(1);
