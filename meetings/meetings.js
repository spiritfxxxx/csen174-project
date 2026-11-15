/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = false, teamImporterIsOpen = false;
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let scheduleInput1 = document.getElementById("sch-input1"), scheduleInput2 = document.getElementById("sch-input2");
let schedule1 = document.getElementById("sch1"), schedule2 = document.getElementById("sch2");
let time1 = document.getElementById("time1"), time2 = document.getElementById("time2");
let convertedTime1 = document.getElementById("sch-conv1"), convertedTime2 = document.getElementById("sch-conv2");
let freeTimes = document.getElementById("sch-free");

let teamCnt, scheduleData = [], teamData = [];
let meetingData = [];

// display main page
function loadPage() {
  loadSaveState();
  loadScheduleData();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ---------------------------------------------------------------------- SCHEDULES ---------------------------------------------------------------------- */

let dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let dayMins = 24 * 60;
let meetingDays = [0, 1, 2, 3, 4, 5, 6];
let meetingEarliest = 8 * 60;                           // earliest a meeting can start (8:00 AM)
let meetingLatest = 21 * 60;                            // latest a meeting can end (9:00 PM)
let meetingMinLength = 30;                              // minimum meeting duration (in minutes)
let dayColor = "#b2cee7", timeColor = "#8384c3";

// load schedule data
function loadScheduleData() {
  for (let s = 0; s < scheduleData.length; s++) {
    let scheduleOption1 = document.createElement("option"), scheduleOption2 = document.createElement("option");
    scheduleOption1.text = scheduleOption2.text = scheduleData[s][0];
    scheduleOption1.value = scheduleOption2.value = s;
    scheduleInput1.appendChild(scheduleOption1);
    scheduleInput2.appendChild(scheduleOption2);
  }
  loadSchedules(scheduleInput1.value, 1);
  loadSchedules(scheduleInput2.value, 2);
}
scheduleInput1.addEventListener("change", () => { loadSchedules(scheduleInput1.value, 1); });
scheduleInput2.addEventListener("change", () => { loadSchedules(scheduleInput2.value, 2); });

// load schedule
function loadSchedules(s, n) {
  let schedule = document.getElementById(`b${n}`);
  let scheduleName = document.createElement("div");
  let scheduleText = document.createElement("div");
  schedule.innerHTML = ``;

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
  showFreeTime();
  saveState();
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
  return [...groups.values()].map(({e, days}) => ({name: e.name, days: days.join(", "), time: `${convertTime(e.start)} - ${convertTime(e.end)}`}));
}

// color dates/times in schedule line
function formatScheduleLine(text, color) {
  let span = document.createElement("span");
  span.textContent = text;
  span.style.color = color;
  return span;
}

/* --------------------------------------------------------------------- FREE TIME --------------------------------------------------------------------- */

// merge time ranges that touch/overlap
// example: [[10, 20], [15, 30], [40, 50]] --> [[10, 30], [40, 50]]
function mergeTimes(intervals) {
  let sorted = intervals.map(i => [i[0], i[1]]).sort((a, b) => a[0] - b[0]);
  let merged = [];
  for (let [start, end] of sorted) {
    let last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

// calculate when everyone in team is free
function findFreeTimes(evList) {
  let busy = mergeTimes(evList.flat().map(e => [e.start, e.end]));
  let free = [];

  for (let day of meetingDays) {
    let currTime = day * dayMins + meetingEarliest;
    let limit = day * dayMins + meetingLatest;
    for (let [start, end] of busy) {
      if (end <= currTime) continue;
      if (start >= limit) break;
      if (start - currTime >= meetingMinLength) free.push([currTime, start]);
      currTime = Math.max(currTime, end);
    }
    if (limit - currTime >= meetingMinLength) free.push([currTime, limit]);
  }
  return free;
}

// display free time
function showFreeTime() {
  let selected = [scheduleInput1.value, scheduleInput2.value].map(s => scheduleData[s]).filter(Boolean);
  if (!selected.length) {
    freeTimes.textContent = "No schedules yet. Import one first.";
    return;
  }

  let free = findFreeTimes(selected.map(s => s[1]));
  freeTimes.textContent = free.length ? free.map(([start, end]) => `${showFreeInterval(start, end)} · ${convertDuration(end - start)}`).join("\n") : "No shared free time found.";
}

// display free time interval
// example: Mon · 9:05 AM - 10:30 AM
function showFreeInterval(start, end) {
  return `${dayNames[Math.floor(start / dayMins)]} · ${convertTime(start % dayMins)} - ${convertTime(end % dayMins)}`;
}

// convert minute number to time interval
// example: 222 --> 3 hr 42 min
function convertDuration(min) {
  let h = Math.floor(min / 60), m = min % 60;
  return `${h} hr ${m} min`;
}

// convert minute number to time
// example: 222 --> 3:42 AM
function convertTime(min) {
  let h = Math.floor(min / 60) % 24, m = min % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/* ----------------------------------------------------------------------- MEETINGS ----------------------------------------------------------------------- */

// user create meeting request (timeSlot = { start, end } in minutes since Monday 00:00, eg. one entry from findFreeTimes)
function createMeetingRequest (teamID, timeSlot, title)
{
  let meeting = {
    id: Date.now(),
    teamID: teamID,
    timeSlot: timeSlot,
    title: title,
    status: "pending",
  }
  meetingData.push(meeting);
  saveState();
}

// team member accept meeting request
function acceptMeeting(meetingID)
{
  let meeting = meetingData.find(m => m.id == meetingID);
  if (meeting) meeting.status = "accepted";
  saveState();
}

// team member decline meeting request
function declineMeeting(meetingID)
{
  let meeting = meetingData.find(m => m.id == meetingID);
  if (meeting) meeting.status = "declined";
  saveState();
}

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  scheduleData = localStorage.getItem("scheduleData") ? JSON.parse(localStorage.getItem("scheduleData")) : [];
  // older versions saved events as { eventName, eventTime }; skip those so they don't break the page
  scheduleData = scheduleData.filter(s => s[1].every(e => typeof e.start == "number"));
  meetingData = localStorage.getItem("meetingData") ? JSON.parse(localStorage.getItem("meetingData")) : [];
}

// save current settings/page
function saveState() {
  localStorage.setItem("meetingData", JSON.stringify(meetingData));
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
  if (e.key == "Escape") { e.preventDefault(); teamImporterIsOpen ? toggleTeamImporter() : toggleMenuBar(); }
  else if (e.target.matches?.("input, textarea, select")) return;
  else if (e.key == " " && !menuBarIsOpen) { e.preventDefault(); toggleTeamImporter(); }
  else if (e.key == "Enter" && !menuBarIsOpen) { e.preventDefault(); jumpToTop("body"); }
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

/* ------------------------------------------------------------------- team IMPORTER ------------------------------------------------------------------- */

// display team importer
function toggleTeamImporter() {
  teamImporterIsOpen = !teamImporterIsOpen;
  let teamImporter = document.getElementById("vs");
  let teamImporterOverlay = document.getElementById("vs-over");
  document.body.style.overflow = teamImporterIsOpen ? "hidden" : "auto";
  teamImporter.style.display = teamImporterOverlay.style.display = teamImporterIsOpen ? "flex" : "none";
}