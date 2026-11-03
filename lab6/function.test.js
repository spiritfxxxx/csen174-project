const { findFreeTime } = require('./function');

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
    expect(findFreeTime([[[100, 200]], [[100, 200]]])).toEqual([[0, 100], [200, 1440]])
});

// 4. invalid case
test('retrun error for null input', () => {
    expect(() => findFreeTime(null)).toThrow()
});

// 5. invalid case
test('find free time for one schedules', () => {
    expect(() => findFreeTime([[[100, 200]]])).toThrow()
});

/*
added a length < 2 validation to make sure there are at least 2 schedules to compare
test case 3 and 5 are impacted
case 3 originally only have 1 schedule as the input, which is my mistake, I replaced it with 2 schedules
case 5 now correctly throw the error as there is only one schedule input
*/