import each from "jest-each";

class Product {
    constructor (
        public productName: string,
        public amount: number,
        public unitPrice: number,
    ) {
    }

    public getTotal() {
        return this.amount * this.unitPrice;
    }
}

const VAT = 0.21;

class Invoice {
    constructor (
        public products: Product[]
    ) {
    }

    public getLines () {
        return this.products.map(product => ({
            'productName': product.productName,
            'amount': product.amount,
            'price': product.unitPrice,
        }))
    }
    public getVat () {
        return this.getTotalBeforeVat() * VAT;
    }
    private getTotalBeforeVat () {
        return this.products.reduce((total, product) =>
            total + product.getTotal(), 0);
    }
    public getTotal () {
        return this.getTotalBeforeVat() + this.getVat();
    }
    public getInvoiceNumber () {
        return "2020-01";
    }
}

function createInvoice(products: Product[]) {
    return new Invoice(products);
}

interface InvoiceRepository {
    save(invoice: Invoice): void;
}

class fakeInvoiceRepository implements InvoiceRepository {
    private invoice: Invoice;
    save(invoice: Invoice): void {
       this.invoice = invoice;
    }

    getByInvoiceNumber(invoiceNumber: string) {
        return this.invoice;
    }

}

class CreateInvoiceCommand
{
    constructor(private repository: InvoiceRepository) {

    }
    public create(products: Product[]) {
        let invoice = new Invoice(products);
        this.repository.save(invoice);
        return invoice.getInvoiceNumber();
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
        const invoices = new fakeInvoiceRepository()

        // when
        var invoiceNumber = new CreateInvoiceCommand(invoices).create([
            new Product(
                "Pink filament",
                2,
                10.0
            )
        ]);

        // then
        checkInvoiceInfo(invoices.getByInvoiceNumber(invoiceNumber), "Pink filament", 2, 10.0, 4.2, 24.2);
    })
    test("with a single product with another price and name", () => {
        // given

        // when
        var invoice = createInvoice([
            new Product(
                "Green filament",
                1,
                20.0
            )
        ]);

        // then
        checkInvoiceInfo(invoice, "Green filament", 1, 20.0, 4.2, 24.2);
    })
    test("with two products", () => {
        // given

        // when
        var invoice = createInvoice([
            new Product(
                "Pink filament",
                2,
                10.0
            ),
            new Product(
                "Green filament",
                1,
                20.0
            ),
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

    test("with an invoice number", () => {
        var invoice = createInvoice([
            new Product(
                "Pink filament",
                2,
                10.0
            )
        ]);

        expect(invoice.getInvoiceNumber()).not.toBeUndefined();
    });
})

function addProductToInvoice(invoiceNumber: string, product: Product) {
    throw Error("Not implemented");
}

function getInvoiceByNumber(invoiceNumber: string) {
    throw Error("Not implemented");
}

xdescribe("Having an existing invoice", () => {
    test("add another product to the invoice", () => {
        // given
        createInvoice([
            new Product(
                "Pink filament",
                2,
                10.0
            )
        ]);

        // when
        addProductToInvoice(
            "2020-01",
            new Product(
                "Green filament",
                1,
                20.0
            )
        );
        const invoice = getInvoiceByNumber("2020-01");

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
