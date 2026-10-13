const menuButton = document.getElementById('menuButton');

    const mobileMenu = document.getElementById('mobileMenu');

    menuButton.addEventListener('click', () => { const open = mobileMenu.classList.toggle('open'); menuButton.setAttribute('aria-expanded', open ? 'true' : 'false'); });

    document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => { mobileMenu.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); }));



    // Back-to-top button: visible after a small amount of scrolling.
    const backToTop = document.getElementById('backToTop');

    function updateBackToTop() {

      const visible = window.scrollY > 300;

      backToTop.classList.toggle('show', visible);
      backToTop.setAttribute('aria-hidden', visible ? 'false' : 'true');

    }

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });



    // Dynamic opening status for the fictional SÉLYS demo salon.
    // Always use Münster local time, even if the visitor is in another timezone.
    function getSalonOpeningStatus(referenceDate = new Date()) {
      const timeZone = 'Europe/Berlin';
      const dayNumber = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
      const weekdayName = {
        1: 'Montag', 2: 'Dienstag', 3: 'Mittwoch', 4: 'Donnerstag',
        5: 'Freitag', 6: 'Samstag', 7: 'Sonntag'
      };
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      });
      const values = {};
      formatter.formatToParts(referenceDate).forEach(part => { values[part.type] = part.value; });

      const weekday = dayNumber[values.weekday];
      const hour = Number(values.hour) === 24 ? 0 : Number(values.hour);
      const minute = Number(values.minute);
      const minutesNow = hour * 60 + minute;
      const scheduleForDay = day => {
        if (day >= 1 && day <= 5) return { open: 9 * 60, close: 18 * 60 };
        if (day === 6) return { open: 9 * 60, close: 14 * 60 };
        return null;
      };
      const formatTime = totalMinutes => `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
      const status = (text, state) => ({ text, state });
      const todaySchedule = scheduleForDay(weekday);

      if (todaySchedule && minutesNow >= todaySchedule.open && minutesNow < todaySchedule.close) {
        const untilClose = todaySchedule.close - minutesNow;
        if (untilClose <= 30) {
          return status(`Schließt in ${untilClose} Min. · heute um ${formatTime(todaySchedule.close)} Uhr`, 'soon');
        }
        return status(`Geöffnet · heute bis ${formatTime(todaySchedule.close)} Uhr`, 'open');
      }

      if (todaySchedule && minutesNow < todaySchedule.open) {
        const untilOpen = todaySchedule.open - minutesNow;
        if (untilOpen <= 30) {
          return status(`Öffnet in ${untilOpen} Min. · um ${formatTime(todaySchedule.open)} Uhr`, 'soon');
        }
        return status(`Geschlossen · öffnet heute um ${formatTime(todaySchedule.open)} Uhr`, 'closed');
      }

      // After closing time or on Sunday: find the next working day.
      for (let offset = 1; offset <= 7; offset++) {
        const nextDay = ((weekday - 1 + offset) % 7) + 1;
        const nextSchedule = scheduleForDay(nextDay);
        if (!nextSchedule) continue;
        let openingText;
        if (offset === 1) openingText = 'morgen';
        else openingText = weekdayName[nextDay];
        return status(`Geschlossen · öffnet ${openingText} um ${formatTime(nextSchedule.open)} Uhr`, 'closed');
      }

      return status('Geschlossen', 'closed');
    }

    function updateSalonOpeningStatus() {
      const statusElement = document.getElementById('locationOpenStatus');
      const statusText = document.getElementById('locationOpenStatusText');
      if (!statusElement || !statusText) return;

      const currentStatus = getSalonOpeningStatus();
      statusElement.classList.remove('is-open', 'is-soon', 'is-closed');
      statusElement.classList.add(`is-${currentStatus.state}`);
      statusText.textContent = currentStatus.text;
    }

    updateSalonOpeningStatus();
    // Keep the label fresh when the clock crosses an opening/closing threshold.
    window.setInterval(updateSalonOpeningStatus, 60 * 1000);



    function showToast(title, text) {

      const toast = document.getElementById('toast');

      document.getElementById('toastTitle').textContent = title;

      document.getElementById('toastText').textContent = text;

      toast.classList.add('show');

      clearTimeout(window.toastTimer);

      window.toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);

    }



    if (window.location.protocol === 'file:') {

      setTimeout(() => showToast('Kontaktformular nur online','Der echte Spam-Schutz im Kontaktformular benötigt eine gehostete HTTPS-Seite. Die Termin-Demo verwendet eine einfache Demo-Checkbox.'), 900);

    }



    // ------------------------------------------------------------
    // DEMO WHATSAPP CHAT
    // ------------------------------------------------------------
    const whatsappDemo = document.getElementById('whatsappDemo');
    const whatsappClose = document.getElementById('whatsappClose');
    const whatsappMessages = document.getElementById('whatsappMessages');
    const whatsappQuickReplies = document.getElementById('whatsappQuickReplies');
    const whatsappDemoForm = document.getElementById('whatsappDemoForm');
    const whatsappInput = document.getElementById('whatsappInput');
    let whatsappOpener = null;

    const whatsappState = {
      step: 'menu',
      service: null,
      staff: '',
      date: '',
      time: '',
      processing: false
    };

    // Canonical service data. Numeric menu values are internal only;
    // the chat always displays the full human-readable label.
    const whatsappServices = {
      '1': { name: 'Damen Haarschnitt', price: '49 €', label: 'Damen Haarschnitt – 49 €' },
      '2': { name: 'Balayage', price: 'ab 129 €', label: 'Balayage – ab 129 €' },
      '3': { name: 'Herren Styling', price: '35 €', label: 'Herren Styling – 35 €' },
      '4': { name: 'Pflegebehandlung', price: '29 €', label: 'Pflegebehandlung – 29 €' }
    };

    // Beispielhafte Öffnungszeiten für die DEMO.
    // 1 = Montag ... 5 = Freitag.
    // Jeder Wochentag hat bewusst unterschiedliche Beispielzeiten.
    const demoWeekSchedule = {
      1: ['09:00', '12:00', '15:30'],
      2: ['10:30', '14:00', '17:00'],
      3: ['09:00', '14:00', '15:30'],
      4: ['10:30', '12:00', '17:00'],
      5: ['09:00', '10:30', '14:00', '17:00']
    };

    function whatsappTime() {
      return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    function addWhatsAppMessage(text, sender = 'bot') {
      const bubble = document.createElement('div');
      bubble.className = `wa-message ${sender}`;
      bubble.textContent = text;

      const time = document.createElement('span');
      time.className = 'wa-time';
      time.textContent = whatsappTime();

      if (sender === 'user') {
        const checks = document.createElement('span');
        checks.className = 'wa-checks';
        checks.textContent = '✓✓';
        time.appendChild(checks);
      }

      bubble.appendChild(time);
      whatsappMessages.appendChild(bubble);
      requestAnimationFrame(() => {
        whatsappMessages.scrollTop = whatsappMessages.scrollHeight;
      });
    }

    function showWhatsAppTyping() {
      const bubble = document.createElement('div');
      bubble.className = 'wa-message bot wa-typing';
      bubble.setAttribute('aria-label', 'SÉLYS schreibt');
      bubble.innerHTML = '<span></span><span></span><span></span>';
      whatsappMessages.appendChild(bubble);
      requestAnimationFrame(() => {
        whatsappMessages.scrollTop = whatsappMessages.scrollHeight;
      });
      return bubble;
    }

    function botReply(text, delay = 420) {
      return new Promise(resolve => {
        const typing = showWhatsAppTyping();
        window.setTimeout(() => {
          typing.remove();
          addWhatsAppMessage(text, 'bot');
          resolve();
        }, delay);
      });
    }

    function setWhatsAppQuickReplies(items) {
      whatsappQuickReplies.innerHTML = '';
      items.forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wa-quick';
        button.textContent = item.label;

        // Show the human-readable option in the chat instead of the internal
        // machine value (e.g. ISO date / numeric menu value).
        button.addEventListener('click', () => {
          handleWhatsAppInput(item.value, item.userLabel || item.label);
        });

        whatsappQuickReplies.appendChild(button);
      });
    }

    function formatDemoDate(date) {
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
      });
    }

    function toISODate(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function getCurrentMinutes() {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    }

    function timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }

    function getDemoDaysNext7Days() {
      const now = new Date();
      now.setSeconds(0, 0);

      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const todayMinutes = getCurrentMinutes();
      const days = [];

      // Today + the following 6 calendar days = exactly 7 calendar days.
      for (let offset = 0; offset < 7; offset++) {
        const date = new Date(today);
        date.setDate(today.getDate() + offset);

        const weekday = date.getDay(); // 0 Sun ... 6 Sat
        if (weekday === 0 || weekday === 6) continue;

        let times = [...(demoWeekSchedule[weekday] || [])];

        // For today, never show a time that has already passed.
        if (offset === 0) {
          times = times.filter(time => timeToMinutes(time) > todayMinutes);
        }

        // If today has no remaining slots, it must not be offered at all.
        if (!times.length) continue;

        days.push({
          date,
          day: date.getDate(),
          iso: toISODate(date),
          weekday,
          times,
          label: formatDemoDate(date)
        });
      }

      return days;
    }

    function getDemoWeekdays() {
      return getDemoDaysNext7Days();
    }

    function findDemoDay(value) {
      const days = getDemoWeekdays();
      const normalized = value.toLowerCase();
      return days.find(day =>
        value === day.iso ||
        value === String(day.day) ||
        normalized.includes(day.label.toLowerCase()) ||
        normalized.includes(day.label.split(' ')[0].toLowerCase())
      );
    }

    function whatsappMenu() {
      whatsappState.step = 'menu';
      setWhatsAppQuickReplies([
        { label: 'Termin buchen', value: '1' },
        { label: 'Preise', value: '2' },
        { label: 'Öffnungszeiten', value: '3' },
        { label: 'Kontakt', value: '4' }
      ]);
    }

    function whatsappAskService() {
      whatsappState.step = 'service';
      setWhatsAppQuickReplies([
        { label: 'Damen Haarschnitt – 49 €', value: '1' },
        { label: 'Balayage – ab 129 €', value: '2' },
        { label: 'Herren Styling – 35 €', value: '3' },
        { label: 'Pflegebehandlung – 29 €', value: '4' }
      ]);
    }

    async function whatsappAskStaff() {
      whatsappState.step = 'staff';
      setWhatsAppQuickReplies([
        { label: 'Anna Müller', value: '1' },
        { label: 'Lukas Schneider', value: '2' },
        { label: 'Sophie Weber', value: '3' },
        { label: 'Keine Präferenz', value: '4' }
      ]);
    }

    function whatsappAskDate() {
      whatsappState.step = 'date';
      const days = getDemoWeekdays();
      setWhatsAppQuickReplies(days.map(day => ({
        label: `${day.label} · ${day.times.length} frei`,
        value: day.iso,
        userLabel: day.label
      })));
    }

    function whatsappAskTime(day) {
      whatsappState.step = 'time';
      setWhatsAppQuickReplies([
        ...day.times.map(time => ({ label: time, value: time, userLabel: time })),
        { label: '← Anderen Tag wählen', value: 'back-date', userLabel: '← Anderen Tag wählen' }
      ]);
    }

    function resetWhatsAppDemo() {
      whatsappState.step = 'menu';
      whatsappState.service = null;
      whatsappState.staff = '';
      whatsappState.date = '';
      whatsappState.time = '';
      whatsappState.processing = false;
      whatsappMessages.innerHTML = '';
      whatsappQuickReplies.innerHTML = '';
      addWhatsAppMessage('Hallo 👋 Willkommen bei SÉLYS.');
      addWhatsAppMessage('🤖 DEMO – interaktiver WhatsApp-Buchungsassistent.\nKeine echten Termine, keine echten Nachrichten – alles hier ist nur eine Simulation.');
      addWhatsAppMessage('Wie können wir Ihnen helfen?\n\n1️⃣ Termin buchen\n2️⃣ Preise ansehen\n3️⃣ Öffnungszeiten\n4️⃣ Kontakt');
      whatsappMenu();
    }

    async function handleWhatsAppInput(rawValue, displayValue = '') {
      if (whatsappState.processing) return;

      const value = String(rawValue || '').trim();
      if (!value) return;

      // Always show the complete human-readable choice in the chat.
      // This prevents internal values (e.g. "1") or truncated labels
      // from appearing in the user's message bubble.
      let userMessage = String(displayValue || value).trim();

      if (whatsappState.step === 'service') {
        const selectedService = whatsappServices[value] || Object.values(whatsappServices).find(service => {
          const normalized = value.toLowerCase();
          return normalized === service.label.toLowerCase() || normalized === service.name.toLowerCase();
        });
        if (selectedService) userMessage = selectedService.label;
      }

      if (whatsappState.step === 'staff') {
        const staffLabels = {
          '1': 'Anna Müller',
          '2': 'Lukas Schneider',
          '3': 'Sophie Weber',
          '4': 'Keine Präferenz'
        };
        if (staffLabels[value]) userMessage = staffLabels[value];
      }

      whatsappState.processing = true;
      whatsappQuickReplies.innerHTML = '';
      addWhatsAppMessage(userMessage, 'user');

      try {
        switch (whatsappState.step) {
          case 'menu':
            if (value === '1' || /termin/i.test(value)) {
              await botReply('Sehr gerne. Welche Behandlung möchten Sie buchen?');
              await botReply('Wählen Sie einfach eine der Optionen unten.');
              whatsappAskService();
            } else if (value === '2' || /preis/i.test(value)) {
              await botReply('Unsere Beispielpreise:\n\nDamen Haarschnitt – 49 €\nBalayage – ab 129 €\nHerren Styling – 35 €\nPflegebehandlung – 29 €');
              await botReply('Wie können wir Ihnen weiterhelfen?');
              whatsappMenu();
            } else if (value === '3' || /öffnungszeit/i.test(value)) {
              await botReply('Beispiel-Öffnungszeiten:\nMo–Fr: 09:00–18:00 Uhr\nSa: 09:00–14:00 Uhr\nSo: geschlossen');
              whatsappMenu();
            } else if (value === '4' || /kontakt/i.test(value)) {
              await botReply('SÉLYS Hair & Beauty\nMünster\nTelefon: +49 (0) 251 000 000\nE-Mail: hallo@selys-demo.de');
              whatsappMenu();
            } else {
              await botReply('Bitte wählen Sie 1, 2, 3 oder 4 – oder nutzen Sie eine der Schaltflächen unten.');
              whatsappMenu();
            }
            break;

          case 'service': {
            const selectedService = whatsappServices[value] || Object.values(whatsappServices).find(service => {
              const normalized = value.toLowerCase();
              return normalized === service.label.toLowerCase() || normalized === service.name.toLowerCase();
            });

            if (!selectedService) {
              await botReply('Bitte wählen Sie eine der vier Behandlungen.');
              whatsappAskService();
              break;
            }

            // Keep the full human-readable service. The number is never
            // used in the visible confirmation.
            whatsappState.service = { ...selectedService };

            await botReply(`Gute Wahl: ${selectedService.label}.`);
            await botReply('Gibt es ein bevorzugtes Teammitglied? Sie können auch „Keine Präferenz“ auswählen.');
            await whatsappAskStaff();
            break;
          }

          case 'staff': {
            const staff = {
              '1': 'Anna Müller',
              '2': 'Lukas Schneider',
              '3': 'Sophie Weber',
              '4': 'Keine Präferenz'
            };
            const chosen = staff[value] || Object.values(staff).find(name => value.toLowerCase().includes(name.toLowerCase()));
            if (!chosen) {
              await botReply('Bitte wählen Sie ein Teammitglied oder „Keine Präferenz“.');
              whatsappAskStaff();
              break;
            }
            whatsappState.staff = chosen;
            await botReply(chosen === 'Keine Präferenz'
              ? 'Alles klar – ohne bevorzugtes Teammitglied.'
              : `Alles klar – ${chosen}.`);
            await botReply('Welche Tage passen für Sie? Bitte wählen Sie einen verfügbaren Werktag in den nächsten 7 Tagen.');
            whatsappAskDate();
            break;
          }

          case 'date': {
            const selectedDay = findDemoDay(value);
            if (!selectedDay) {
              await botReply('Bitte wählen Sie einen der angezeigten Werktage.');
              whatsappAskDate();
              break;
            }
            whatsappState.date = selectedDay;
            await botReply(`Für ${selectedDay.label} stehen in unserer DEMO diese Beispielzeiten zur Verfügung:`);
            whatsappAskTime(selectedDay);
            break;
          }

          case 'time': {
            if (value === 'back-date') {
              whatsappState.time = '';
              await botReply('Natürlich. Wählen Sie bitte einen anderen Tag.');
              whatsappAskDate();
              break;
            }
            if (!/^\d{2}:\d{2}$/.test(value) || !whatsappState.date.times.includes(value)) {
              await botReply('Diese Uhrzeit steht für den gewählten Tag nicht zur Verfügung.');
              whatsappAskTime(whatsappState.date);
              break;
            }
            whatsappState.time = value;
            const finalServiceLabel = whatsappState.service && whatsappState.service.label ? whatsappState.service.label : 'Gewählte Behandlung';
            await botReply(`Perfekt. Ihre Beispielauswahl:\n\n${finalServiceLabel}\n${whatsappState.staff}\n${whatsappState.date.label}, ${whatsappState.time} Uhr`);
            await botReply('✅ DEMO-Buchung vorbereitet.\n\nDies ist nur eine Simulation. Es wurde kein echter Termin gebucht und keine Nachricht an einen Salon gesendet.');
            setWhatsAppQuickReplies([{ label: 'Neue Demo starten', value: 'restart', userLabel: 'Neue Demo starten' }]);
            whatsappState.step = 'done';
            break;
          }

          case 'done':
            if (value.toLowerCase() === 'restart' || /neu/i.test(value)) {
              resetWhatsAppDemo();
            } else {
              await botReply('Diese Demo ist abgeschlossen. Sie können unten eine neue Demo starten.');
              setWhatsAppQuickReplies([{ label: 'Neue Demo starten', value: 'restart', userLabel: 'Neue Demo starten' }]);
            }
            break;
        }
      } finally {
        whatsappState.processing = false;
        whatsappInput.value = '';
        whatsappInput.focus();
      }
    }

    function openWhatsAppDemo() {
      whatsappOpener = document.activeElement;
      resetWhatsAppDemo();
      whatsappDemo.classList.add('open');
      whatsappDemo.setAttribute('aria-hidden', 'false');
      document.body.classList.add('overflow-hidden');
      window.setTimeout(() => {
        // Avoid opening the mobile keyboard automatically over the demo chat.
        if (window.matchMedia('(min-width: 768px)').matches) whatsappInput.focus();
      }, 120);
    }

    function closeWhatsAppDemo() {
      whatsappDemo.classList.remove('open');
      whatsappDemo.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('overflow-hidden');
      if (whatsappOpener && typeof whatsappOpener.focus === 'function') whatsappOpener.focus();
    }

    document.getElementById('whatsappHero').addEventListener('click', openWhatsAppDemo);
    whatsappClose.addEventListener('click', closeWhatsAppDemo);
    whatsappDemo.querySelector('.whatsapp-backdrop').addEventListener('click', closeWhatsAppDemo);
    whatsappDemoForm.addEventListener('submit', event => {
      event.preventDefault();
      handleWhatsAppInput(whatsappInput.value);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && whatsappDemo.classList.contains('open')) closeWhatsAppDemo();
    });


    const bookingState = { service:'', price:'', staff:'', date:'', time:'', confirmed:false };
    let currentBookingStep = 1;
    // Hard lock after the demo confirmation: only resetBooking() may unlock the flow.
    let bookingFlowLocked = false;



    // Web3Forms Access Key is stored once in config.js and reused by every form.

    const WEB3_ACCESS_KEY = String(window.WEB3FORMS_ACCESS_KEY || '').trim();

    document.querySelectorAll('input[name="access_key"]').forEach(input => {

      input.value = WEB3_ACCESS_KEY;

    });

    const bookingForm = document.getElementById('bookingSubmitForm');

    // This form is a demo only. Prevent every possible native/implicit submission.
    bookingForm.addEventListener('submit', event => event.preventDefault());

    // Booking uses a simple local demo checkbox, not a real CAPTCHA provider.
    const bookingCaptchaCheck = document.getElementById('bookingCaptchaCheck');
    const bookingCaptchaError = document.getElementById('bookingCaptchaError');
    const bookingCaptchaMessage = 'Bitte bestätigen Sie, dass Sie kein Roboter sind.';

    function updateBookingDemoCaptchaError(show) {
      bookingCaptchaCheck.setAttribute('aria-invalid', show ? 'true' : 'false');
      bookingCaptchaCheck.setCustomValidity(show ? bookingCaptchaMessage : '');
      bookingCaptchaError.textContent = show ? bookingCaptchaMessage : '';
      bookingCaptchaError.classList.toggle('hidden', !show);
    }

    bookingCaptchaCheck.addEventListener('change', () => {
      if (bookingCaptchaCheck.checked) {
        bookingCaptchaCheck.dataset.attempted = 'false';
        updateBookingDemoCaptchaError(false);
      } else if (bookingCaptchaCheck.dataset.attempted === 'true') {
        updateBookingDemoCaptchaError(true);
      }
    });

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



    function getMaxBookingDateISO() {
      const maxDate = new Date();
      maxDate.setHours(0, 0, 0, 0);
      maxDate.setDate(maxDate.getDate() + 6);
      return toISODate(maxDate);
    }



    function isBookingDateAllowed(value) {
      if (!isFourDigitYearValue(value)) return false;
      const selected = new Date(`${value}T00:00:00`);
      if (Number.isNaN(selected.getTime()) || toISODate(selected) !== value) return false;
      const weekday = selected.getDay();
      return value >= getTodayISO() && value <= getMaxBookingDateISO() && weekday !== 0 && weekday !== 6;
    }



    // Example availability differs by weekday; only these times are selectable.
    const bookingDaySchedule = {
      1: ['09:00', '12:00', '15:30'],
      2: ['10:30', '14:00', '17:00'],
      3: ['09:00', '14:00', '15:30'],
      4: ['10:30', '12:00', '17:00'],
      5: ['09:00', '10:30', '14:00', '17:00']
    };



    function canVisitBookingStep(step) {
      // Once the demo booking is completed, only the confirmation screen remains available.
      // The hard lock is cleared exclusively by the explicit restart button.
      if (bookingFlowLocked) return step === 5;
      if (bookingState.confirmed) return step === 5;
      if (step === 1) return true;
      if (step === 2) return Boolean(bookingState.service);
      if (step === 3) return Boolean(bookingState.service && bookingState.staff);
      if (step === 4) {
        const date = bookingState.date;
        const validDate = Boolean(date && bookingDate.value === date && isBookingDateAllowed(date));
        const validTime = Boolean(bookingState.time && timeButtons.some(button => button.dataset.time === bookingState.time && !button.disabled));
        return Boolean(bookingState.service && bookingState.staff && validDate && validTime);
      }
      if (step === 5) return bookingState.confirmed === true;
      return false;
    }

    function updateBookingStepIndicators(currentStep) {
      const stepNavigation = document.getElementById('stepIndicator1')?.parentElement;
      if (stepNavigation) stepNavigation.classList.toggle('hidden', bookingFlowLocked);

      for (let i = 1; i <= 5; i++) {
        const indicator = document.getElementById(`stepIndicator${i}`);
        const available = canVisitBookingStep(i);
        indicator.disabled = !available;
        indicator.setAttribute('aria-disabled', available ? 'false' : 'true');
        indicator.classList.remove('active', 'completed');
        if (i === currentStep) {
          indicator.classList.add('active');
          indicator.setAttribute('aria-current', 'step');
        } else {
          indicator.removeAttribute('aria-current');
          // After confirmation, show earlier steps as completed but keep them disabled.
          if (i < currentStep && (available || bookingState.confirmed)) {
            indicator.classList.add('completed');
          }
        }
      }
    }

    function showBookingStep(step) {
      // Ignore every attempt to navigate away after confirmation; only reset unlocks the flow.
      if (bookingFlowLocked && step !== 5) return;
      // Keep direct navigation from skipping required booking choices.
      if (!canVisitBookingStep(step)) return;
      currentBookingStep = step;
      for (let i = 1; i <= 5; i++) {
        document.getElementById(`bookingStep${i}`).classList.toggle('hidden', i !== step);
      }
      updateBookingStepIndicators(step);
    }

    document.querySelectorAll('[data-booking-step]').forEach(indicator => {
      indicator.addEventListener('click', () => {
        const targetStep = Number(indicator.dataset.bookingStep);
        if (canVisitBookingStep(targetStep)) {
          // Refresh slot availability before entering the appointment/contact steps.
          if (targetStep >= 3) refreshTimeButtons();
          if (canVisitBookingStep(targetStep)) showBookingStep(targetStep);
        } else {
          const hint = targetStep === 2
            ? 'Bitte wählen Sie zuerst eine Leistung.'
            : targetStep === 3
              ? 'Bitte wählen Sie zuerst eine Leistung und ein Teammitglied.'
              : targetStep === 4
                ? 'Bitte wählen Sie zuerst einen gültigen Termin mit Uhrzeit.'
                : 'Bitte schließen Sie zuerst die Demo-Anfrage ab.';
          showToast('Schritt noch nicht verfügbar', hint);
        }
      });
    });



    function setDateLimits() {

      const today = getTodayISO();

      bookingDate.min = today;

      // Booking demo offers only the next 7 calendar days (today + 6), weekdays only.
      bookingDate.max = getMaxBookingDateISO();

      leadDate.min = today;

      leadDate.max = '2099-12-31';

    }



    function validateBookingDate(showRequiredError = true) {

      const value = bookingDate.value;

      const today = getTodayISO();

      let message = '';

      let valid = true;



      if (!value) {

        valid = false;

        message = showRequiredError ? 'Bitte wählen Sie ein Datum aus.' : '';

      } else if (!isFourDigitYearValue(value)) {

        valid = false;

        message = 'Bitte verwenden Sie eine vierstellige Jahreszahl.';

      } else if (value < today) {

        valid = false;

        message = 'Ein Termin in der Vergangenheit kann nicht gebucht werden.';

      } else if (value > getMaxBookingDateISO()) {

        valid = false;

        message = 'Bitte wählen Sie einen Termin innerhalb der nächsten 7 Kalendertage.';

      } else {
        const selectedDate = new Date(`${value}T00:00:00`);
        if (Number.isNaN(selectedDate.getTime()) || toISODate(selectedDate) !== value) {
          valid = false;
          message = 'Bitte wählen Sie ein gültiges Datum.';
        } else if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
          valid = false;
          message = 'Demo-Termine sind von Montag bis Freitag verfügbar.';
        }
      }



      bookingDate.setCustomValidity(valid ? '' : message);

      bookingDateError.textContent = message;

      bookingDateError.classList.toggle('hidden', !message);

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
      const dateAllowed = isBookingDateAllowed(selectedDate);
      const selectedDateObject = dateAllowed ? new Date(`${selectedDate}T00:00:00`) : null;
      const weekday = selectedDateObject ? selectedDateObject.getDay() : null;
      const availableForDay = weekday ? (bookingDaySchedule[weekday] || []) : [];
      let anyAvailable = false;

      timeButtons.forEach(button => {
        const [hours, minutes] = button.dataset.time.split(':').map(Number);
        const timeMinutes = hours * 60 + minutes;
        const isScheduledForDay = availableForDay.includes(button.dataset.time);
        const isPastToday = selectedDate === today && timeMinutes <= currentMinutes;
        const shouldDisable = !dateAllowed || !isScheduledForDay || isPastToday;

        button.disabled = shouldDisable;
        button.setAttribute('aria-disabled', shouldDisable ? 'true' : 'false');

        if (shouldDisable) {
          button.classList.add('opacity-30', 'cursor-not-allowed', 'line-through');
          button.classList.remove('selected');
          if (bookingState.time === button.dataset.time) {
            bookingState.time = '';
            bookingState.confirmed = false;
          }
        } else {
          anyAvailable = true;
          button.classList.remove('opacity-30', 'cursor-not-allowed', 'line-through');
        }
      });

      const hint = document.getElementById('bookingTimeHint');
      if (hint) {
        if (!selectedDate) {
          hint.textContent = 'Bitte wählen Sie zuerst ein Datum. Die verfügbaren Zeiten variieren je Werktag.';
        } else if (!dateAllowed) {
          hint.textContent = 'Bitte wählen Sie einen Werktag innerhalb der nächsten 7 Kalendertage.';
        } else if (!anyAvailable && selectedDate === today) {
          hint.textContent = 'Für heute sind keine späteren Demo-Zeiten mehr verfügbar. Bitte wählen Sie einen anderen Werktag.';
        } else {
          hint.textContent = 'Die angezeigten Zeiten sind unverbindliche Demo-Verfügbarkeiten. Nicht verfügbare Zeiten sind deaktiviert.';
        }
      }

      validateStep3();
      updateBookingStepIndicators(currentBookingStep);
    }


    function validateStep3() {

      const validDate = validateBookingDate(Boolean(bookingDate.value));

      const validTime = !!bookingState.time && timeButtons.some(button => button.dataset.time === bookingState.time && !button.disabled);

      document.getElementById('nextToStep4').disabled = !(validDate && validTime);

    }



    setDateLimits();



    bookingDate.addEventListener('input', () => {

      validateBookingDate();

      bookingState.date = bookingDate.value;
      bookingState.confirmed = false;

      bookingState.time = '';

      timeButtons.forEach(button => button.classList.remove('selected'));

      refreshTimeButtons();

    });



    bookingDate.addEventListener('change', () => {

      validateBookingDate();

      bookingState.date = bookingDate.value;
      bookingState.confirmed = false;

      bookingState.time = '';

      timeButtons.forEach(button => button.classList.remove('selected'));

      refreshTimeButtons();

    });



    leadDate.addEventListener('input', validateLeadDate);

    leadDate.addEventListener('change', validateLeadDate);


    // Kontaktfelder: Telefon nur Ziffern, Name nur lateinische Schrift, mindestens 3 Buchstaben.
    const LATIN_NAME_RE = /^[\p{Script=Latin}\s'’-]+$/u;
    const LATIN_LETTER_RE = /\p{Script=Latin}/u;

    function setFieldError(input, message) {

      const error = document.getElementById(`${input.id}Error`);

      input.setAttribute('aria-invalid', message ? 'true' : 'false');

      if (error) {
        error.textContent = message;
        error.classList.toggle('hidden', !message);
      }

      input.setCustomValidity(message);
    }



    function focusFieldWithError(input, message) {

      setFieldError(input, message);

      input.focus({ preventScroll: true });

      window.setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }



    function validateNameField(input) {

      const value = input.value.trim();
      let message = '';

      if (!value) {

        if (input.required) message = 'Bitte geben Sie Ihren Namen ein.';

      } else if (value.length < 3) {

        message = 'Der Name muss mindestens 3 Zeichen lang sein.';

      } else if (!LATIN_NAME_RE.test(value)) {

        message = 'Bitte verwenden Sie nur lateinische Buchstaben. Leerzeichen, Bindestrich und Apostroph sind erlaubt.';

      } else {

        const letters = Array.from(value).filter(char => LATIN_LETTER_RE.test(char));

        if (letters.length < 3) message = 'Der Name muss mindestens 3 Buchstaben enthalten.';

      }

      setFieldError(input, message);
      return !message;
    }



    function sanitizePhoneValue(value) {

      const raw = String(value || '');
      const hasLeadingPlus = raw.trimStart().startsWith('+');
      const digits = raw.replace(/\D/g, '');

      return hasLeadingPlus ? `+${digits}` : digits;
    }



    function validatePhoneField(input) {

      const value = input.value.trim();
      let message = '';

      if (!value) {

        if (input.required) message = 'Bitte geben Sie Ihre Telefonnummer ein.';

      } else if (!/^\+?[0-9]+$/.test(value)) {

        message = 'Bitte verwenden Sie nur Ziffern und optional ein Pluszeichen am Anfang (z. B. +49123456789).';

      }

      setFieldError(input, message);
      return !message;
    }


    function validateEmailField(input) {

      const value = input.value.trim();
      let message = '';

      if (!value) {

        if (input.required) message = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';

      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {

        message = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';

      }

      setFieldError(input, message);
      return !message;
    }



    function validateCheckboxField(input, message) {

      const error = document.getElementById(`${input.id}Error`);
      const valid = input.checked;

      input.setAttribute('aria-invalid', valid ? 'false' : 'true');
      input.setCustomValidity(valid ? '' : message);

      if (error) {
        error.textContent = valid ? '' : message;
        error.classList.toggle('hidden', valid);
      }

      return valid;
    }



    function invalidateBookingConfirmation(input) {
      if (!input || !input.id.startsWith('booking')) return;
      if (bookingState.confirmed) {
        bookingState.confirmed = false;
        updateBookingStepIndicators(currentBookingStep);
      }
    }



    const contactValidationFields = [

      { name: document.getElementById('bookingName'), phone: document.getElementById('bookingPhone'), email: document.getElementById('bookingEmail'), privacy: document.getElementById('bookingPrivacy') },

      { name: document.getElementById('name'), phone: document.getElementById('phone'), email: document.getElementById('email'), privacy: document.getElementById('privacy') }

    ];



    contactValidationFields.forEach(({ name, phone, email, privacy }) => {

      name.addEventListener('input', () => { invalidateBookingConfirmation(name); validateNameField(name); });
      name.addEventListener('blur', () => validateNameField(name));

      phone.addEventListener('input', () => {

        invalidateBookingConfirmation(phone);
        phone.value = sanitizePhoneValue(phone.value);
        validatePhoneField(phone);

      });

      phone.addEventListener('blur', () => validatePhoneField(phone));

      email.addEventListener('blur', () => validateEmailField(email));
      email.addEventListener('input', () => {
        invalidateBookingConfirmation(email);
        if (email.getAttribute('aria-invalid') === 'true') validateEmailField(email);
      });

      privacy.addEventListener('change', () => {
        invalidateBookingConfirmation(privacy);
        if (privacy.checked) validateCheckboxField(privacy, 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.');
      });

    });



    document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {

      document.querySelectorAll('[data-service]').forEach(x => x.classList.remove('selected'));

      button.classList.add('selected');

      bookingState.service = button.dataset.service;

      bookingState.price = button.dataset.price;
      bookingState.confirmed = false;

      document.getElementById('nextToStep2').disabled = false;
      updateBookingStepIndicators(currentBookingStep);

    }));



    document.getElementById('nextToStep2').addEventListener('click', () => {

      if (bookingState.service) showBookingStep(2);

    });



    document.querySelectorAll('[data-staff]').forEach(button => button.addEventListener('click', () => {

      document.querySelectorAll('[data-staff]').forEach(x => x.classList.remove('selected'));

      button.classList.add('selected');

      bookingState.staff = button.dataset.staff;
      bookingState.confirmed = false;

      document.getElementById('nextToStep3').disabled = false;
      updateBookingStepIndicators(currentBookingStep);

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
      bookingState.confirmed = false;

      document.getElementById('bookingHiddenTime').value = bookingState.time;

      validateStep3();
      updateBookingStepIndicators(currentBookingStep);

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

      // This is the only action that can unlock navigation after the final confirmation.
      bookingFlowLocked = false;
      const stepNavigation = document.getElementById('stepIndicator1')?.parentElement;
      if (stepNavigation) stepNavigation.classList.remove('hidden');

      bookingState.service='';

      bookingState.price='';

      bookingState.staff='';

      bookingState.date='';

      bookingState.time='';
      bookingState.confirmed=false;



      document.querySelectorAll('.booking-option,.time-option').forEach(x => x.classList.remove('selected'));

      document.getElementById('nextToStep2').disabled = true;

      document.getElementById('nextToStep3').disabled = true;

      document.getElementById('nextToStep4').disabled = true;

      bookingForm.reset();

      setDateLimits();

      // Reset custom validation states too; form.reset() does not clear JS-set errors.
      ['bookingName', 'bookingPhone', 'bookingEmail', 'bookingPrivacy'].forEach(id => {
        const input = document.getElementById(id);
        if (input) setFieldError(input, '');
      });
      bookingDate.setCustomValidity('');
      bookingDateError.textContent = '';
      bookingDateError.classList.add('hidden');



      document.getElementById('summaryService').textContent='';

      document.getElementById('summaryStaff').textContent='';

      document.getElementById('summaryDate').textContent='';

      document.getElementById('summaryTime').textContent='';

      document.getElementById('summaryContact').textContent='';



      // Reset the local demo checkbox (the real hCaptcha remains only on the live contact form).
      bookingCaptchaCheck.checked = false;
      bookingCaptchaCheck.dataset.attempted = 'false';
      updateBookingDemoCaptchaError(false);



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

      if (!validateNameField(name)) {

        const message = name.validationMessage;
        focusFieldWithError(name, message);

        return;

      }

      if (!validatePhoneField(phone)) {

        const message = phone.validationMessage;
        focusFieldWithError(phone, message);

        return;

      }

      if (!validateEmailField(email)) {

        focusFieldWithError(email, email.validationMessage);
        return;

      }

      if (!validateCheckboxField(privacy, 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.')) {

        focusFieldWithError(privacy, privacy.validationMessage);
        return;

      }

      if (!bookingCaptchaCheck.checked) {
        bookingCaptchaCheck.dataset.attempted = 'true';
        updateBookingDemoCaptchaError(true);
        bookingCaptchaCheck.focus({ preventScroll: true });
        window.setTimeout(() => bookingCaptchaCheck.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
        return;
      }
      updateBookingDemoCaptchaError(false);



      const date = new Date(`${bookingState.date}T00:00:00`).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});



      document.getElementById('summaryService').textContent = `${bookingState.service} (${bookingState.price})`;

      document.getElementById('summaryStaff').textContent = bookingState.staff;

      document.getElementById('summaryDate').textContent = date;

      document.getElementById('summaryTime').textContent = `${bookingState.time} Uhr`;

      document.getElementById('summaryContact').textContent = `${name.value.trim()} · ${email.value.trim()} · ${phone.value.trim()}`;



      bookingState.confirmed = true;
      bookingFlowLocked = true;
      // Hide all step-navigation buttons so the restart action is the only form control left.
      updateBookingStepIndicators(5);
      showBookingStep(5);

      showToast('Demo abgeschlossen','So würde die Terminbestätigung nach der Buchung aussehen.');

    });



    document.getElementById('restartBooking').addEventListener('click', resetBooking);



    // Keep today's available times up to date while the page is open.

    setInterval(() => {
      if (bookingFlowLocked) return;
      const today = getTodayISO();
      if (bookingDate.min !== today || bookingDate.max !== getMaxBookingDateISO()) setDateLimits();

      if (bookingState.date && bookingState.date < today) {
        bookingState.date = '';
        bookingState.time = '';
        bookingState.confirmed = false;
        bookingDate.value = '';
        timeButtons.forEach(button => button.classList.remove('selected'));
        refreshTimeButtons();
      } else if (bookingState.date === today) {
        refreshTimeButtons();
      }
    }, 30000);



    const leadForm = document.getElementById('leadForm');

    const submitButton = document.getElementById('submitButton');

    const formSuccess = document.getElementById('formSuccess');



    leadForm.addEventListener('submit', async event => {

      event.preventDefault();

      const leadName = document.getElementById('name');
      const leadPhone = document.getElementById('phone');

      if (!validateNameField(leadName)) {
        const message = leadName.validationMessage;
        focusFieldWithError(leadName, message);
        return;
      }

      if (!validatePhoneField(leadPhone)) {
        const message = leadPhone.validationMessage;
        focusFieldWithError(leadPhone, message);
        return;
      }

      const leadEmail = document.getElementById('email');
      const leadPrivacy = document.getElementById('privacy');

      if (!validateEmailField(leadEmail)) {
        focusFieldWithError(leadEmail, leadEmail.validationMessage);
        return;
      }

      if (!validateCheckboxField(leadPrivacy, 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.')) {
        focusFieldWithError(leadPrivacy, leadPrivacy.validationMessage);
        return;
      }

      if (!validateLeadDate()) return;

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
        // Compatible fallback for browsers that do not support Object.fromEntries.
        const payload = {};
        formData.forEach((value, key) => { payload[key] = value; });



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
