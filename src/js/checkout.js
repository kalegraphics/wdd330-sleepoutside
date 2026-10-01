import CheckoutProcess from './CheckoutProcess.mjs';

const checkout = new CheckoutProcess('so-cart', '#order-summary');
checkout.init();

// Calculate Tax, Shipping, and Order Total when zip code loses focus
document.querySelector('#zip').addEventListener('blur', () => {
  checkout.calculateOrderTotal();
});

// Intercept form submit and handle POST request
document.querySelector('#checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;

  if (form.checkValidity()) {
    checkout.checkout(form);
  }
});