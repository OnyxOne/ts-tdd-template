//<editor-fold desc="incoming infra">
//</editor-fold>

//<editor-fold desc="api">
export class Product {
    constructor(
        public productName: string,
        public unitPrice: number) {
    }
}

interface AddProductToInvoice {
    execute(invoiceNumber: string, product: Product, amount: number) : void
}

interface CreateInvoice {
    create(productsWithAmounts: [Product, number][])
}

//</editor-fold>

//<editor-fold desc="usecase">

export class AddProductToInvoiceCommand implements AddProductToInvoice {
    constructor(private repository: InvoiceRepository) {

    }

    execute(invoiceNumber: string, product: Product, amount: number) {
        const invoice = this.repository.findBy(invoiceNumber);

        invoice.addProduct(product, amount);

        this.repository.save(invoice);
    }

}

export class CreateInvoiceCommand implements CreateInvoice {
    constructor(private repository: InvoiceRepository, private getInvoiceNumber: () => string) {

    }

    create(productsWithAmounts: [Product, number][]) {
        let invoice = new Invoice(productsWithAmounts, this.getInvoiceNumber());
        this.repository.save(invoice);
        return invoice.getInvoiceNumber();
    }
}

//</editor-fold>

//<editor-fold desc="domain">
const VAT = 0.21;

class InvoiceLine {

    constructor(public productName: string,
                public amount: number,
                public price: number) {
    }

    getTotal() {
        return this.amount*this.price;
    }
}

export class Invoice {
    private lines: InvoiceLine[]
    private invoiceNumber: string;

    constructor(productsWithAmounts: [Product, number][], invoiceNumber: string) {
        this.lines = productsWithAmounts.map(([product, amount]) => {
            return new InvoiceLine(product.productName, amount, product.unitPrice)
        });
        this.invoiceNumber = invoiceNumber;
    }

    public getLines() {
        return this.lines;
    }

    public getVat() {
        return this.getTotalBeforeVat() * VAT;
    }

    private getTotalBeforeVat() {
        return this.lines.reduce((total, invoiceLine) =>
            total + invoiceLine.getTotal(), 0);
    }

    public getTotal() {
        return this.getTotalBeforeVat() + this.getVat();
    }

    public getInvoiceNumber() {
        return this.invoiceNumber;
    }

    addProduct(product: Product, amount: number) {
        const newLine = new InvoiceLine(product.productName, amount, product.unitPrice)
        this.lines.push(newLine)
    }
}

export interface InvoiceRepository {
    save(invoice: Invoice): void;

    findBy(invoiceNumber: string): Invoice;
}

//</editor-fold>

//<editor-fold desc="outgoing infra">
//</editor-fold>
