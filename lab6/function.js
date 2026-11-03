// compare schedules and find free time
function findFreeTime(schedules)
{
    if (schedules.length < 2) throw new Error("need at least 2 schedules");

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

module.exports = { findFreeTime };