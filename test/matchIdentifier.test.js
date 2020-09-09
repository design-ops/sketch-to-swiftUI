const { matchScore } = require('../lib/identifierMatcher');

test('Calculates correct score for each identifier', () => {
    const specific = "home/header/searchBar/label"
    expect(matchScore(specific, "home/header/searchBar/label")).toBe(Number.MAX_SAFE_INTEGER);
    expect(matchScore(specific, "header/searchBar/label")).toBe(40);
    expect(matchScore(specific, "home/searchBar/label")).toBe(34);
    expect(matchScore(specific, "home/header/label")).toBe(10);
    expect(matchScore(specific, "searchBar/label")).toBe(32);
    expect(matchScore(specific, "header/label")).toBe(8);
    expect(matchScore(specific, "home/label")).toBe(2);
    expect(matchScore(specific, "label")).toBe(1);
});

test("Returns 0 for identifiers that don't match", () => {
    const specific = "home/header/searchBar/label"
    expect(matchScore(specific, "")).toBe(0);
    expect(matchScore(specific, "label/searchBa")).toBe(0);
    expect(matchScore(specific, "home/header/searchBar/label/extra")).toBe(0);
});

test("Returns the correct score for identifiers with variants", () => {
    const specific = "home/header[selected]/searchBar[deselected]/label"
    expect(matchScore(specific, "home/header[selected]/searchBar[deselected]/label")).toBe(Number.MAX_SAFE_INTEGER);
    expect(matchScore(specific, "header[selected]/searchBar[deselected]/label")).toBe(120);
    expect(matchScore(specific, "header[selected]/searchBar/label")).toBe(56);
    expect(matchScore(specific, "header/searchBar[deselected]/label")).toBe(104);
    expect(matchScore(specific, "header[selected]/label")).toBe(24);
    expect(matchScore(specific, "header/searchBar/label")).toBe(40);
    expect(matchScore(specific, "home/label")).toBe(2);
});

test("Returns the correct score of 0 for identifiers with variants that don't match", () => {
    const specific = "home/header[selected]/searchBar[deselected]/label"
    expect(matchScore(specific, "home[selected]/label")).toBe(0);
    expect(matchScore(specific, "header[normal]/label")).toBe(0);
});
