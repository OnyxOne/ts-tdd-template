import each from "jest-each";

describe("Test stuff", () => {
    each([true, false]).test('runs it', (value) => {
        expect(value).toEqual(true);
    });
    test("test true", () => {
        expect(true).toBe(true);
    });
    test("test false", () => {
        expect(false).toBe(true);
    });
});

function createInvoice(pinkFilament: string, number: number, number2: number) {
    return {
        getLines : function ()  {
            return [{
                'productName':  "Pink filament",
                'amount':  2,
                'price':  10.0,
            }]
        },
        getVat : function () {
            return 4.2
        },
        getTotal : function () {
            return 24.2
        }
    }
}

describe("Creating an invoice", () => {
    test("with a single product", () => {
        // given

        // when
        var invoice = createInvoice("Pink filament", 2, 10.0);

        // then
        expect(invoice.getLines()[0].productName).toBe("Pink filament")
        expect(invoice.getLines()[0].amount).toBe(2);
        expect(invoice.getLines()[0].price).toBe(10.0);
        expect(invoice.getVat()).toBe(4.2)
        expect(invoice.getTotal()).toBe(24.2)
    })
    test("with a single product", () => {
        // given

        // when
        var invoice = createInvoice("Green filament", 1, 20.0);

        // then
        expect(invoice.getLines()[0].productName).toBe("Green filament")
        expect(invoice.getLines()[0].amount).toBe(1);
        expect(invoice.getLines()[0].price).toBe(20.0);
        expect(invoice.getVat()).toBe(4.2)
        expect(invoice.getTotal()).toBe(24.2)
    })
})
