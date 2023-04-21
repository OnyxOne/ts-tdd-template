export class Product {
  constructor(
      public productName: string,
      public unitPrice: number) {
  }
}

export interface AddProductToInvoice {
  execute(invoiceNumber: string, product: Product, amount: number) : void
}

export interface CreateInvoice {
  create(productsWithAmounts: [Product, number][]): string
}
