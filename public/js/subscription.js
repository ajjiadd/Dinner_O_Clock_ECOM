document.addEventListener('DOMContentLoaded', () => {
  const planTypeInput = document.getElementById('plan-type');
  const startDateInput = document.getElementById('start-date');
  const customDaysField = document.getElementById('custom-days-field');
  const dayCheckboxes = document.querySelectorAll('.day-checkbox');
  const submitSubscriptionBtn = document.getElementById('submit-subscription');

  // Handle plan selection
  document.querySelectorAll('.select-plan').forEach(button => {
    button.addEventListener('click', () => {
      const plan = button.getAttribute('data-plan');
      planTypeInput.value = plan === 'full_week' ? 'Full Week' : 'Custom Days';
      customDaysField.classList.toggle('hidden', plan === 'full_week');
      document.querySelectorAll('.plan-card').forEach(card => card.classList.remove('border-blue-600', 'border-2'));
      button.parentElement.classList.add('border-blue-600', 'border-2');
    });
  });

  // Submit subscription
  submitSubscriptionBtn.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please log in to create a subscription.');
      window.location.href = 'login.html';
      return;
    }

    const planType = planTypeInput.value === 'Full Week' ? 'full_week' : 'custom_days';
    const startDate = startDateInput.value;
    const selectedDays = Array.from(dayCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value)
      .join(',');

    // Validation
    if (!planType) {
      alert('Please select a plan.');
      return;
    }
    if (!startDate) {
      alert('Please select a start date.');
      return;
    }
    if (planType === 'custom_days' && selectedDays.split(',').length < 3) {
      alert('Please select at least 3 days for the Custom Days plan.');
      return;
    }

    const subscriptionData = {
      user_id: user.id, // Use authenticated user_id
      plan_type: planType,
      days: planType === 'custom_days' ? selectedDays : 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
      start_date: startDate
    };

    fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Subscription created successfully!');
          planTypeInput.value = '';
          startDateInput.value = '';
          dayCheckboxes.forEach(cb => cb.checked = false);
          document.querySelectorAll('.plan-card').forEach(card => card.classList.remove('border-blue-600', 'border-2'));
          customDaysField.classList.add('hidden');
        }
      })
      .catch(error => {
        console.error('Error submitting subscription:', error);
        alert('Failed to create subscription. Please try again.');
      });
  });
});