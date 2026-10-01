import { getLocalStorage } from './utils.mjs';
import ExternalServices from './ExternalServices.mjs';

function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};
  formData.forEach((value, key) => {
    convertedJSON[key] = value;
  });
  return convertedJSON;
}

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: item.Quantity || 1,
  }));
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    this.itemTotal = this.list.reduce(
      (sum, item) => sum + item.FinalPrice * (item.Quantity || 1),
      0
    );
    const subtotalElem = document.querySelector(`${this.outputSelector} #subtotal`);
    const numItemsElem = document.querySelector(`${this.outputSelector} #num-items`);

    if (subtotalElem) subtotalElem.innerText = `$${this.itemTotal.toFixed(2)}`;
    if (numItemsElem)
      numItemsElem.innerText = this.list.reduce(
        (count, item) => count + (item.Quantity || 1),
        0
      );
  }

  calculateOrderTotal() {
    const totalItems = this.list.reduce(
      (count, item) => count + (item.Quantity || 1),
      0
    );

    if (totalItems > 0) {
      this.tax = this.itemTotal * 0.06;
      this.shipping = 10 + (totalItems - 1) * 2;
      this.orderTotal = this.itemTotal + this.tax + this.shipping;
    } else {
      this.tax = 0;
      this.shipping = 0;
      this.orderTotal = 0;
    }

    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxElem = document.querySelector(`${this.outputSelector} #tax`);
    const shippingElem = document.querySelector(`${this.outputSelector} #shipping`);
    const totalElem = document.querySelector(`${this.outputSelector} #orderTotal`);

    if (taxElem) taxElem.innerText = `$${this.tax.toFixed(2)}`;
    if (shippingElem) shippingElem.innerText = `$${this.shipping.toFixed(2)}`;
    if (totalElem) totalElem.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout(form) {
    const jsonOrder = formDataToJSON(form);

    jsonOrder.orderDate = new Date().toISOString();
    jsonOrder.items = packageItems(this.list);
    jsonOrder.itemTotal = this.itemTotal.toFixed(2);
    jsonOrder.shipping = this.shipping;
    jsonOrder.tax = this.tax.toFixed(2);
    jsonOrder.orderTotal = this.orderTotal.toFixed(2);

    const services = new ExternalServices();
    try {
      const res = await services.checkout(jsonOrder);
      console.log('Order response:', res);
      return res;
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }
}