// convert csv to schedule time slots
function csvToSchedule(csv)
{
  let slots = [];
  const lines = csv.split("\n");
  
  lines.forEach((line) => {
    const parts = line.split(", ");
    let start = timeToMinutes(parts[1]);
    let end = timeToMinutes(parts[3]);
    slots.push([start, end]);
  });
  return slots;
}

// convert time to munites
function timeToMinutes(time)
{
  const parts = time.split(" ");
  const timeParts = parts[0].split(":");
  let hour = parseInt(timeParts[0]);
  let min = parseInt(timeParts[1]);
  
  if (parts[1] == "PM" && hour != 12)
  {
    hour += 12;
  }
  else
  {
    if (parts[1] == "AM" && hour == 12)
    {
      hour = 0;
    }
  }
  return hour * 60 + min
}

// convert minutes to time
function minutesToTime(minutes)
{
  let hour = Math.trunc(minutes / 60);
  let min = minutes % 60;
  let period;

  if (hour == 0)
  {
    hour += 12;
    period = "AM";
  }
  else if (hour == 12)
  {
    period = "PM";
  }
  else if (hour > 12)
  {
    hour -= 12;
    period = "PM";
  }
  else
  {
    period = "AM";
  }
  
  min = min.toString().padStart(2, "0");
  
  return hour + ":" + min + " " + period;
}

// convert schedule time slots to csv
function scheduleToCSV(slots)
{
  let lines = [];

  for (let i = 0; i < slots.length; i ++)
  {
    let start = minutesToTime(slots[i][0]);
    let end = minutesToTime(slots[i][1]);
    lines.push("start, " + start + ", end, " + end);
  }
  return lines.join("\n")
}

// compare schedules and find free time
function findFreeTime(schedules)
{
  let busyUntil = 0;
  let free = [];
  let slots = schedules.flat();
  
  slots.sort((a, b) => a[0] - b[0]);

  for (let i = 0; i < slots.length; i ++)
  {
    if (busyUntil < slots[i][0])
    {
      free.push([busyUntil, slots[i][0]]);
    }
    busyUntil = Math.max(busyUntil, slots[i][1]);
  }
  
  free.push([busyUntil, 1440])

  return free;
}

// export functions to test file
module.exports = { timeToMinutes, minutesToTime, csvToSchedule, scheduleToCSV, findFreeTime };