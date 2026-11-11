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
      const isEnglish = window.SELYS_LANG === 'en';
      const weekdayName = isEnglish
        ? { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' }
        : { 1: 'Montag', 2: 'Dienstag', 3: 'Mittwoch', 4: 'Donnerstag', 5: 'Freitag', 6: 'Samstag', 7: 'Sonntag' };
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
          return status(isEnglish ? `Closes in ${untilClose} min · today at ${formatTime(todaySchedule.close)}` : `Schließt in ${untilClose} Min. · heute um ${formatTime(todaySchedule.close)} Uhr`, 'soon');
        }
        return status(isEnglish ? `Open · until ${formatTime(todaySchedule.close)} today` : `Geöffnet · heute bis ${formatTime(todaySchedule.close)} Uhr`, 'open');
      }

      if (todaySchedule && minutesNow < todaySchedule.open) {
        const untilOpen = todaySchedule.open - minutesNow;
        if (untilOpen <= 30) {
          return status(isEnglish ? `Opens in ${untilOpen} min · at ${formatTime(todaySchedule.open)}` : `Öffnet in ${untilOpen} Min. · um ${formatTime(todaySchedule.open)} Uhr`, 'soon');
        }
        return status(isEnglish ? `Closed · opens today at ${formatTime(todaySchedule.open)}` : `Geschlossen · öffnet heute um ${formatTime(todaySchedule.open)} Uhr`, 'closed');
      }

      // After closing time or on Sunday: find the next working day.
      for (let offset = 1; offset <= 7; offset++) {
        const nextDay = ((weekday - 1 + offset) % 7) + 1;
        const nextSchedule = scheduleForDay(nextDay);
        if (!nextSchedule) continue;
        let openingText;
        if (offset === 1) openingText = isEnglish ? 'tomorrow' : 'morgen';
        else openingText = weekdayName[nextDay];
        return status(isEnglish ? `Closed · opens ${openingText} at ${formatTime(nextSchedule.open)}` : `Geschlossen · öffnet ${openingText} um ${formatTime(nextSchedule.open)} Uhr`, 'closed');
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

    window.updateSalonOpeningStatus = updateSalonOpeningStatus;
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

      setTimeout(() => showToast(bookingText('contact.onlineTitle', 'Kontaktformular nur online'), bookingText('contact.onlineNote', 'Der echte Spam-Schutz im Kontaktformular benötigt eine gehostete HTTPS-Seite. Die Termin-Demo verwendet eine einfache Demo-Checkbox.')), 900);

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

    // WhatsApp preview is a scripted demo, not an AI agent or a live WhatsApp connection.
    // It reuses the same salon data and locally saved demo bookings as the main booking flow.
    const salonData = window.SELYS_DATA;
    const waIsEnglish = () => window.SELYS_LANG === 'en';
    const waText = (de, en) => waIsEnglish() ? en : de;
    const waServiceName = service => waIsEnglish() ? service.nameEn : service.name;
    const waServicePrice = service => service.priceLabel;
    const waServiceLabel = service => `${waServiceName(service)} – ${waServicePrice(service)}`;
    const waStaffName = member => member.name;

    function whatsappTime() {
      return new Date().toLocaleTimeString(waIsEnglish() ? 'en-GB' : 'de-DE', {
        timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit'
      });
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

    function toISODate(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function whatsappMenu() {
      whatsappState.step = 'menu';
      setWhatsAppQuickReplies([
        { label: waText('Termin buchen', 'Book an appointment'), value: '1' },
        { label: waText('Preise', 'Prices'), value: '2' },
        { label: waText('Öffnungszeiten', 'Opening hours'), value: '3' },
        { label: waText('Kontakt', 'Contact'), value: '4' }
      ]);
    }

    function whatsappAskService() {

      whatsappState.step = 'service';
      setWhatsAppQuickReplies((salonData?.services || []).map(service => ({
        label: waServiceLabel(service), value: service.id, userLabel: waServiceLabel(service)
      })));
    }

    function whatsappAskStaff() {
      whatsappState.step = 'staff';
      const eligible = (salonData?.staff || []).filter(member => whatsappState.service?.staff.includes(member.id));
      setWhatsAppQuickReplies([
        ...eligible.map(member => ({ label: waStaffName(member), value: member.id, userLabel: waStaffName(member) })),
        { label: waText('Keine Präferenz', 'No preference'), value: 'any', userLabel: waText('Keine Präferenz', 'No preference') }
      ]);
    }

    function getWhatsAppAvailableTimes(dateISO) {
      return window.SELYS_BOOKING_ENGINE.getAvailableTimes({
        service: whatsappState.service,
        staff: salonData?.staff || [],
        selectedStaffId: whatsappState.staff?.id || '',
        date: dateISO,
        bookings: getDemoBookings(),
        todayISO: getTodayISO(),
        currentMinutes: getCurrentMinutes()
      });
    }

    function formatDemoDate(date) {
      return date.toLocaleDateString(waIsEnglish() ? 'en-GB' : 'de-DE', {
        timeZone: 'Europe/Berlin', weekday: 'long', day: '2-digit', month: 'long'
      });
    }

    function getDemoDaysNext7Days() {
      const days = [];
      for (let offset = 0; offset < 7; offset++) {
        const parts = getBerlinDateParts();
        const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + offset, 12));
        const weekday = date.getUTCDay();
        if (weekday === 0) continue;
        const iso = date.toISOString().slice(0, 10);
        const times = getWhatsAppAvailableTimes(iso);
        if (!times.length) continue;
        days.push({ date, day: date.getUTCDate(), iso, weekday, times, label: formatDemoDate(date) });
      }
      return days;
    }

    function whatsappAskDate() {
      whatsappState.step = 'date';
      const days = getDemoDaysNext7Days();
      setWhatsAppQuickReplies(days.map(day => ({
        label: `${day.label} · ${day.times.length} ${waText('frei', 'available')}`,
        value: day.iso,
        userLabel: day.label
      })));
      if (!days.length) {
        whatsappState.step = 'done';
        setWhatsAppQuickReplies([{ label: waText('Neue Demo starten', 'Start a new demo'), value: 'restart', userLabel: waText('Neue Demo starten', 'Start a new demo') }]);
      }
    }

    function whatsappAskTime(day) {
      whatsappState.step = 'time';
      setWhatsAppQuickReplies([
        ...day.times.map(time => ({ label: time, value: time, userLabel: time })),
        { label: waText('← Anderen Tag wählen', '← Choose another day'), value: 'back-date', userLabel: waText('← Anderen Tag wählen', '← Choose another day') }
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
      addWhatsAppMessage(waText('Hallo 👋 Willkommen bei SÉLYS.', 'Hello 👋 Welcome to SÉLYS.'));
      addWhatsAppMessage(waText('DEMO – interaktiver WhatsApp-Buchungsassistent.\nKeine echten Termine und keine echten Nachrichten – alles ist eine Simulation.', 'DEMO – interactive WhatsApp booking preview.\nNo real appointments or messages are sent; this is a simulation.'));
      addWhatsAppMessage(waText('Wie können wir Ihnen helfen?', 'How can we help you?'));
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
        const selected = (salonData?.services || []).find(service => service.id === value ||
          [service.name, service.nameEn].some(name => name && name.toLowerCase() === value.toLowerCase()));
        if (selected) userMessage = waServiceLabel(selected);
      }

      if (whatsappState.step === 'staff') {
        const selected = salonData?.staff?.find(member => member.id === value || member.name.toLowerCase() === value.toLowerCase());
        if (selected) userMessage = selected.name;
        else if (value === 'any') userMessage = waText('Keine Präferenz', 'No preference');
      }

      whatsappState.processing = true;
      whatsappQuickReplies.innerHTML = '';
      addWhatsAppMessage(userMessage, 'user');

      try {
        switch (whatsappState.step) {
          case 'menu':
            if (value === '1' || /termin|appointment|book/i.test(value)) {
              await botReply(waText('Welche Behandlung möchten Sie buchen?', 'Which service would you like to book?'));
              whatsappAskService();
            } else if (value === '2' || /preis|price/i.test(value)) {
              const prices = (salonData?.services || []).map(service => waServiceLabel(service)).join('\n');
              await botReply(`${waText('Unsere Beispielpreise:', 'Our demo prices:')}\n\n${prices}`);
              whatsappMenu();
            } else if (value === '3' || /öffnungszeit|opening/i.test(value)) {
              await botReply(waText('Beispiel-Öffnungszeiten:\nMo–Fr: 09:00–18:00 Uhr\nSa: 09:00–14:00 Uhr\nSo: geschlossen', 'Example opening hours:\nMon–Fri: 09:00–18:00\nSat: 09:00–14:00\nSun: closed'));
              whatsappMenu();
            } else if (value === '4' || /kontakt|contact/i.test(value)) {
              await botReply(waText('SÉLYS Hair & Beauty\nMünster\nTelefon: +49 251 555 01 90\nE-Mail: hallo@selys-demo.de', 'SÉLYS Hair & Beauty\nMünster\nPhone: +49 251 555 01 90\nEmail: hallo@selys-demo.de'));
              whatsappMenu();
            } else {
              await botReply(waText('Bitte wählen Sie eine der Optionen unten.', 'Please choose one of the options below.'));
              whatsappMenu();
            }
            break;

          case 'service': {
            const selectedService = (salonData?.services || []).find(service => service.id === value ||
              [service.name, service.nameEn].some(name => name && name.toLowerCase() === value.toLowerCase()));
            if (!selectedService) {
              await botReply(waText('Bitte wählen Sie eine der angezeigten Behandlungen.', 'Please choose one of the listed services.'));
              whatsappAskService();
              break;
            }
            whatsappState.service = selectedService;
            await botReply(`${waText('Gute Wahl:', 'Good choice:')} ${waServiceLabel(selectedService)}.`);
            await botReply(waText('Gibt es ein bevorzugtes Teammitglied?', 'Do you have a preferred team member?'));
            whatsappAskStaff();
            break;
          }

          case 'staff': {
            const chosen = (salonData?.staff || []).find(member => member.id === value || member.name.toLowerCase() === value.toLowerCase());
            if (!chosen && value !== 'any') {
              await botReply(waText('Bitte wählen Sie ein Teammitglied oder „Keine Präferenz“.', 'Please choose a team member or “No preference”.'));
              whatsappAskStaff();
              break;
            }
            whatsappState.staff = chosen ? { id: chosen.id, name: chosen.name } : { id: 'any', name: waText('Keine Präferenz', 'No preference') };
            await botReply(chosen ? `${waText('Alles klar –', 'All right –')} ${chosen.name}.` : waText('Alles klar – ohne bevorzugtes Teammitglied.', 'All right – no team preference.'));
            whatsappAskDate();
            if (whatsappState.step === 'date' && !whatsappQuickReplies.children.length) {
              await botReply(waText('In den nächsten sieben Tagen ist für diese Auswahl kein passender Demo-Termin frei.', 'No suitable demo appointment is available for this selection in the next seven days.'));
            } else {
              await botReply(waText('Bitte wählen Sie einen verfügbaren Tag in den nächsten sieben Tagen.', 'Please choose an available day within the next seven days.'));
            }
            break;
          }

          case 'date': {
            const selectedDay = getDemoDaysNext7Days().find(day => day.iso === value);
            if (!selectedDay) {
              await botReply(waText('Bitte wählen Sie einen der angezeigten Tage.', 'Please choose one of the displayed days.'));
              whatsappAskDate();
              break;
            }
            whatsappState.date = selectedDay;
            await botReply(`${waText('Für', 'Available times for')} ${selectedDay.label}:`);
            whatsappAskTime(selectedDay);
            break;
          }

          case 'time': {
            if (value === 'back-date') {
              whatsappState.time = '';
              await botReply(waText('Natürlich. Wählen Sie bitte einen anderen Tag.', 'Of course. Please choose another day.'));
              whatsappAskDate();
              break;
            }
            const currentDay = getDemoDaysNext7Days().find(day => day.iso === whatsappState.date?.iso);
            if (!/^\d{2}:\d{2}$/.test(value) || !currentDay?.times.includes(value)) {
              await botReply(waText('Diese Uhrzeit ist nicht mehr verfügbar. Bitte wählen Sie einen anderen Termin.', 'This time is no longer available. Please choose another slot.'));
              if (currentDay) whatsappAskTime(currentDay); else whatsappAskDate();
              break;
            }
            whatsappState.date = currentDay;
            whatsappState.time = value;
            const endMinutes = Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) + whatsappState.service.duration;
            const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
            await botReply(`${waText('Ihre Demo-Auswahl:', 'Your demo selection:')}\n\n${waServiceLabel(whatsappState.service)}\n${whatsappState.staff.name}\n${currentDay.label}, ${value}–${endTime}`);
            await botReply(waText('DEMO-Buchung vorbereitet. Es wurde kein echter Termin gebucht und keine Nachricht gesendet.', 'Demo booking prepared. No real appointment was created and no message was sent.'));
            setWhatsAppQuickReplies([{ label: waText('Neue Demo starten', 'Start a new demo'), value: 'restart', userLabel: waText('Neue Demo starten', 'Start a new demo') }]);
            whatsappState.step = 'done';
            break;
          }

          case 'done':
            if (value.toLowerCase() === 'restart' || /neu|new/i.test(value)) resetWhatsAppDemo();
            else {
              await botReply(waText('Diese Demo ist abgeschlossen. Sie können unten neu starten.', 'This demo is complete. You can start again below.'));
              setWhatsAppQuickReplies([{ label: waText('Neue Demo starten', 'Start a new demo'), value: 'restart', userLabel: waText('Neue Demo starten', 'Start a new demo') }]);
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

    [document.getElementById('whatsappHero'), document.getElementById('whatsappFloating')].filter(Boolean).forEach(button => button.addEventListener('click', openWhatsAppDemo));
    if (window.location.hash === '#whatsapp') openWhatsAppDemo();
    whatsappClose.addEventListener('click', closeWhatsAppDemo);
    whatsappDemo.querySelector('.whatsapp-backdrop').addEventListener('click', closeWhatsAppDemo);
    whatsappDemoForm.addEventListener('submit', event => {
      event.preventDefault();
      handleWhatsAppInput(whatsappInput.value);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && whatsappDemo.classList.contains('open')) closeWhatsAppDemo();
    });


    const bookingState = { service:'', serviceId:'', price:'', staff:'', staffId:'', date:'', time:'', confirmed:false };
    let currentBookingStep = 1;
    // Hard lock after the demo confirmation: only resetBooking() may unlock the flow.
    let bookingFlowLocked = false;
    let rescheduleReference = '';



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
    const bookingCaptchaMessage = () => bookingText('booking.errorCaptcha', 'Bitte bestätigen Sie, dass Sie kein Roboter sind.');

    function updateBookingDemoCaptchaError(show) {
      const message = show ? bookingCaptchaMessage() : '';
      bookingCaptchaCheck.setAttribute('aria-invalid', show ? 'true' : 'false');
      bookingCaptchaCheck.setCustomValidity(message);
      bookingCaptchaError.textContent = message;
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

    let timeButtons = Array.from(document.querySelectorAll('.time-option'));
    const BOOKING_STORAGE_KEY = 'selys-demo-bookings';
    const BOOKING_DATA = window.SELYS_DATA;



    function getBerlinDateParts(date = new Date()) {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(date).reduce((result, part) => {
        result[part.type] = part.value;
        return result;
      }, {});
      return parts;
    }

    function getTodayISO() {
      const parts = getBerlinDateParts();
      return `${parts.year}-${parts.month}-${parts.day}`;
    }

    function getCurrentMinutes() {
      const parts = getBerlinDateParts();
      return Number(parts.hour) * 60 + Number(parts.minute);
    }



    function isFourDigitYearValue(value) {

      return /^\d{4}-\d{2}-\d{2}$/.test(value);

    }



    function getBerlinISODate(offsetDays = 0) {
      const parts = getBerlinDateParts();
      const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + offsetDays, 12));
      return date.toISOString().slice(0, 10);
    }

    function getBerlinWeekday(value) {
      return new Date(`${value}T12:00:00Z`).getUTCDay();
    }

    function getMaxBookingDateISO() { return getBerlinISODate(13); }



    function isBookingDateAllowed(value) {
      if (!isFourDigitYearValue(value)) return false;
      const selected = new Date(`${value}T12:00:00Z`);
      if (Number.isNaN(selected.getTime()) || selected.toISOString().slice(0, 10) !== value) return false;
      const weekday = selected.getUTCDay();
      return value >= getTodayISO() && value <= getMaxBookingDateISO() && weekday !== 0;
    }



    // Availability is derived from one shared salon dataset and local demo bookings.
    // Personal contact details are never stored in localStorage.
    function getDemoBookings() {
      try {
        const value = JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY) || '[]');
        return Array.isArray(value) ? value.filter(item => item && item.date && item.staffId && item.start && item.end) : [];
      } catch (_) { return []; }
    }

    function saveDemoBooking(booking, replaceReference = '') {
      const bookings = getDemoBookings();
      if (replaceReference) {
        const previous = bookings.find(item => item.reference === replaceReference && item.status !== 'cancelled');
        if (!previous) return false;
        previous.status = 'cancelled';
        previous.cancelledAt = new Date().toISOString();
        previous.replacedBy = booking.reference;
      }
      bookings.push(booking);
      try { localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings.slice(-100))); return true; }
      catch (_) { return false; }
    }

    function formatSavedBookingDate(value) {
      const date = new Date(`${value}T12:00:00Z`);
      return date.toLocaleDateString(window.SELYS_LANG === 'en' ? 'en-GB' : 'de-DE', {
        timeZone: 'Europe/Berlin', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
      });
    }

    function renderSavedDemoBookings() {
      const panel = document.getElementById('demoBookingsPanel');
      const host = document.getElementById('demoBookingsList');
      if (!panel || !host) return;
      const active = getDemoBookings()
        .filter(item => item.status !== 'cancelled')
        .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
      panel.classList.toggle('hidden', active.length === 0);
      host.innerHTML = active.map(item => {
        const service = BOOKING_DATA.services.find(entry => entry.id === item.serviceId);
        const member = BOOKING_DATA.staff.find(entry => entry.id === item.staffId);
        const serviceName = service ? (window.SELYS_LANG === 'en' ? service.nameEn : service.name) : item.serviceId;
        const staffName = member?.name || item.staffId;
        const dateLabel = formatSavedBookingDate(item.date);
        const rescheduleLabel = bookingText('booking.reschedule', 'Verschieben');
        const cancelLabel = bookingText('booking.cancel', 'Stornieren');
        return `<article class="demo-booking-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-black/10 bg-cream p-4" data-demo-booking="${String(item.reference).replace(/[^A-Za-z0-9_-]/g, '')}">
          <div class="min-w-0">
            <div class="font-semibold">${escapeHTML(serviceName)}</div>
            <div class="text-sm text-muted mt-1">${escapeHTML(staffName)} · ${escapeHTML(dateLabel)} · ${escapeHTML(item.start)}–${escapeHTML(item.end)}</div>
            <div class="text-xs text-muted mt-1">${escapeHTML(bookingText('booking.reference', 'Referenz'))}: ${escapeHTML(item.reference)}</div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button type="button" class="min-h-[42px] px-4 border border-black/20 text-xs font-semibold hover:bg-white" data-reschedule-booking="${escapeHTML(item.reference)}">${escapeHTML(rescheduleLabel)}</button>
            <button type="button" class="min-h-[42px] px-4 border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50" data-cancel-booking="${escapeHTML(item.reference)}">${escapeHTML(cancelLabel)}</button>
          </div>
        </article>`;
      }).join('');
    }

    function escapeHTML(value) {
      return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    }

    function cancelDemoBooking(reference) {
      const bookings = getDemoBookings();
      const target = bookings.find(item => item.reference === reference && item.status !== 'cancelled');
      if (!target) return false;
      target.status = 'cancelled';
      target.cancelledAt = new Date().toISOString();
      try { localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings.slice(-100))); return true; }
      catch (_) { return false; }
    }

    function beginDemoReschedule(reference) {
      const booking = getDemoBookings().find(item => item.reference === reference && item.status !== 'cancelled');
      const service = booking && BOOKING_DATA.services.find(item => item.id === booking.serviceId);
      const member = booking && BOOKING_DATA.staff.find(item => item.id === booking.staffId);
      if (!booking || !service || !member) {
        showToast(bookingText('booking.errorTitle', 'Demo-Termin nicht gefunden'), bookingText('booking.errorMissing', 'Dieser Demo-Termin kann nicht geändert werden.'));
        return;
      }

      // Reuse the same five-step flow. The old slot stays blocked until the new slot is saved.
      resetBooking();
      rescheduleReference = reference;
      bookingFlowLocked = false;
      bookingState.serviceId = service.id;
      bookingState.service = window.SELYS_LANG === 'en' ? service.nameEn : service.name;
      bookingState.price = service.priceLabel;
      bookingState.staffId = member.id;
      bookingState.staff = member.name;
      document.querySelectorAll('[data-service-id]').forEach(button => button.classList.toggle('selected', button.dataset.serviceId === service.id));
      document.querySelectorAll('[data-staff]').forEach(button => button.classList.toggle('selected', button.dataset.staffId === member.id));
      document.getElementById('bookingHiddenService').value = bookingState.service;
      document.getElementById('bookingHiddenPrice').value = bookingState.price;
      document.getElementById('bookingHiddenStaff').value = bookingState.staff;
      document.getElementById('nextToStep2').disabled = false;
      document.getElementById('nextToStep3').disabled = false;
      updateStaffOptions();
      showBookingStep(3);
      refreshTimeButtons();
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast(bookingText('booking.rescheduleTitle', 'Demo-Termin ändern'), bookingText('booking.rescheduleNote', 'Wählen Sie jetzt einen neuen Tag und eine neue Uhrzeit.'));
    }

    document.getElementById('demoBookingsList')?.addEventListener('click', event => {
      const cancelButton = event.target.closest('[data-cancel-booking]');
      if (cancelButton) {
        const reference = cancelButton.dataset.cancelBooking;
        const confirmed = window.confirm(bookingText('booking.confirmCancel', 'Diesen Demo-Termin wirklich stornieren?'));
        if (!confirmed) return;
        if (cancelDemoBooking(reference)) {
          renderSavedDemoBookings();
          refreshTimeButtons();
          showToast(bookingText('booking.cancelledTitle', 'Demo-Termin storniert'), bookingText('booking.cancelledNote', 'Der lokale Demo-Termin wurde storniert.'));
        } else {
          showToast(bookingText('booking.errorTitle', 'Speicherfehler'), bookingText('common.storageError', 'Demo-Daten konnten nicht gespeichert werden.'));
        }
        return;
      }
      const rescheduleButton = event.target.closest('[data-reschedule-booking]');
      if (rescheduleButton) beginDemoReschedule(rescheduleButton.dataset.rescheduleBooking);
    });

    function getSelectedServiceData() {
      return BOOKING_DATA?.services?.find(service => service.id === bookingState.serviceId) || null;
    }

    function getCandidateStaff() {
      return window.SELYS_BOOKING_ENGINE.getCandidateStaff(getSelectedServiceData(), BOOKING_DATA?.staff || [], bookingState.staffId);
    }

    function updateStaffOptions() {
      const service = getSelectedServiceData();
      document.querySelectorAll('[data-staff]').forEach(button => {
        const id = button.dataset.staffId;
        const available = id === 'any' || Boolean(service && service.staff.includes(id));
        button.disabled = !available;
        button.classList.toggle('is-unavailable', !available);
        button.setAttribute('aria-disabled', available ? 'false' : 'true');
      });
    }

    function hasStaffConflict(staffId, date, startMinutes, endMinutes) {
      return !window.SELYS_BOOKING_ENGINE.isStaffAvailable({
        member: BOOKING_DATA?.staff?.find(item => item.id === staffId),
        date,
        startMinutes,
        duration: endMinutes - startMinutes,
        bookings: getDemoBookings(),
        todayISO: getTodayISO(),
        currentMinutes: getCurrentMinutes()
      });
    }

    function isStaffAvailable(member, date, startMinutes, duration) {
      return window.SELYS_BOOKING_ENGINE.isStaffAvailable({
        member, date, startMinutes, duration,
        bookings: getDemoBookings(),
        todayISO: getTodayISO(),
        currentMinutes: getCurrentMinutes()
      });
    }

    function getAvailableStaffForSlot(date, time) {
      return window.SELYS_BOOKING_ENGINE.getAvailableStaffForSlot({
        service: getSelectedServiceData(), staff: BOOKING_DATA?.staff || [],
        selectedStaffId: bookingState.staffId, date, time,
        bookings: getDemoBookings(), todayISO: getTodayISO(), currentMinutes: getCurrentMinutes()
      });
    }

    function getAvailableTimes(date) {
      const service = getSelectedServiceData();
      if (!service || !isBookingDateAllowed(date)) return [];
      return window.SELYS_BOOKING_ENGINE.getAvailableTimes({
        service, staff: BOOKING_DATA?.staff || [], selectedStaffId: bookingState.staffId,
        date, bookings: getDemoBookings(), todayISO: getTodayISO(), currentMinutes: getCurrentMinutes()
      });
    }

    function formatBookingMoney(value) {
      return new Intl.NumberFormat(window.SELYS_LANG === 'en' ? 'en-IE' : 'de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
    }

    function bookingText(key, fallback) {
      return window.SELYS_T ? window.SELYS_T(key) : fallback;
    }



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
            ? bookingText('booking.errorStepService', 'Bitte wählen Sie zuerst eine Leistung.')
            : targetStep === 3
              ? bookingText('booking.errorStepStaff', 'Bitte wählen Sie zuerst eine Leistung und ein Teammitglied.')
              : targetStep === 4
                ? bookingText('booking.errorStepTime', 'Bitte wählen Sie zuerst einen gültigen Termin mit Uhrzeit.')
                : bookingText('booking.errorStepFinish', 'Bitte schließen Sie zuerst die Demo-Anfrage ab.');
          showToast(bookingText('booking.errorStepTitle', 'Schritt noch nicht verfügbar'), hint);
        }
      });
    });



    function setDateLimits() {

      const today = getTodayISO();

      bookingDate.min = today;

      // Booking demo offers the next 14 calendar days; Sundays are closed.
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

        message = showRequiredError ? bookingText('booking.errorRequiredDate', 'Bitte wählen Sie ein Datum aus.') : '';

      } else if (!isFourDigitYearValue(value)) {

        valid = false;

        message = bookingText('booking.errorYear', 'Bitte verwenden Sie eine vierstellige Jahreszahl.');

      } else if (value < today) {

        valid = false;

        message = bookingText('booking.errorDate', 'Bitte wählen Sie einen Öffnungstag innerhalb der nächsten 14 Tage.');

      } else if (value > getMaxBookingDateISO()) {

        valid = false;

        message = bookingText('booking.errorDate', 'Bitte wählen Sie einen Öffnungstag innerhalb der nächsten 14 Tage.');

      } else {
        const selectedDate = new Date(`${value}T12:00:00Z`);
        if (Number.isNaN(selectedDate.getTime()) || selectedDate.toISOString().slice(0, 10) !== value) {
          valid = false;
          message = window.SELYS_LANG === 'en' ? 'Please choose a valid date.' : 'Bitte wählen Sie ein gültiges Datum.';
        } else if (selectedDate.getUTCDay() === 0) {
          valid = false;
          message = bookingText('booking.errorDate', 'Bitte wählen Sie einen Öffnungstag innerhalb der nächsten 14 Tage.');
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

        message = bookingText('booking.errorYear', 'Bitte verwenden Sie eine vierstellige Jahreszahl.');

      } else if (value && value < today) {

        valid = false;

        message = bookingText('booking.errorLeadDate', 'Bitte wählen Sie heute oder ein zukünftiges Datum.');

      }



      leadDate.setCustomValidity(valid ? '' : message);

      leadDateError.textContent = message;

      leadDateError.classList.toggle('hidden', valid);

      return valid;

    }



    function refreshTimeButtons() {
      const selectedDate = bookingDate.value;
      const container = document.getElementById('bookingTimeSlots');
      const selectedTime = bookingState.time;
      const dateAllowed = isBookingDateAllowed(selectedDate);
      const availableTimes = dateAllowed ? getAvailableTimes(selectedDate) : [];

      if (container) {
        if (!bookingState.serviceId) {
          container.innerHTML = `<p class="text-xs text-muted col-span-full">${bookingText('booking.chooseService', 'Bitte wählen Sie zuerst eine Leistung.')}</p>`;
        } else if (!selectedDate) {
          container.innerHTML = `<p class="text-xs text-muted col-span-full">${bookingText('booking.chooseDate', 'Bitte wählen Sie zuerst ein Datum.')}</p>`;
        } else if (!availableTimes.length) {
          container.innerHTML = `<p class="text-xs text-muted col-span-full">${bookingText('booking.noTimes', 'Keine passenden Zeiten verfügbar.')}</p>`;
        } else {
          container.innerHTML = availableTimes.map(time => `<button type="button" class="time-option min-h-[48px] border border-black/10 text-sm${time === selectedTime ? ' selected' : ''}" data-time="${time}" aria-pressed="${time === selectedTime ? 'true' : 'false'}">${time}</button>`).join('');
        }
      }
      timeButtons = Array.from(document.querySelectorAll('#bookingTimeSlots .time-option'));
      if (bookingState.time && !availableTimes.includes(bookingState.time)) {
        bookingState.time = '';
        bookingState.confirmed = false;
      }

      const hint = document.getElementById('bookingTimeHint');
      if (hint) {
        if (!bookingState.serviceId) hint.textContent = bookingText('booking.chooseService', 'Bitte wählen Sie zuerst eine Leistung.');
        else if (!selectedDate) hint.textContent = bookingText('booking.chooseDate', 'Bitte wählen Sie zuerst ein Datum.');
        else if (!dateAllowed) hint.textContent = bookingText('booking.errorDate', 'Bitte wählen Sie einen Öffnungstag innerhalb der nächsten 14 Tage.');
        else if (!availableTimes.length && selectedDate === getTodayISO()) hint.textContent = bookingText('booking.todayNoTimes', 'Für heute sind keine passenden Zeiten mehr verfügbar.');
        else if (!availableTimes.length) hint.textContent = bookingText('booking.noTimes', 'Keine passenden Zeiten verfügbar.');
        else hint.textContent = window.SELYS_LANG === 'en'
          ? 'Times are demo availability based on the selected service and team schedule. A saved demo booking blocks overlapping slots in this browser.'
          : 'Die Demo-Verfügbarkeit berücksichtigt Leistung, Team-Schicht und bereits gespeicherte Demo-Termine in diesem Browser.';
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

        if (input.required) message = bookingText('booking.errorNameRequired', 'Bitte geben Sie Ihren Namen ein.');

      } else if (value.length < 3) {

        message = bookingText('booking.errorNameLength', 'Der Name muss mindestens 3 Zeichen lang sein.');

      } else if (!LATIN_NAME_RE.test(value)) {

        message = bookingText('booking.errorNameLetters', 'Bitte verwenden Sie nur lateinische Buchstaben. Leerzeichen, Bindestrich und Apostroph sind erlaubt.');

      } else {

        const letters = Array.from(value).filter(char => LATIN_LETTER_RE.test(char));

        if (letters.length < 3) message = bookingText('booking.errorNameMinLetters', 'Der Name muss mindestens 3 Buchstaben enthalten.');

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

        if (input.required) message = bookingText('booking.errorPhoneRequired', 'Bitte geben Sie Ihre Telefonnummer ein.');

      } else if (!/^\+?[0-9]+$/.test(value)) {

        message = bookingText('booking.errorPhoneFormat', 'Bitte verwenden Sie nur Ziffern und optional ein Pluszeichen am Anfang (z. B. +49123456789).');

      }

      setFieldError(input, message);
      return !message;
    }


    function validateEmailField(input) {

      const value = input.value.trim();
      let message = '';

      if (!value) {

        if (input.required) message = bookingText('booking.errorEmailRequired', 'Bitte geben Sie Ihre E-Mail-Adresse ein.');

      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {

        message = bookingText('booking.errorEmailFormat', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');

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
      document.querySelectorAll('[data-service]').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      const service = BOOKING_DATA?.services?.find(item => item.id === button.dataset.serviceId);
      if (!service) return;
      bookingState.serviceId = service.id;
      bookingState.service = window.SELYS_LANG === 'en' ? service.nameEn : service.name;
      bookingState.price = service.priceLabel;
      bookingState.staff = '';
      bookingState.staffId = '';
      bookingState.time = '';
      bookingState.confirmed = false;
      document.querySelectorAll('[data-staff]').forEach(item => item.classList.remove('selected'));
      updateStaffOptions();
      document.getElementById('bookingHiddenService').value = bookingState.service;
      document.getElementById('bookingHiddenPrice').value = bookingState.price;
      document.getElementById('nextToStep2').disabled = false;
      updateBookingStepIndicators(currentBookingStep);
      refreshTimeButtons();
    }));



    document.getElementById('nextToStep2').addEventListener('click', () => {

      if (bookingState.service) showBookingStep(2);

    });



    document.querySelectorAll('[data-staff]').forEach(button => button.addEventListener('click', () => {
      const service = getSelectedServiceData();
      const staffId = button.dataset.staffId || '';
      if (staffId !== 'any' && service && !service.staff.includes(staffId)) return;
      document.querySelectorAll('[data-staff]').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      bookingState.staffId = staffId;
      bookingState.staff = staffId === 'any' ? bookingText('booking.anyStaff', 'Keine Präferenz') : button.dataset.staff;
      bookingState.confirmed = false;
      bookingState.time = '';
      document.getElementById('bookingHiddenStaff').value = bookingState.staff;
      document.getElementById('nextToStep3').disabled = false;
      refreshTimeButtons();
      updateBookingStepIndicators(currentBookingStep);
    }));



    document.getElementById('backToStep1').addEventListener('click', () => showBookingStep(1));

    document.getElementById('nextToStep3').addEventListener('click', () => {

      if (bookingState.staff) showBookingStep(3);

    });

    document.getElementById('backToStep2').addEventListener('click', () => showBookingStep(2));



    document.getElementById('bookingTimeSlots').addEventListener('click', event => {
      const button = event.target.closest('.time-option');
      if (!button || button.disabled) return;
      document.querySelectorAll('.time-option').forEach(item => { item.classList.remove('selected'); item.setAttribute('aria-pressed', 'false'); });
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      bookingState.time = button.dataset.time;
      bookingState.confirmed = false;
      document.getElementById('bookingHiddenTime').value = bookingState.time;
      validateStep3();
      updateBookingStepIndicators(currentBookingStep);
    });



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

        showToast(bookingText('booking.errorTimeTitle', 'Uhrzeit auswählen'), bookingText('booking.errorTime', 'Bitte wählen Sie eine verfügbare Uhrzeit.'));

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
      rescheduleReference = '';
      const stepNavigation = document.getElementById('stepIndicator1')?.parentElement;
      if (stepNavigation) stepNavigation.classList.remove('hidden');

      bookingState.service = '';
      bookingState.serviceId = '';
      bookingState.price = '';
      bookingState.staff = '';
      bookingState.staffId = '';
      bookingState.date = '';
      bookingState.time = '';
      bookingState.confirmed = false;



      document.querySelectorAll('.booking-option,.time-option').forEach(x => x.classList.remove('selected'));

      document.getElementById('nextToStep2').disabled = true;

      document.getElementById('nextToStep3').disabled = true;

      document.getElementById('nextToStep4').disabled = true;
      ['bookingHiddenService','bookingHiddenPrice','bookingHiddenStaff','bookingHiddenDate','bookingHiddenTime'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
      });
      updateStaffOptions();
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
      if (document.getElementById('summaryReference')) document.getElementById('summaryReference').textContent='';



      // Reset the local demo checkbox (the real hCaptcha remains only on the live contact form).
      bookingCaptchaCheck.checked = false;
      bookingCaptchaCheck.dataset.attempted = 'false';
      updateBookingDemoCaptchaError(false);



      showBookingStep(1);
      refreshTimeButtons();
      renderSavedDemoBookings();
    }

    window.refreshSelysBookingUi = () => {
      const selectedDate = bookingDate.value;
      bookingDate.min = getTodayISO();
      bookingDate.max = getMaxBookingDateISO();
      if (selectedDate) refreshTimeButtons();
      const service = getSelectedServiceData();
      if (service) bookingState.service = window.SELYS_LANG === 'en' ? service.nameEn : service.name;
      const staff = BOOKING_DATA?.staff?.find(item => item.id === bookingState.staffId);
      if (staff) bookingState.staff = staff.name;
      updateStaffOptions();
      renderSavedDemoBookings();
    };
    window.addEventListener('selys:demo-reset', () => { renderSavedDemoBookings(); if (!bookingFlowLocked) refreshTimeButtons(); else resetBooking(); });



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
      const availableStaff = getAvailableStaffForSlot(bookingState.date, bookingState.time);
      if (!chosenTimeButton || !availableStaff.length) {
        showBookingStep(3);
        showToast(bookingText('booking.errorSlotTaken', 'Termin nicht verfügbar'), bookingText('booking.errorSlotTaken', 'Dieser Termin ist nicht mehr verfügbar. Bitte wählen Sie eine andere Uhrzeit.'));
        refreshTimeButtons();
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

      if (!validateCheckboxField(privacy, bookingText('booking.errorPrivacy', 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.'))) {

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



      const date = formatSavedBookingDate(bookingState.date);
      const assignedStaff = availableStaff[0];
      const serviceData = getSelectedServiceData();
      const [startHour, startMinute] = bookingState.time.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = startMinutes + serviceData.duration;
      const end = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
      const reference = `DEMO-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const record = { reference, serviceId: serviceData.id, staffId: assignedStaff.id, date: bookingState.date, start: bookingState.time, end, startMinutes, endMinutes, status: 'demo', createdAt: new Date().toISOString() };
      if (!saveDemoBooking(record, rescheduleReference)) {
        showToast('Speicherfehler', bookingText('common.storageError', 'Die Demo-Daten konnten nicht gespeichert werden.'));
        return;
      }
      rescheduleReference = '';
      renderSavedDemoBookings();
      bookingState.staffId = assignedStaff.id;
      bookingState.staff = assignedStaff.name;
      document.getElementById('summaryService').textContent = `${bookingState.service} (${bookingState.price})`;
      document.getElementById('summaryStaff').textContent = bookingState.staff;
      document.getElementById('summaryDate').textContent = date;
      document.getElementById('summaryTime').textContent = `${bookingState.time}–${end} Uhr`;
      document.getElementById('summaryContact').textContent = `${name.value.trim()} · ${email.value.trim()} · ${phone.value.trim()}`;
      if (document.getElementById('summaryReference')) document.getElementById('summaryReference').textContent = reference;

      bookingState.confirmed = true;
      bookingFlowLocked = true;
      // Hide all step-navigation buttons so the restart action is the only form control left.
      updateBookingStepIndicators(5);
      showBookingStep(5);

      showToast(bookingText('booking.success', 'Demo abgeschlossen'), bookingText('booking.successToast', 'Ihre Demo-Auswahl wurde lokal gespeichert. Es wurde kein echter Termin übermittelt.'));

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

      if (!validateCheckboxField(leadPrivacy, bookingText('booking.errorPrivacy', 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.'))) {
        focusFieldWithError(leadPrivacy, leadPrivacy.validationMessage);
        return;
      }

      if (!validateLeadDate()) return;

      if (!WEB3_ACCESS_KEY) {

        showToast(bookingText('contact.setupTitle', 'Web3Forms noch nicht eingerichtet'), bookingText('contact.setupNote', 'Bitte tragen Sie den Web3Forms Access Key einmal in config.js ein.'));

        return;

      }

      if (!getCaptchaToken(leadForm)) {

        showToast(bookingText('contact.captchaTitle', 'hCaptcha fehlt'), bookingText('contact.captchaNote', 'Bitte lösen Sie zuerst die hCaptcha-Prüfung.'));

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

        showToast(bookingText('contact.sentTitle', 'Anfrage gesendet'), bookingText('contact.sentNote', 'Vielen Dank! Ihre Demo-Anfrage wurde übermittelt.'));

      } catch (error) {

        console.error('Web3Forms error:', error);

        showToast(bookingText('contact.errorTitle', 'Fehler beim Senden'), error?.message || bookingText('contact.errorNote', 'Bitte versuchen Sie es später erneut.'));

      } finally { submitButton.disabled = false; submitButton.textContent = original; }

    });



    showBookingStep(1);
    renderSavedDemoBookings();
