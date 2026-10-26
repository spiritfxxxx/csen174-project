// get functions from functions file
const { timeToMinutes, minutesToTime, csvToSchedule, scheduleToCSV, findFreeTime } = require('./functions');

// 1. timeToMinutes -----------------------------------------------------------------------------------------------

// 1. normal case
test('converts 10:37 AM to 637', () => {
    expect(timeToMinutes("10:37 AM")).toBe(637)
});

// 2. normal case
test('converts 6:12 PM to 1092', () => {
    expect(timeToMinutes("6:12 PM")).toBe(1092)
})

// 3. edge case
test('converts 12:00 PM to 720', () => {
    expect(timeToMinutes("12:00 PM")).toBe(720)
});

// 4. edge case
test('converts 12:00 AM to 0', () => {
    expect(timeToMinutes("12:00 AM")).toBe(0)
});

// 5. invalid case
test('return error for number input', () => {
    expect(() => timeToMinutes(123)).toThrow();
})

// 2. minutesToTime -----------------------------------------------------------------------------------------------

// 1. normal case
test('convert 637 to 10:37 AM', () => {
    expect(minutesToTime(637)).toBe("10:37 AM")
});

// 2. normal case
test('converts 1092 to 6:12 PM', () => {
    expect(minutesToTime(1092)).toBe("6:12 PM")
});

// 3. edge case
test('converts 720 to 12:00 PM', () => {
    expect(minutesToTime(720)).toBe("12:00 PM")
});

// 4. edge case
test('converts 0 to 12:00 AM', () => {
    expect(minutesToTime(0)).toBe("12:00 AM")
});

// 5. invalid case - currently return NaN:NaN instead of throwing
test('return error for string input', () => {
    expect(() => minutesToTime("hi")).toThrow()
});

// 3. csvToSchedule -----------------------------------------------------------------------------------------------

// 1. normal case
test('return [[630, 690], [720, 830]] for start, 10:30 AM, end, 11:30 AM start, 12:00 PM, end, 1:50 PM', () => {
    expect(csvToSchedule("start, 10:30 AM, end, 11:30 AM\nstart, 12:00 PM, end, 1:50 PM")).toEqual([[630, 690], [720, 830]])
});

// 2. normal case
test('return [[540, 600]] for start, 9:00 AM, end 10:00 AM', () => {
    expect(csvToSchedule("start, 9:00 AM, end, 10:00 AM")).toEqual([[540, 600]])
});

// 3. edge case
test('return [0, 1439] for start, 12:00 AM, end, 11:59 PM', () => {
    expect(csvToSchedule("start, 12:00 AM, end, 11:59 PM")).toEqual([[0, 1439]])
});

// 4. invalid case
test('retrun error for empty input', () => {
    expect(() => csvToSchedule("")).toThrow()
});

// 5. invalid case - curretnly return [[NaN, NaN]]
test('retrun errror for missing the time', () => {
    expect(() => csvToSchedule("start, , end,")).toThrow()
});

// 4. scheduleToCSV -----------------------------------------------------------------------------------------------

// 1. normal case
test('return start, 10:30 AM, end, 11:30 AM start, 12:00 PM, end, 1:50 PM for [[630, 690], [720, 830]]', () => {
    expect(scheduleToCSV([[630, 690], [720, 830]])).toEqual("start, 10:30 AM, end, 11:30 AM\nstart, 12:00 PM, end, 1:50 PM")
});

// 2. normal case
test('return start, 9:00 AM, end 10:00 AM for [[540, 600]]', () => {
    expect(scheduleToCSV([[540, 600]])).toEqual("start, 9:00 AM, end, 10:00 AM")
});

// 3. edge case
test('return start, 12:00 AM, end, 11:59 PM[0, 1439] for [[0, 1439]]', () => {
    expect(scheduleToCSV([[0, 1439]])).toEqual("start, 12:00 AM, end, 11:59 PM")
});

// 4. invalid case
test('retrun error for null input', () => {
    expect(() => scheduleToCSV(null)).toThrow()
});

// 5. invalid case - curretnly return start, NaN:NaN AM, end, NaN:NaN AM
test('retrun errror for string input', () => {
    expect(() => scheduleToCSV([[]])).toThrow()
});

// 5. findFreeTime -----------------------------------------------------------------------------------------------

// 1. normal case
test('finds free time between two schedules', () => {
    expect(findFreeTime([[[100, 200], [250, 300],[310, 320]], [[150, 210],[240, 300],[310, 330]]])).toEqual([[0, 100], [210, 240], [300, 310], [330, 1440]])
});

// 2. normal case
test('find free time between three schedules', () => {
    expect(findFreeTime([[[100,200]], [[300,400]], [[500,600]]])).toEqual([[0, 100], [200, 300], [400, 500], [600, 1440]])
});

// 3. edge case
test('find free time for comepltely overlapping', () => {
    expect(findFreeTime([[[100, 200], [100, 200]]])).toEqual([[0, 100], [200, 1440]])
});

// 4. invalid case
test('retrun error for null input', () => {
    expect(() => findFreeTime(null)).toThrow()
});

// 5. invalid case - currently return [[NaN, 1440]]
test('find free time for one schedules', () => {
    expect(() => findFreeTime([[[100, 200]]])).toThrow()
});

