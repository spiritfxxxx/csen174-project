/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = false, scheduleImporterIsOpen = false;
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let scheduleInput = document.getElementById("vs-cont"), scheduleName = document.getElementById("sch-name");

let scheduleData = [];

// display main page
function loadPage() {
  loadSaveState();
  showSchedules();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ----------------------------------------------------------------------- SCHEDULES ----------------------------------------------------------------------- */

let dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let dayICS = {MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6};
let dayMins = 24 * 60;
let dayColor = "#b2cee7", timeColor = "#8384c3";

// display schedules
function showSchedules() {
  let scheduleList = document.getElementById("sch-list");
  scheduleList.innerHTML = ``;

  for (let s = 0; s < scheduleData.length; ++s) {
    let schedule = document.createElement("div");
    let scheduleName = document.createElement("div");
    let scheduleText = document.createElement("div");
    let scheduleAction = document.createElement("div");
    let scheduleExport = document.createElement("a");
    let scheduleDelete = document.createElement("a");

    schedule.className = "b1";
    scheduleName.className = "b-name";
    scheduleText.className = "b-text";
    scheduleName.textContent = scheduleData[s][0];
    for (let line of createScheduleLine(scheduleData[s][1])) {
      let scheduleLine = document.createElement("div");
      if (line.days) scheduleLine.append(line.name, " · ", formatScheduleLine(line.days, dayColor), " · ", formatScheduleLine(line.time, timeColor));
      else scheduleLine.append(line.name);
      scheduleText.appendChild(scheduleLine);
    }
    schedule.appendChild(scheduleName);
    schedule.appendChild(scheduleText);

    scheduleAction.className = "b-actions";
    scheduleExport.className = "b-exp";
    scheduleDelete.className = "b-del";
    scheduleExport.innerHTML = "Export";
    scheduleDelete.innerHTML = "Delete";
    scheduleExport.onclick = function() { exportSchedule(s); };
    scheduleDelete.onclick = function() { deleteSchedule(s); };
    scheduleAction.appendChild(scheduleExport);
    scheduleAction.appendChild(scheduleDelete);
    schedule.appendChild(scheduleAction);

    scheduleList.appendChild(schedule);
  }
  saveState();
}

// create schedule
function createSchedule(n, s) {
  scheduleData.push([n, s]);
  showSchedules();
}

// delete schedule
function deleteSchedule(s) {
  scheduleData.splice(s, 1);
  showSchedules();
}

/* ----------------------------------------------------------------------- */

// build schedule event, duplicate events (same time, different day) grouped together
function createScheduleLine(events) {
  if (!events.length) return ["No events this week"];

  let groups = new Map();
  for (let e of events) {
    let key = `${e.name}|${e.start % dayMins}|${e.end - e.start}`;
    if (!groups.has(key)) groups.set(key, {e, days: []});
    groups.get(key).days.push(dayNames[Math.floor(e.start / dayMins)]);
  }
  return [...groups.values()].map(({e, days}) => ({name: e.name, days: days.join(", "), time: `${formatTime(e.start)} – ${formatTime(e.end)}`}));
}

// color dates/times in schedule line
function formatScheduleLine(text, color) {
  let span = document.createElement("span");
  span.textContent = text;
  span.style.color = color;
  return span;
}

/* ----------------------------------------------------------------------- */

// convert ics to schedule
function convertICS(t, forDate = new Date()) {
  let weekStart = getWeekStart(forDate);
  let weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
  let events = parseICS(t);

  // group duplicate events (same time, different day) together
  let replaced = new Set(events.filter(e => e["recurrence-id"]).map(e => `${e.uid}|${parseICSDate(e["recurrence-id"])?.getTime()}`));

  let scheduleEvents = [];
  for (let e of events) {
    let start = parseICSDate(e.dtstart), end = parseICSDate(e.dtend);
    if (!start || !end || e.status == "CANCELLED") continue;

    let name = cleanICS(e.summary) || "Untitled Event";
    let length = Math.round((end - start) / 60000);
    for (let occurrence of getWeekEvents(e, start, weekStart, weekEnd)) {
      if (!e["recurrence-id"] && replaced.has(`${e.uid}|${occurrence.getTime()}`)) continue;
      let from = minutesIntoWeek(occurrence, weekStart);
      scheduleEvents.push({name, start: from, end: from + length});
    }
  }
  return scheduleEvents.sort((a, b) => a.start - b.start);
}

// split ics text into a list of raw events
function parseICS(t) {
  let lines = t.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  let events = [];
  let currentEvent = null;

  for (let line of lines) {
    if (line == "BEGIN:VEVENT") currentEvent = {exdates: []};
    else if (line == "END:VEVENT") {
      if (currentEvent) events.push(currentEvent);
      currentEvent = null;
    }
    else if (currentEvent && line.includes(":")) {
      let index = line.indexOf(":");
      let key = line.substring(0, index).split(";")[0].toLowerCase().trim();
      let val = line.substring(index + 1);
      if (key == "exdate") currentEvent.exdates.push(...val.split(",").map(v => parseICSDate(v.trim())?.getTime()).filter(Boolean));
      else currentEvent[key] = val;
    }
  }
  return events;
}

// parse ics string  to date
// example: 20250428T221500Z --> 04/28/2025 10:15 PM
function parseICSDate(icsString) {
  let match = (icsString || "").match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!match) return null;
  let [y, mo, d, h, mi, s] = match.slice(1, 7).map(Number);
  return match[7] ? new Date(Date.UTC(y, mo - 1, d, h, mi, s)) : new Date(y, mo - 1, d, h, mi, s);
}

// parse ics event misc rules
function parseRRule(rule) {
  return Object.fromEntries((rule || "").split(";").filter(Boolean).map(part => part.split("=")));
}

// clean ics uneeded text
function cleanICS(text) {
  return (text || "").replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').replace(/\s+/g, ' ').trim();
}

/* ----------------------------------------------------------------------- */

// get beginning of week (Monday 12:00 AM)
function getWeekStart(date = new Date()) {
  let d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

// get each appearence of events in weeks
function getWeekEvents(ev, start, weekStart, weekEnd) {
  let rule = parseRRule(ev.rrule);

  // check for non-weekly events
  if (rule.FREQ != "WEEKLY") return start >= weekStart && start < weekEnd ? [start] : [];

  let interval = Number(rule.INTERVAL) || 1;
  let until = rule.UNTIL ? parseICSDate(rule.UNTIL) : null;
  let maxCount = Number(rule.COUNT) || Infinity;
  let days = rule.BYDAY ? rule.BYDAY.split(",").map(d => dayICS[d.slice(-2)]).filter(d => d !== undefined) : [(start.getDay() + 6) % 7];
  days.sort((a, b) => a - b);

  // check each week until target week reached
  let count = 0, results = [];
  for (let week = getWeekStart(start); week < weekEnd; week.setDate(week.getDate() + 7 * interval)) {
    for (let day of days) {
      let occurrence = new Date(week.getFullYear(), week.getMonth(), week.getDate() + day, start.getHours(), start.getMinutes(), start.getSeconds());
      if (occurrence < start) continue;
      if (until && occurrence > until) return results;
      if (++count > maxCount) return results;
      if (occurrence >= weekStart && !ev.exdates.includes(occurrence.getTime())) results.push(occurrence);
    }
  }
  return results;
}

// calculate minutes from t = 0 to event
function minutesIntoWeek(date, weekStart) {
  let midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let dayIndex = Math.round((midnight - weekStart) / 86400000);
  return dayIndex * dayMins + date.getHours() * 60 + date.getMinutes();
}

// convert time to minutes since midnight
function formatTime(min) {
  let h = Math.floor(min / 60) % 24, m = min % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/* ----------------------------------------------------------------------- */

// local import responsiveness
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  scheduleInput.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// import schedule
function importSchedule(s) {
  let scheduleFile = s.dataTransfer.files;
  if (scheduleFile.length > 0 && scheduleFile[0].type == "text/calendar") {
    let scheduleText = new FileReader();
    scheduleText.onload = function(e) { createSchedule(scheduleName.value || "Untitled Schedule", convertICS(e.target.result)); toggleScheduleImporter(); };
    scheduleText.onerror = function(e) { console.error("Error reading file:", e.target.error); };
    scheduleText.readAsText(scheduleFile[0]);
  }
}
scheduleInput.addEventListener("drop", importSchedule, false);

// export schedule - CURRENTLY BROKEN, WILL FIX LATER
function exportSchedule(s) {
  let blob = new Blob([scheduleData[s]], {type: 'text/calendar;charset=utf-8;'});
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `schedule${s + 1}-timekeepers.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  scheduleData = localStorage.getItem("scheduleData") ? JSON.parse(localStorage.getItem("scheduleData")) : [];
  // older versions saved events as { eventName, eventTime }; drop those so the new display doesn't break
  scheduleData = scheduleData.filter(s => s[1].every(e => typeof e.start == "number"));
}

// save current settings/page
function saveState() {
  localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
}

// go to top
function jumpToTop(e) {
  if (e == "body") { document.body.scrollTop = 0; document.documentElement.scrollTop = 0; }
  else { document.getElementById(e).scrollTop = 0; }
}

// go to bottom
function jumpToBottom(e) {
  if (e == "body") { document.body.scrollTop = document.body.scrollHeight; document.documentElement.scrollTop = document.documentElement.scrollHeight; }
  else { document.getElementById(e).scrollTop = document.getElementById(e).scrollHeight; }
}

// navigation keyboard shortcuts
document.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key == "Escape") { e.preventDefault(); scheduleImporterIsOpen ? toggleScheduleImporter() : toggleMenuBar(); }
  else if (e.target.matches?.("input, textarea, select")) return;
  else if (e.key == " " && !menuBarIsOpen) { e.preventDefault(); toggleScheduleImporter(); }
  else if (e.key == "Enter" && !menuBarIsOpen && !scheduleImporterIsOpen) { e.preventDefault(); jumpToTop(); }
});

/* ------------------------------------------------------------------------ MENU BAR ------------------------------------------------------------------------ */

// display/hide menu bar
function toggleMenuBar() {
  menuBarIsOpen = !menuBarIsOpen;
  let menuBar = document.getElementById("mb");
  let menuBarOverlay = document.getElementById("mb-over");
  document.body.style.overflow = menuBarIsOpen ? "hidden" : "auto";
  menuBar.style.display = menuBarOverlay.style.display = menuBarIsOpen ? "flex" : "none";
}

// display number format
function showNumberFormat(num) {
  if (currNumberFormat == "period") return num.toLocaleString("de-DE");
  if (currNumberFormat == "comma") return num.toLocaleString("en-US");
  return num;
}

// change number format
function changeNumberFormat(e) {
  if (e) currNumberFormat = e.dataset.format;
  let numFormatExample = document.getElementById("mb-nf-ex");
  let numFormatOptions = document.querySelectorAll(".nf-opt");
  numFormatExample.innerHTML = showNumberFormat(2222222);
  numFormatOptions.forEach(opt => opt.classList.toggle("selected", opt.dataset.format == currNumberFormat));
  showEnemies();
}

/* ------------------------------------------------------------------- SCHEDULE IMPORTER ------------------------------------------------------------------- */

// display schedule importer
function toggleScheduleImporter() {
  scheduleImporterIsOpen = !scheduleImporterIsOpen;
  let scheduleImporter = document.getElementById("vs");
  let scheduleImporterOverlay = document.getElementById("vs-over");
  document.body.style.overflow = scheduleImporterIsOpen ? "hidden" : "auto";
  scheduleImporter.style.display = scheduleImporterOverlay.style.display = scheduleImporterIsOpen ? "flex" : "none";
  scheduleName.value = "";
}