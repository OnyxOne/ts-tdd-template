import { Product } from './code/application/api/api';
import { CreateInvoiceCommand, AddProductToInvoiceCommand } from './code/application/usecases/usecases';
import { InvoiceRepository, Invoice } from './code/domain/domain';

class FakeInvoiceRepository implements InvoiceRepository {
    private invoices: Record<string, Invoice> = {};

    constructor(...existingInvoices: Invoice[]) {
        existingInvoices.forEach((invoice) => {
            this.invoices[invoice.getInvoiceNumber()] = invoice;
        });
    }

    save(invoice: Invoice): void {
        this.invoices[invoice.getInvoiceNumber()] = invoice;
    }

    getByInvoiceNumber(invoiceNumber: string) {
        return this.findBy(invoiceNumber);
    }

    findBy(invoiceNumber: string): Invoice {
        const invoice = this.invoices[invoiceNumber];
        if (!invoice) {
            throw new Error("Invoice not found")
        }

        return invoice;
    }

}

let invoices: FakeInvoiceRepository;
const getInvoiceNumber = (invoiceNumber) => () => invoiceNumber;

describe("Creating an invoice", () => {

    const checkInvoiceInfo = (invoiceNumber: string, productName: string, amount: number, unitPrice: number, vat: number, total: number) => {
        const invoice = invoices.getByInvoiceNumber(invoiceNumber);
        expect(invoice.getLines()[0].productName).toBe(productName);
        expect(invoice.getLines()[0].amount).toBe(amount);
        expect(invoice.getLines()[0].price).toBe(unitPrice);
        expect(invoice.getVat()).toBe(vat);
        expect(invoice.getTotal()).toBe(total);
    };

    beforeEach(() => {
        invoices = new FakeInvoiceRepository();
    });

    test("with a single product", () => {
        // when
        const invoiceNumber = new CreateInvoiceCommand(invoices, getInvoiceNumber("an invoice number")).create([
            [new Product("Pink filament", 10.0), 2]
        ]);

        // then
        checkInvoiceInfo(invoiceNumber, "Pink filament", 2, 10.0, 4.2, 24.2);
    });
    
    test("with a single product with a negative amount", () => {
        // when

        let errorMessage: string = '';
        try {
            const invoiceNumber = new CreateInvoiceCommand(invoices, getInvoiceNumber("an invoice number")).create([
                [new Product("Pink filament", 10.0), -2]
            ]);
        } catch (e) {
            errorMessage = e.message;
        }

        expect(errorMessage).toBe("Amount must be positive");
    });
    
    test("with a single product with a negative unit price", () => {
        // when

        let errorMessage: string = '';
        try {
            const invoiceNumber = new CreateInvoiceCommand(invoices, getInvoiceNumber("an invoice number")).create([
                [new Product("Pink filament", -10.0), 2]
            ]);
        } catch (e) {
            errorMessage = e.message;
        }

        expect(errorMessage).toBe("Unit price must be positive");
    });
    
    test("with a single product with another price and name", () => {
        // when
        const invoiceNumber = new CreateInvoiceCommand(invoices, getInvoiceNumber("an invoice number")).create([
            [new Product("Green filament", 20.0), 1]
        ]);

        // then
        checkInvoiceInfo(invoiceNumber, "Green filament", 1, 20.0, 4.2, 24.2);
    });

    test("with two products", () => {
        // when
        const invoiceNumber = new CreateInvoiceCommand(invoices, getInvoiceNumber("an invoice number")).create([
            [new Product("Pink filament", 10.0), 2],
            [new Product("Green filament", 20.0), 1],
        ]);

        // then
        const invoice = invoices.getByInvoiceNumber(invoiceNumber)
        expect(invoice.getLines()[0].productName).toBe("Pink filament");
        expect(invoice.getLines()[0].amount).toBe(2);
        expect(invoice.getLines()[0].price).toBe(10);
        expect(invoice.getLines()[1].productName).toBe("Green filament");
        expect(invoice.getLines()[1].amount).toBe(1);
        expect(invoice.getLines()[1].price).toBe(20);
        expect(invoice.getVat()).toBe(8.4);
        expect(invoice.getTotal()).toBe(48.4);
    });

    test("with an invoice number", () => {
        // when
        const invoiceNumber = new CreateInvoiceCommand(invoices, getInvoiceNumber("a specific invoice number")).create([
            [new Product("Pink filament", 10.0), 2]
        ]);

        expect(invoiceNumber).toBe("a specific invoice number");
    });
})

describe("Having an existing invoice", () => {
    beforeEach(() => {
        invoices = new FakeInvoiceRepository();
    });

    test("ensure the product is added to the corresponding invoice", () => {
        // given
        const existingInvoice1 = new Invoice([], "invoice number 1");
        const existingInvoice2 = new Invoice([], "invoice number 2");
        invoices = new FakeInvoiceRepository(existingInvoice1, existingInvoice2);

        new AddProductToInvoiceCommand(invoices).execute(
            existingInvoice2.getInvoiceNumber(),
            new Product("Blue filament", 20.0),
            1
        );

        // then
        const untouchedInvoice = invoices.getByInvoiceNumber(existingInvoice1.getInvoiceNumber());
        expect(untouchedInvoice.getLines()).toEqual([]);

        const updatedInvoice = invoices.getByInvoiceNumber(existingInvoice2.getInvoiceNumber());
        expect(updatedInvoice.getLines()[0].productName).toBe("Blue filament");
    });

    test("add another product to the invoice", () => {
        // given
        const existingInvoice = new Invoice([
            [new Product("Pink filament", 10.0), 2]
        ], "2020-01");
        invoices = new FakeInvoiceRepository(existingInvoice);

        // when
        new AddProductToInvoiceCommand(invoices).execute(
            "2020-01",
            new Product("Green filament", 20.0),
            1
        );

        const invoice = invoices.getByInvoiceNumber("2020-01");

        // then
        expect(invoice.getLines()[0].productName).toBe("Pink filament");
        expect(invoice.getLines()[0].amount).toBe(2);
        expect(invoice.getLines()[0].price).toBe(10);
        expect(invoice.getLines()[1].productName).toBe("Green filament");
        expect(invoice.getLines()[1].amount).toBe(1);
        expect(invoice.getLines()[1].price).toBe(20);
        expect(invoice.getVat()).toBe(8.4);
        expect(invoice.getTotal()).toBe(48.4);
    });

    test("add another product to the invoice with different amount", () => {
        // given
        const existingInvoice = new Invoice([
            [new Product("Pink filament", 10.0), 2]
        ], "2020-01");
        invoices = new FakeInvoiceRepository(existingInvoice);

        // when
        new AddProductToInvoiceCommand(invoices).execute(
            "2020-01",
            new Product("Green filament", 20.0),
            2
        );

        const invoice = invoices.getByInvoiceNumber("2020-01");

        // then
        expect(invoice.getLines()[0].productName).toBe("Pink filament");
        expect(invoice.getLines()[0].amount).toBe(2);
        expect(invoice.getLines()[0].price).toBe(10);
        expect(invoice.getLines()[1].productName).toBe("Green filament");
        expect(invoice.getLines()[1].amount).toBe(2);
        expect(invoice.getLines()[1].price).toBe(20);
        expect(invoice.getVat()).toBe(12.6);
        expect(invoice.getTotal()).toBe(72.6);
    });

    test("add the same product again to the invoice", () => {
        // given
        const existingInvoice = new Invoice([
            [new Product("Pink filament", 10.0), 2]
        ], "2020-01");
        invoices = new FakeInvoiceRepository(existingInvoice);

        // when
        new AddProductToInvoiceCommand(invoices).execute(
            "2020-01",
            new Product("Pink filament", 10.0),
            1
        );

        const invoice = invoices.getByInvoiceNumber("2020-01");

        // then
        expect(invoice.getLines().length).toBe(1);
        expect(invoice.getLines()[0].productName).toBe("Pink filament");
        expect(invoice.getLines()[0].amount).toBe(3);
        expect(invoice.getLines()[0].price).toBe(10);
        expect(invoice.getVat()).toBe(6.3);
        expect(invoice.getTotal()).toBe(36.3);
    });
})
