import each from "jest-each";

describe("Test stuff", () => {
    each([
        true,
        false
    ]).test('runs it', (value) => {

        expect(value).toEqual(true)
    })
    test("test true", () => {
        expect(true).toBe(true)
    })
    test("test false", () => {
        expect(false).toBe(true)
    })
})
