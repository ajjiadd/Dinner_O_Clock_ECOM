document.addEventListener('DOMContentLoaded', () => {
  const cartButton = document.getElementById('cart-button');
  const cartCount = document.getElementById('cart-count');

  // Update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Initialize
  updateCartCount();
});