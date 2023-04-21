import { Invoice, InvoiceRepository } from '../../domain/domain';
import { AddProductToInvoice, CreateInvoice, Product } from '../api/api';

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
