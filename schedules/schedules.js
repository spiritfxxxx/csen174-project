/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = scheduleImporterIsOpen = false;
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let scheduleInput = document.getElementById("vs-cont");

let scheduleData = [];

// display main page
function loadPage() {
  loadSaveState();
  showSchedules();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ----------------------------------------------------------------------- SCHEDULES ----------------------------------------------------------------------- */

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

    schedule.className = "b";
    scheduleName.className = "b-name";
    scheduleText.className = "b-text";
    scheduleName.innerHTML = `Schedule ${s + 1}`;
    scheduleText.innerHTML = scheduleData[s];
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
function createSchedule(s) {
  scheduleData.push(s);
  showSchedules();
}

// delete schedule
function deleteSchedule(s) {
  scheduleData.splice(s, 1);
  showSchedules();
}

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
  if (scheduleFile.length > 0 && scheduleFile[0].type == "text/csv") {
    let scheduleText = new FileReader();
    scheduleText.onload = function(e) { createSchedule(e.target.result); toggleScheduleImporter(); };
    scheduleText.onerror = function(e) { console.error("Error reading file:", e.target.error); };
    scheduleText.readAsText(scheduleFile[0]);
  }
}
scheduleInput.addEventListener("drop", importSchedule, false);

// export schedule
function exportSchedule(s) {
  let blob = new Blob([scheduleData[s]], { type: 'text/csv;charset=utf-8;' });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `schedule${s + 1}-timekeepers.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key == "Escape") { e.preventDefault(); scheduleImporterIsOpen ? toggleScheduleImporter() : toggleMenuBar(); }
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
}