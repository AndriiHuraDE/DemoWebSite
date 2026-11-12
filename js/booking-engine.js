(() => {
  'use strict';

  const validISODate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  const weekday = value => validISODate(value) ? new Date(`${value}T12:00:00Z`).getUTCDay() : -1;
  const toMinutes = value => {
    const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
    return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
  };
  const fromMinutes = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

  function normalizeBookings(bookings) {
    return Array.isArray(bookings) ? bookings.filter(item => item && item.date && item.staffId && item.start && item.end && item.status !== 'cancelled') : [];
  }

  function getCandidateStaff(service, staff, selectedStaffId = '') {
    if (!service || !Array.isArray(service.staff) || !Array.isArray(staff)) return [];
    return staff.filter(member => service.staff.includes(member.id) && (!selectedStaffId || selectedStaffId === 'any' || member.id === selectedStaffId));
  }

  function isStaffAvailable({ member, date, startMinutes, duration, bookings = [], todayISO = '', currentMinutes = -1 }) {
    if (!member || !validISODate(date) || !Number.isFinite(startMinutes) || !Number.isFinite(duration) || duration <= 0) return false;
    const shift = member.schedule?.[weekday(date)];
    if (!Array.isArray(shift) || shift.length !== 2) return false;
    const shiftStart = toMinutes(shift[0]);
    const shiftEnd = toMinutes(shift[1]);
    const endMinutes = startMinutes + duration;
    if (!Number.isFinite(shiftStart) || !Number.isFinite(shiftEnd) || startMinutes < shiftStart || endMinutes > shiftEnd) return false;
    if (date === todayISO && currentMinutes >= 0 && startMinutes <= currentMinutes) return false;
    return !normalizeBookings(bookings).some(item => {
      if (item.staffId !== member.id || item.date !== date) return false;
      const existingStart = Number.isFinite(Number(item.startMinutes)) ? Number(item.startMinutes) : toMinutes(item.start);
      const existingEnd = Number.isFinite(Number(item.endMinutes)) ? Number(item.endMinutes) : toMinutes(item.end);
      return Number.isFinite(existingStart) && Number.isFinite(existingEnd) && startMinutes < existingEnd && endMinutes > existingStart;
    });
  }

  function getAvailableStaffForSlot({ service, staff, selectedStaffId = '', date, time, bookings = [], todayISO = '', currentMinutes = -1 }) {
    const startMinutes = toMinutes(time);
    if (!Number.isFinite(startMinutes)) return [];
    return getCandidateStaff(service, staff, selectedStaffId).filter(member => isStaffAvailable({ member, date, startMinutes, duration: service.duration, bookings, todayISO, currentMinutes }));
  }


  function getCandidateTimes({ service, staff, selectedStaffId = '', date, stepMinutes = 30 }) {
    if (!service || !validISODate(date) || !Number.isFinite(Number(service.duration)) || Number(service.duration) <= 0) return [];
    const times = new Set();
    getCandidateStaff(service, staff, selectedStaffId).forEach(member => {
      const shift = member.schedule?.[weekday(date)];
      if (!Array.isArray(shift) || shift.length !== 2) return;
      const open = toMinutes(shift[0]);
      const close = toMinutes(shift[1]);
      if (!Number.isFinite(open) || !Number.isFinite(close)) return;
      for (let start = open; start + Number(service.duration) <= close; start += stepMinutes) times.add(fromMinutes(start));
    });
    return [...times].sort((a, b) => toMinutes(a) - toMinutes(b));
  }

  // Clearly demo-only reservations make some time slots look occupied without creating real appointments.
  // They are used only by availability calculations and are never displayed as the visitor's own bookings.
  function buildDemoAvailabilityBookings({ staff = [], dates = [] } = {}) {
    const busyStartByWeekday = { 1: '10:30', 2: '12:30', 3: '11:00', 4: '14:00', 5: '12:00', 6: '10:00' };
    const staggeredStartByWeekday = { 1: '15:00', 2: '09:30', 3: '15:30', 4: '10:00', 5: '15:00', 6: '12:00' };
    const result = [];
    dates.forEach(date => {
      const day = weekday(date);
      const mainStart = busyStartByWeekday[day];
      const staggeredStart = staggeredStartByWeekday[day];
      if (!mainStart) return;
      const active = staff.filter(member => Array.isArray(member.schedule?.[day]));
      active.forEach(member => {
        const mainMinutes = toMinutes(mainStart);
        const shiftStart = toMinutes(member.schedule[day][0]);
        const shiftEnd = toMinutes(member.schedule[day][1]);
        if (mainMinutes >= shiftStart && mainMinutes + 60 <= shiftEnd) {
          result.push({ reference: `sample-${date}-${member.id}`, date, staffId: member.id, start: mainStart, end: fromMinutes(mainMinutes + 60), status: 'confirmed', isSeededDemo: true });
        }
      });
      if (active.length > 1 && staggeredStart) {
        const selected = active[day % active.length];
        const startMinutes = toMinutes(staggeredStart);
        const shift = selected.schedule[day];
        if (startMinutes >= toMinutes(shift[0]) && startMinutes + 45 <= toMinutes(shift[1])) {
          result.push({ reference: `sample-extra-${date}-${selected.id}`, date, staffId: selected.id, start: staggeredStart, end: fromMinutes(startMinutes + 45), status: 'confirmed', isSeededDemo: true });
        }
      }
    });
    return result;
  }

  function getAvailableTimes({ service, staff, selectedStaffId = '', date, bookings = [], todayISO = '', currentMinutes = -1, stepMinutes = 30 }) {
    if (!service || !validISODate(date) || !Number.isFinite(Number(service.duration)) || Number(service.duration) <= 0) return [];
    const times = new Set();
    getCandidateStaff(service, staff, selectedStaffId).forEach(member => {
      const shift = member.schedule?.[weekday(date)];
      if (!Array.isArray(shift) || shift.length !== 2) return;
      const open = toMinutes(shift[0]);
      const close = toMinutes(shift[1]);
      if (!Number.isFinite(open) || !Number.isFinite(close)) return;
      for (let start = open; start + Number(service.duration) <= close; start += stepMinutes) {
        if (isStaffAvailable({ member, date, startMinutes: start, duration: Number(service.duration), bookings, todayISO, currentMinutes })) times.add(fromMinutes(start));
      }
    });
    return [...times].sort((a, b) => toMinutes(a) - toMinutes(b));
  }

  window.SELYS_BOOKING_ENGINE = Object.freeze({
    validISODate,
    weekday,
    toMinutes,
    fromMinutes,
    getCandidateStaff,
    isStaffAvailable,
    getAvailableStaffForSlot,
    getCandidateTimes,
    buildDemoAvailabilityBookings,
    getAvailableTimes
  });
})();
