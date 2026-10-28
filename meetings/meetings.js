/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = teamImporterIsOpen = false;
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let scheduleInput1 = document.getElementById("sch-input1"), scheduleInput2 = document.getElementById("sch-input2");
let convertedTime1 = document.getElementById("sch-conv1"), convertedTime2 = document.getElementById("sch-conv2");
let freeTimes = document.getElementById("sch-free");

let teamCnt, teamData = [];
let scheduleTimes1, scheduleTimes2, convertedTimes = convertedScheduleTimes1 = convertedScheduleTimes2 = [];

// display main page
function loadPage() {
  //loadSaveState();
  //showMeetings();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ----------------------------------------------------------------------- MEETINGS ----------------------------------------------------------------------- */

// display meetings
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
}
scheduleInput1.addEventListener("change", () => { showMeetings(); });
scheduleInput2.addEventListener("change", () => { showMeetings(); });

// display converted times
function showConvertTimes() {
  convertedTimes = [];
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
  showFreeTimes();
}

// sort time intervals
function sortTimes(a, b) {
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
}

/* test
start, 08:30, end, 10:00
start, 09:15, end, 11:30
start, 11:30, end, 13:00
start, 12:45, end, 14:15
start, 15:00, end, 16:30

start, 07:00, end, 08:00
start, 10:15, end, 11:00
start, 14:00, end, 15:30
start, 16:15, end, 17:00
start, 17:30, end, 19:00

start, 06:17, end, 07:22
start, 07:41, end, 08:53
start, 08:34, end, 09:12
start, 09:58, end, 10:47

start, 10:03, end, 11:48
start, 10:29, end, 11:14
start, 12:07, end, 13:31
start, 14:19, end, 15:02

start, 13:11, end, 13:56
start, 14:23, end, 15:41
start, 15:17, end, 16:08
start, 15:52, end, 17:04

start, 16:44, end, 17:39
start, 17:39, end, 18:22
start, 19:01, end, 20:13
start, 20:56, end, 22:08
*/

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

/*// load saved settings/page
function loadSaveState() {
  teamCnt = localStorage.getItem("teamCnt") || 0;
  teamData = localStorage.getItem("teamData") ? JSON.parse(localStorage.getItem("teamData")) : [];
}

// save current settings/page
function saveState() {
  localStorage.setItem("teamCnt", teamCnt);
  localStorage.setItem("teamData", JSON.stringify(teamData));
}*/

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

// display/hide leaks/spoilers
leaksToggle.addEventListener("change", () => {
  if (!leaksToggle.checked) {
    spoilersToggle.checked = false;
    if (versionNum > vLive) versionNum = vLive;
  }
  showVersion();
});
spoilersToggle.addEventListener("change", () => {
  if (spoilersToggle.checked) leaksToggle.checked = true;
  showEnemies();
});

/* ------------------------------------------------------------------- team IMPORTER ------------------------------------------------------------------- */

// display team importer
function toggleTeamImporter() {
  teamImporterIsOpen = !teamImporterIsOpen;
  let teamImporter = document.getElementById("vs");
  let teamImporterOverlay = document.getElementById("vs-over");
  document.body.style.overflow = teamImporterIsOpen ? "hidden" : "auto";
  teamImporter.style.display = teamImporterOverlay.style.display = teamImporterIsOpen ? "flex" : "none";
}