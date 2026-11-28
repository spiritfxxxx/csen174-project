/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = teamImporterIsOpen = teamJoinerIsOpen = false;
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let teamInputName = document.getElementById("vs-team"), teamInputID = document.getElementById("vs-code");

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
  for (let t = 0; t < teamData.length; ++t) {
    let team = document.createElement("div");
    let teamName = document.createElement("div");
    let teamID = document.createElement("div");
    let teamOptionToggle = document.createElement("div");
    team.className = "b";
    teamName.className = "b-name";
    teamID.className = "b-id";
    teamOptionToggle.className = "b-opt-tgl";
    teamName.innerHTML = teamData[t].name;
    teamID.innerHTML = "Team ID: " + `<span style="font-weight:bold;text-decoration:underline;">${teamData[t].id}</span>`;
    teamOptionToggle.innerHTML = "Team Options";
    teamOptionToggle.onclick = function() {
      let optionDisplayed = getComputedStyle(teamOption).display == "none";
      teamOption.style.display = optionDisplayed ? "flex" : "none";
      teamOptionToggle.style.color = optionDisplayed ? "#b2cee7" : "#ffffff";
      teamOptionToggle.style.textDecoration = optionDisplayed ? "underline" : "none";
    };
    team.appendChild(teamName);
    team.appendChild(teamID);
    team.appendChild(teamOptionToggle);

    let teamOption = document.createElement("div");
    let teamInvite = document.createElement("a");
    let teamSchedule = document.createElement("a");
    let teamLeave = document.createElement("a");
    teamOption.className = "b-opt";
    teamInvite.className = "b-del";
    teamSchedule.className = "b-del";
    teamLeave.className = "b-del";
    teamInvite.innerHTML = "Invite Member";
    teamSchedule.innerHTML = "Schedule Meeting";
    teamLeave.innerHTML = "Leave Team";
    teamInvite.onclick = function() { window.location.href = `mailto:?subject=Timekeepers Team Invite&body=Hello! Please join my Timekeepers team with this ID: ${teamData[t].id} at https://spiritfxxxx.github.io/csen174-project/teams/.`; };
    teamSchedule.onclick = function() {window.location.href = "../meetings/"; };
    teamLeave.onclick = function() { leaveTeam(t); };
    teamOption.appendChild(teamInvite);
    teamOption.appendChild(teamSchedule);
    teamOption.appendChild(teamLeave);
    team.appendChild(teamOption);
    teamList.appendChild(team);

    let memberList = document.createElement("div");
    memberList.className = "member-list";
    for (let i = 0; i < teamData[t].members.length; i++) {
      let member =  document.createElement("div");
      let memberImg =  document.createElement("img");
      let memberName =  document.createElement("div");
      member.className = "member";
      memberImg.className = "member-img";
      memberName.className = "member-name";
      memberImg.src = "../assets/misc/member.webp";
      memberName.innerHTML = teamData[t].members[i].first + `<br>` + teamData[t].members[i].last;
      member.appendChild(memberImg);
      member.appendChild(memberName);
      memberList.appendChild(member);
    }
    team.appendChild(memberList);
  }
  saveState();
}

// create team
function createTeam() {
  let char = "abcdefghijklmnopqrstuvwxyz1234567890";
  let team = document.getElementById("vs-team").value || "My Team";
  let teamID = "";
  for (let i = 0; i < 6; ++i) teamID += char[Math.floor(Math.random() * char.length)];
  if (!teamData.some(t => t.id == teamID)) { teamData.push({name: team, id: teamID, members: createTeamMembers()}); }
  else createTeam();
  toggleTeamImporter();
  showTeams();
}
document.getElementById("vs-team").addEventListener("keydown", (e) => { if (e.key == "Enter") createTeam(); });

// join team
function joinTeam() {
  let team = document.getElementById("vs-code");
  let teamID = team.value;
  if (teamID.length != 6) return;
  if (teamData.some(t => t.id == teamID)) { team.value = "Already in this team!"; return; }
  teamData.push({name: "My Team", id: teamID, members: createTeamMembers()});
  toggleTeamJoiner();
  showTeams();
}
document.getElementById("vs-code").addEventListener("keydown", (e) => { if (e.key == "Enter") joinTeam(); });

// leave team
function leaveTeam(t) {
  teamData.splice(t, 1);
  showTeams();
}

/* ----------------------------------------------------------------------- */

// list of first/last names
let firstNames = [
  "Aaliyah", "Aarav", "Adrian", "Aisha", "Alejandro", "Amara", "Andrew", "Anh", "Anika", "Ariana",
  "Benjamin", "Camila", "Carlos", "Claire", "Daniel", "David", "Diego", "Elena", "Emily", "Ethan",
  "Fatima", "Gabriel", "Grace", "Hana", "Hannah", "Isaac", "Isabella", "Jasmine", "Javier", "Jin",
  "Jun", "Kai", "Kavya", "Layla", "Leo", "Liam", "Lucia", "Marcus", "Maya", "Mei",
  "Mia", "Miguel", "Nadia", "Naveen", "Nicole", "Noah", "Olivia", "Omar", "Priya", "Rafael",
  "Rohan", "Samantha", "Sofia", "Sophie", "Sora", "Tariq", "Thomas", "Tyler", "Valentina", "Victoria",
  "Wei", "Yara", "Zara", "Zoe"
];
let lastNames = [
  "Ahmed", "Alvarez", "Anderson", "Bailey", "Bennett", "Brooks", "Campbell", "Chen", "Choi", "Clark",
  "Cohen", "Cruz", "Dang", "Davis", "Diaz", "Edwards", "Flores", "Garcia", "Gonzalez", "Gupta",
  "Hall", "Hernandez", "Huang", "Hughes", "Ibrahim", "Johnson", "Kang", "Kim", "Kumar", "Lee",
  "Lopez", "Martinez", "Miller", "Mitchell", "Morales", "Murphy", "Nguyen", "Ortiz", "Park", "Patel",
  "Perez", "Pham", "Ramirez", "Reyes", "Rivera", "Robinson", "Rodriguez", "Santos", "Sato", "Shah",
  "Silva", "Singh", "Smith", "Tanaka", "Taylor", "Torres", "Tran", "Wang", "Wilson", "Wong",
  "Wright", "Yamamoto", "Young", "Zhang"
];

// pick a random item from a list
function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// create 1-5 unique team members, with random names
function createTeamMembers() {
  let members = [];
  for (let i = 0; i < 1 + Math.floor(Math.random() * 5); ++i) {
    let member = {first: randomItem(firstNames), last: randomItem(lastNames)};
    if (!members.some(m => m.first == member.first || m.last == member.last)) members.push(member);
  }
  return members;
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
  if (e.key == "Escape") { e.preventDefault(); teamImporterIsOpen ? toggleTeamImporter() : teamJoinerIsOpen ? toggleTeamJoiner() : toggleMenuBar(); }
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
  let teamImporter = document.getElementById("vs-create");
  let teamImporterOverlay = document.getElementById("vs-over1");
  document.body.style.overflow = teamImporterIsOpen ? "hidden" : "auto";
  teamImporter.style.display = teamImporterOverlay.style.display = teamImporterIsOpen ? "flex" : "none";
  teamInputName.value = "";
}

// display team joiner
function toggleTeamJoiner() {
  teamJoinerIsOpen = !teamJoinerIsOpen;
  let teamJoiner = document.getElementById("vs-join");
  let teamJoinerOverlay = document.getElementById("vs-over2");
  document.body.style.overflow = teamJoinerIsOpen ? "hidden" : "auto";
  teamJoiner.style.display = teamJoinerOverlay.style.display = teamJoinerIsOpen ? "flex" : "none";
  teamInputID.value = "";
}