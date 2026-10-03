import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const dataSource = new ExternalServices();

async function addProductToCart(e) {
  // Get the product ID straight from the clicked button's data-id attribute
  const productId = e.target.dataset.id;
  
  if (!productId) {
    console.error("No product ID found on button!");
    return;
  }

  const product = await dataSource.findProductById(productId);
  if (!product) return;

  let cartItems = getLocalStorage("so-cart") || [];
  if (!Array.isArray(cartItems)) {
    cartItems = [cartItems];
  }

  cartItems.push(product);
  setLocalStorage("so-cart", cartItems);
  alert("Item added to cart successfully!");
}

// Listen for clicks on the add to cart button
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "addToCart") {
    addProductToCart(e);
  }
});