/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = teamImporterIsOpen = false;
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let scheduleInput1 = document.getElementById("sch-input1"), scheduleInput2 = document.getElementById("sch-input2");
let schedule1 = document.getElementById("sch1"), schedule2 = document.getElementById("sch2");
let time1 = document.getElementById("time1"), time2 = document.getElementById("time2");
let convertedTime1 = document.getElementById("sch-conv1"), convertedTime2 = document.getElementById("sch-conv2");
let freeTimes = document.getElementById("sch-free");

let teamCnt, scheduleData = [], teamData = [];
let scheduleTimes1, scheduleTimes2, convertedTimes = convertedScheduleTimes1 = convertedScheduleTimes2 = [];

// display main page
function loadPage() {
  loadSaveState();
  loadScheduleData();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ---------------------------------------------------------------------- SCHEDULES ---------------------------------------------------------------------- */

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
  let schedule = n == 1 ? schedule1 : schedule2;
  let time = n == 1 ? time1 : time2;
  let convert = n == 1 ? convertedTime1 : convertedTime2;
  schedule.innerHTML = time.innerHTML =  convert.innerHTML = ``;
  for (let t = 0; t < scheduleData[s][1].length; t++) {
    let event = scheduleData[s][1][t].eventName + ", " + scheduleData[s][1][t].eventTime;
    schedule.innerHTML += event + `\n`;
    showTimes(convert, time, event);
  }
}

/* ----------------------------------------------------------------------- MEETINGS ----------------------------------------------------------------------- */

/*// display meetings
function showMeetings() {
  convertedTime1.innerHTML = convertedTime2.innerHTML = ``;
  freeTimes.innerHTML = ``;
  let format = /^\s*start,\s*\d{2}:\d{2},\s*end,\s*\d{2}:\d{2}\s*$/i;
  scheduleTimes1 = scheduleInput1.value.split(/\r?\n/);
  scheduleTimes2 = scheduleInput2.value.split(/\r?\n/);
  if ((scheduleTimes1.length == 1 && scheduleTimes1[0] == "") || (scheduleTimes2.length == 1 && scheduleTimes2[0] == "")) return;
  for (let t = 0; t < scheduleTimes1.length; ++t) {
    if (!format.test(scheduleTimes1[t])) {
      freeTimes.innerHTML = `Please follow the format!`;
      return;
    }
  }
  for (let t = 0; t < scheduleTimes2.length; ++t) {
    if (!format.test(scheduleTimes2[t])) {
      freeTimes.innerHTML = `Please follow the format!`;
      return;
    }
  }
  showConvertTimes();
}*/

// display times
function showTimes(c, t, e) {
  let match = e.match(/^(?<eventName>.+?),\s*(?<startDate>\d{1,2}\/\d{1,2}\/\d{4}),\s*(?<startTime>\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM)),\s*(?<endDate>\d{1,2}\/\d{1,2}\/\d{4}),\s*(?<endTime>\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM))$/i);
  if (match) {
    let { startDate, startTime, endDate, endTime } = match.groups;
    let time = startDate + ` --- ` + startTime.padStart(11, "0") + ` --- ` + endDate + ` --- ` + endTime.padStart(11, "0");
    t.innerHTML += time + `\n`;
    c.innerHTML += showConvertTimes(startTime.padStart(11, "0")) + ` ` + showConvertTimes(endTime.padStart(11, "0")) + `\n`;
  }
}

// display converted times
function showConvertTimes(t) {
  if (t.slice(0, 2) == "12" && t.slice(9, 11) == "AM") t = "00" + t.slice(2);
  return (t.slice(0, 2) * 3600 + t.slice(3, 5) * 60 + t.slice(6, 8) * 1) + (t.slice(9, 11) == "AM" ? 0 : 43200);

  /*convertedTimes = [];
  for (let t = 0; t < scheduleTimes1.length; ++t) {
    let conv1 = [parseInt(scheduleTimes1[t].slice(7, 9) * 60) + parseInt(scheduleTimes1[t].slice(10, 12)), parseInt(scheduleTimes1[t].slice(19, 21) * 60) + parseInt(scheduleTimes1[t].slice(22, 24))];
    convertedTime1.innerHTML += conv1 + `\n`;
    convertedScheduleTimes1.push(conv1);
    convertedTimes.push(conv1);
  }
  for (let t = 0; t < scheduleTimes2.length; ++t) {
    let conv2 = [parseInt(scheduleTimes2[t].slice(7, 9) * 60) + parseInt(scheduleTimes2[t].slice(10, 12)), parseInt(scheduleTimes2[t].slice(19, 21) * 60) + parseInt(scheduleTimes2[t].slice(22, 24))];
    convertedTime2.innerHTML += conv2 + `\n`;
    convertedScheduleTimes2.push(conv2);
    convertedTimes.push(conv2);
  }
  console.log(convertedTimes);
  showFreeTimes();*/
}

// sort time intervals
/*function sortTimes(a, b) {
  return a[0] - b[0];
}

// display free time
function showFreeTimes() {
  convertedTimes.sort(sortTimes);
  let endTime = convertedTimes[0][1];
  for (let t = 1; t < convertedTimes.length; ++t) {
    if (convertedTimes[t][0] > endTime) freeTimes.innerHTML += [endTime, convertedTimes[t][0]] +`\n`;
    endTime = Math.max(endTime, convertedTimes[t][1]);
  }
}*/

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  scheduleData = localStorage.getItem("scheduleData") ? JSON.parse(localStorage.getItem("scheduleData")) : [];
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
  let inputs = [scheduleInput1, scheduleInput2, convertedTime1, convertedTime2, freeTimes];
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key == "Escape") { e.preventDefault(); teamImporterIsOpen ? toggleTeamImporter() : toggleMenuBar(); }
  else if (e.key == " " && !menuBarIsOpen && !inputs.includes(document.activeElement)) { e.preventDefault(); toggleTeamImporter(); }
  else if (e.key == "Enter" && !menuBarIsOpen && !inputs.includes(document.activeElement)) { e.preventDefault(); jumpToTop(); }
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