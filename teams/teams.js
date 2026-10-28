/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = teamImporterIsOpen = false;
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let teamInput = document.getElementById("team-input");

let teamCnt, teamData = [];

// display main page
function loadPage() {
  loadSaveState();
  showTeams();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* ------------------------------------------------------------------------- TEAMS ------------------------------------------------------------------------- */

// display teams
function showTeams() {
  let teamList = document.getElementById("team-list");
  teamList.innerHTML = ``;
  for (let t = 0; t < teamCnt; ++t) {
    let team = document.createElement("div");
    let teamName = document.createElement("div");
    let teamText = document.createElement("div");
    team.className = "b";
    teamName.className = "b-name";
    teamText.className = "b-text";
    teamName.innerHTML = `Team ${t + 1}`;
    teamText.innerHTML = teamData[t];
    team.appendChild(teamName);
    team.appendChild(teamText);
    teamList.appendChild(team);
  }
  saveState();
}

// create team
function createTeam() {
  ++teamCnt;
  let id = "", char = "abcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; ++i) id += char[Math.floor(Math.random() * char.length)];
  if (!teamData.includes(id)) teamData.push(id);
  showTeams();
}

// delete team
function deleteTeam() {
  teamCnt = 0;
  teamData = [];
  showTeams();
}

// find team
function findTeam() {
  teamInput.value = teamData.includes(teamInput.value) ? "found!" : "nope! not found.";
}
teamInput.addEventListener("change", () => { findTeam(); });

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  teamCnt = localStorage.getItem("teamCnt") || 0;
  teamData = localStorage.getItem("teamData") ? JSON.parse(localStorage.getItem("teamData")) : [];
}

// save current settings/page
function saveState() {
  localStorage.setItem("teamCnt", teamCnt);
  localStorage.setItem("teamData", JSON.stringify(teamData));
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
  else if (e.key == " " && !menuBarIsOpen && document.activeElement != teamInput) { e.preventDefault(); toggleTeamImporter(); }
  else if (e.key == "Enter" && !menuBarIsOpen && !teamImporterIsOpen && document.activeElement != teamInput) { e.preventDefault(); jumpToTop(); }
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