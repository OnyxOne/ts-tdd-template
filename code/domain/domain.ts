const VAT = 0.21;

class InvoiceLine {
    increaseAmount(amount: number) {
        this.amount += amount;
    }

    constructor(public productName: string,
                public amount: number,
                public price: number) {
        if (amount < 0) {
            throw new Error("Amount must be positive");
        }

        if (price < 0) {
            throw new Error("Unit price must be positive");
        }
    }

    getTotal() {
        return this.amount*this.price;
    }
}

    
type InvoiceProduct = {
    productName: string,
    unitPrice: number
};
export class Invoice {    
    private lines: Record<string, InvoiceLine> = {};
    private invoiceNumber: string;

    constructor(productsWithAmounts: [InvoiceProduct, number][], invoiceNumber: string) {
        for (const productWithAmount of productsWithAmounts) {
            const [product, amount] = productWithAmount;
            this.lines[product.productName] = new InvoiceLine(product.productName, amount, product.unitPrice);
        }
        this.invoiceNumber = invoiceNumber;
    }

    public getLines(): InvoiceLine[] {
        return Object.values(this.lines);
    }

    public getVat() {
        return this.getTotalBeforeVat() * VAT;
    }

    private getTotalBeforeVat() {
        return this.getLines().reduce((total, invoiceLine) =>
            total + invoiceLine.getTotal(), 0);
    }

    public getTotal() {
        return this.getTotalBeforeVat() + this.getVat();
    }

    public getInvoiceNumber() {
        return this.invoiceNumber;
    }

    addProduct(product: InvoiceProduct, amount: number) {
        const existingLine = this.lines[product.productName];
        if (existingLine) {
            existingLine.increaseAmount(amount);
            return;
        }

        const newLine = new InvoiceLine(product.productName, amount, product.unitPrice)
        this.lines[product.productName] = newLine;
    }
}

export interface InvoiceRepository {
    save(invoice: Invoice): void;

    findBy(invoiceNumber: string): Invoice;
}
