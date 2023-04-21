import each from "jest-each";

function createInvoice(productName: string, amount: number, unitPrice: number) {
    return {
        getLines : function () {
            return [{
                'productName': productName,
                'amount': amount,
                'price': unitPrice,
            }]
        },
        getVat : function () {
            return amount * unitPrice * 0.21;
        },
        getTotal : function () {
            return (amount * unitPrice) + this.getVat();
        }
    }
}

describe("Creating an invoice", () => {
    const checkInvoiceInfo = (invoice: any, productName: string, amount: number, unitPrice: number, vat: number, total: number) => {
        expect(invoice.getLines()[0].productName).toBe(productName)
        expect(invoice.getLines()[0].amount).toBe(amount);
        expect(invoice.getLines()[0].price).toBe(unitPrice);
        expect(invoice.getVat()).toBe(vat)
        expect(invoice.getTotal()).toBe(total)
    }

    test("with a single product", () => {
        // given

        // when
        var invoice = createInvoice("Pink filament", 2, 10.0);

        // then
        checkInvoiceInfo(invoice, "Pink filament", 1, 20.0, 4.2, 24.2);
    })
    test("with a single product with another price and name", () => {
        // given

        // when
        var invoice = createInvoice("Green filament", 1, 20.0);

        // then
        checkInvoiceInfo(invoice, "Green filament", 1, 20.0, 4.2, 24.2);
    })
    test("with two products", () => {
        // given

        // when
        var invoice = createInvoice([
            {"name": "Pink filament", "amount": 2, "unitPrice": 10.0},
            {"name": "Green filament", "amount": 1, "unitPrice": 20.0},
        ]);

        // then
        expect(invoice.getLines()[0].productName).toBe("Pink filament")
        expect(invoice.getLines()[0].amount).toBe(2);
        expect(invoice.getLines()[0].price).toBe(10);
        expect(invoice.getLines()[1].productName).toBe("Green filament")
        expect(invoice.getLines()[1].amount).toBe(1);
        expect(invoice.getLines()[1].price).toBe(20);
        expect(invoice.getVat()).toBe(8.4)
        expect(invoice.getTotal()).toBe(48.4)
    });
})
