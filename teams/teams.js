/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = teamImporterIsOpen = false;
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let teamInput = document.getElementById("team-input");

let teamData = [];

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
  for (let t = 0; t < teamData.length; ++t) {
    let team = document.createElement("div");
    let teamName = document.createElement("div");
    let teamDetails = document.createElement("div");
    teamDetails.style.display = "none";
    teamName.onclick = function() { teamDetails.style.display = teamDetails.style.display == "none" ? "block" : "none"; };
    let teamText = document.createElement("div");
    let teamAction = document.createElement("div");
    let teamInvite = document.createElement("a");
    teamInvite.innerHTML = "Invite Member";
    let teamSchedule = document.createElement("a");
    teamSchedule.className = "b-del";
    teamSchedule.innerHTML = "Schedule Meeting";
    teamSchedule.onclick = function() {window.location.href = "../meetings/"; };
    let teamLeave = document.createElement("a");
    teamLeave.innerHTML = "Leave Team";

    team.className = "b";
    teamName.className = "b-name";
    teamText.className = "b-text";
    teamName.innerHTML = teamData[t].name + " (ID: " + teamData[t].id + ")";

    teamAction.className = "b-actions";

    teamInvite.className = "b-del";
    teamInvite.onclick = function() { window.location.href = `mailto:?subject=Join my Timekeepers team&body=Hi! Join my team using this code: ${teamData[t].id}`; };

    teamLeave.className = "b-del";
    teamLeave.onclick = function() { leaveTeam(t); };

    let memberInput = document.createElement("input");
    let memberAdd = document.createElement("a");
    memberInput.placeholder = "Add member name...";
    memberAdd.className = "b-del";
    memberAdd.innerHTML = "Add";

    teamAction.appendChild(teamInvite);
    teamAction.appendChild(teamSchedule);
    teamAction.appendChild(teamLeave);
    teamDetails.appendChild(teamAction);
    team.appendChild(teamName);
    team.appendChild(teamDetails);   
    teamList.appendChild(team);
  }
  saveState();
}

// create team
function createTeam() {
  let name = document.getElementById("team-name")?.value.trim() || "My Team";
  let id = "", char = "abcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; ++i) id += char[Math.floor(Math.random() * char.length)];
  if (!teamData.some( t => t.id == id )) { teamData.push({ id: id, name: name, members: [] }); }
  toggleTeamImporter();
  showTeams();
}

// leave team
function leaveTeam(t) {
  teamData.splice(t, 1);
  showTeams();
}

/*
// find team
function findTeam() {
  teamInput.value = teamData.includes(teamInput.value) ? "found!" : "nope! not found.";
}
teamInput.addEventListener("change", () => { findTeam(); });
*/

// join team
function joinTeam() {
  let teamInput = document.getElementById("team-input")
  let id = teamInput.value.trim();
  if (teamData.some( t => t.id == id)) { teamInput.value = "already in this team!"; return; }
  teamData.push({ id: id, name: "Team",members: [] }); 
  teamInput.value = "team joined!";
  toggleTeamImporter();
  showTeams();
}

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

/* ------------------------------------------------------------------- team IMPORTER ------------------------------------------------------------------- */

// display team importer
function toggleTeamImporter(mode) {
  teamImporterIsOpen = !teamImporterIsOpen;
  let teamImporter = document.getElementById("vs");
  let teamImporterOverlay = document.getElementById("vs-over");
  let vsCont = document.getElementById("vs-cont");
  document.body.style.overflow = teamImporterIsOpen ? "hidden" : "auto";
  teamImporter.style.display = teamImporterOverlay.style.display = teamImporterIsOpen ? "flex" : "none";

  if (mode == "create") {
    vsCont.innerHTML = `<div>Team Name (optional)</div><input id="team-name" placeholder="My Team"><button onclick="createTeam()">Create</button>`;
  } else if (mode == "join") {
    vsCont.innerHTML = `<div>Enter Team Code</div><input id="team-input" placeholder="e.g. a43bds"><button onclick="joinTeam()">Join</button>`;
  }

  document.getElementById("team-name")?.addEventListener("keydown", (e) => { if (e.key == "Enter") createTeam(); });
  document.getElementById("team-input")?.addEventListener("keydown", (e) => { if (e.key == "Enter") joinTeam(); });
}