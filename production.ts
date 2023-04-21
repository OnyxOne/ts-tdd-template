//<editor-fold desc="incoming infra">
//</editor-fold>

//<editor-fold desc="api">
//</editor-fold>

//<editor-fold desc="usecase">
import * as repl from "repl";

export class AddProductToInvoice {
    constructor(private repository: InvoiceRepository) {

    }

    execute(invoiceNumber: string, product: Product) {
        const invoice = this.repository.findBy(invoiceNumber);

        invoice.addProduct(product);

        this.repository.save(invoice);
    }

}
export class CreateInvoiceCommand {
    constructor(private repository: InvoiceRepository) {

    }

    public create(products: Product[]) {
        let invoice = new Invoice(products);
        this.repository.save(invoice);
        return invoice.getInvoiceNumber();
    }
}

//</editor-fold>

//<editor-fold desc="domain">
const VAT = 0.21;

export class Product {
    constructor(
        public productName: string,
        public amount: number,
        public unitPrice: number,
    ) {
    }

    public getTotal() {
        return this.amount * this.unitPrice;
    }
}

export class Invoice {
    constructor(public products: Product[]) {
    }

    public getLines() {
        return this.products.map(product => ({
            'productName': product.productName,
            'amount': product.amount,
            'price': product.unitPrice,
        }))
    }

    public getVat() {
        return this.getTotalBeforeVat() * VAT;
    }

    private getTotalBeforeVat() {
        return this.products.reduce((total, product) =>
            total + product.getTotal(), 0);
    }

    public getTotal() {
        return this.getTotalBeforeVat() + this.getVat();
    }

    public getInvoiceNumber() {
        return "2020-01";
    }

    addProduct(product: Product) {
        this.products.push(product)
    }
}

export interface InvoiceRepository {
    save(invoice: Invoice): void;

    findBy(invoiceNumber: string): Invoice;
}

//</editor-fold>

//<editor-fold desc="outgoing infra">
//</editor-fold>
