document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const eventDateInput = document.getElementById('event-date');
  const eventTypeInput = document.getElementById('event-type');
  const guestCountInput = document.getElementById('guest-count');
  const preferencesInput = document.getElementById('preferences');
  const submitCateringBtn = document.getElementById('submit-catering');
  const cartButton = document.getElementById('cart-button');
  const cartCount = document.getElementById('cart-count');

  // Update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Submit catering request
  submitCateringBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const eventDate = eventDateInput.value;
    const eventType = eventTypeInput.value;
    const guestCount = parseInt(guestCountInput.value);
    const preferences = preferencesInput.value.trim();

    // Validation
    if (!name) {
      alert('Please enter your full name.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!phone) {
      alert('Please enter your phone number.');
      return;
    }
    if (!eventDate) {
      alert('Please select an event date.');
      return;
    }
    if (!eventType) {
      alert('Please select an event type.');
      return;
    }
    if (!guestCount || guestCount < 1) {
      alert('Please enter a valid guest count.');
      return;
    }

    const cateringData = {
      user_id: 1, // Hardcoded for demo; use session-based auth in production
      name,
      email,
      phone,
      event_date: eventDate,
      event_type: eventType,
      guest_count: guestCount,
      preferences: preferences || null
    };

    fetch('/api/catering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cateringData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Catering request submitted successfully! We will contact you soon.');
          nameInput.value = '';
          emailInput.value = '';
          phoneInput.value = '';
          eventDateInput.value = '';
          eventTypeInput.value = '';
          guestCountInput.value = '';
          preferencesInput.value = '';
        }
      })
      .catch(error => {
        console.error('Error submitting catering request:', error);
        alert('Failed to submit catering request. Please try again.');
      });
  });

  // Initialize
  updateCartCount();
});