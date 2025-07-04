document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const deliveryType = document.getElementById('delivery-type');
  const addressField = document.getElementById('address-field');
  const addressInput = document.getElementById('address');
  const orderDate = document.getElementById('order-date');
  const paymentMethod = document.getElementById('payment-method');
  const cardElementContainer = document.getElementById('card-element');
  const submitOrderBtn = document.getElementById('submit-order');

  // Initialize Stripe
  const stripe = Stripe('pk_test_your_stripe_publishable_key'); // Replace with your Stripe publishable key
  const elements = stripe.elements();
  const cardElement = elements.create('card');
  cardElement.mount('#card-element');

  // Load cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  // Render cart items
  function renderCart() {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="text-center text-gray-600">Your cart is empty.</p>';
      cartTotal.textContent = 'Total: $0.00';
      submitOrderBtn.disabled = true;
      return;
    }
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="flex justify-between items-center border-b py-2">
        <div>
          <h4 class="text-lg font-semibold">${item.name}</h4>
          <p class="text-gray-600">$${item.price} x ${item.quantity}</p>
        </div>
        <p class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    `).join('');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }

  // Toggle address and card fields
  deliveryType.addEventListener('change', () => {
    addressField.classList.toggle('hidden', deliveryType.value === 'takeaway');
  });
  paymentMethod.addEventListener('change', () => {
    cardElementContainer.classList.toggle('hidden', paymentMethod.value !== 'card');
  });

  // Submit order
  submitOrderBtn.addEventListener('click', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please log in to place an order.');
      window.location.href = 'login.html';
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    if (!orderDate.value) {
      alert('Please select an order date.');
      return;
    }
    if (deliveryType.value === 'delivery' && !addressInput.value.trim()) {
      alert('Please provide a delivery address.');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderData = {
      user_id: user.id, // Use authenticated user_id
      order_date: orderDate.value,
      delivery_type: deliveryType.value,
      total_price: total,
      address: deliveryType.value === 'delivery' ? addressInput.value : null,
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      payment_method: paymentMethod.value
    };

    if (paymentMethod.value === 'card') {
      try {
        // Create payment intent
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total * 100 }) // Stripe expects amount in cents
        });
        const { clientSecret, error } = await response.json();
        if (error) {
          alert(error);
          return;
        }

        // Confirm card payment
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement }
        });
        if (confirmError) {
          alert(confirmError.message);
          return;
        }
        orderData.payment_intent_id = paymentIntent.id;
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Failed to process payment. Please try again.');
        return;
      }
    }

    // Submit order
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Order placed successfully!');
          localStorage.removeItem('cart');
          cart = [];
          renderCart();
          cardElement.clear();
        }
      })
      .catch(error => {
        console.error('Error submitting order:', error);
        alert('Failed to place order. Please try again.');
      });
  });

  // Initialize
  renderCart();
  addressField.classList.toggle('hidden', deliveryType.value === 'takeaway');
  cardElementContainer.classList.toggle('hidden', paymentMethod.value !== 'card');
});