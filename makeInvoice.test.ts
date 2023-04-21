import {AddProductToInvoiceCommand, CreateInvoiceCommand, Invoice, InvoiceRepository, Product} from "./production";

class FakeInvoiceRepository implements InvoiceRepository {

    constructor(...existingInvoices: Invoice[]) {
        this.invoice = existingInvoices[0];
    }

    private invoice: Invoice;

    save(invoice: Invoice): void {
        this.invoice = invoice;
    }

    getByInvoiceNumber(invoiceNumber: string) {
        return this.invoice;
    }

    findBy(invoiceNumber: string): Invoice {
        return this.invoice;
    }

}

let invoices: FakeInvoiceRepository

describe("Creating an invoice", () => {

    const checkInvoiceInfo = (invoiceNumber: string, productName: string, amount: number, unitPrice: number, vat: number, total: number) => {
        const invoice = invoices.getByInvoiceNumber(invoiceNumber)
        expect(invoice.getLines()[0].productName).toBe(productName)
        expect(invoice.getLines()[0].amount).toBe(amount);
        expect(invoice.getLines()[0].price).toBe(unitPrice);
        expect(invoice.getVat()).toBe(vat)
        expect(invoice.getTotal()).toBe(total)
    }

    beforeEach(() => {
        invoices = new FakeInvoiceRepository()
    });

    test("with a single product", () => {
        // when
        var invoiceNumber = new CreateInvoiceCommand(invoices).create([
            [new Product("Pink filament", 10.0), 2]
        ]);

        // then
        checkInvoiceInfo(invoiceNumber, "Pink filament", 2, 10.0, 4.2, 24.2);
    })
    test("with a single product with another price and name", () => {
        // when
        var invoiceNumber = new CreateInvoiceCommand(invoices).create([
            [new Product("Green filament", 20.0), 1]
        ]);

        // then
        checkInvoiceInfo(invoiceNumber, "Green filament", 1, 20.0, 4.2, 24.2);
    })
    test("with two products", () => {
        // when
        const invoiceNumber = new CreateInvoiceCommand(invoices).create([
            [new Product("Pink filament", 10.0), 2],
            [new Product("Green filament", 20.0), 1],
        ]);

        // then
        const invoice = invoices.getByInvoiceNumber(invoiceNumber)
        expect(invoice.getLines()[0].productName).toBe("Pink filament")
        expect(invoice.getLines()[0].amount).toBe(2);
        expect(invoice.getLines()[0].price).toBe(10);
        expect(invoice.getLines()[1].productName).toBe("Green filament")
        expect(invoice.getLines()[1].amount).toBe(1);
        expect(invoice.getLines()[1].price).toBe(20);
        expect(invoice.getVat()).toBe(8.4)
        expect(invoice.getTotal()).toBe(48.4)
    });

    test("with an invoice number", () => {
        // when
        var invoiceNumber = new CreateInvoiceCommand(invoices).create([
            [new Product("Pink filament", 10.0), 2]
        ]);

        expect(invoiceNumber).not.toBeUndefined();
    });
})

function getInvoiceByNumber(invoiceNumber: string) {
    throw Error("Not implemented");
}

describe("Having an existing invoice", () => {
    beforeEach(() => {
        invoices = new FakeInvoiceRepository()
    });

    test("add another product to the invoice", () => {
        // given
        const existingInvoice = new Invoice([
            [new Product("Pink filament", 10.0), 2]])
        invoices = new FakeInvoiceRepository(existingInvoice)

        // when
        new AddProductToInvoiceCommand(invoices).execute(
            "2020-01",
            new Product("Green filament", 20.0),
            1
        );

        const invoice = invoices.getByInvoiceNumber("2020-01")

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
