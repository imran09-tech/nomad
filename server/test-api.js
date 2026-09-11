const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log("Starting backend API integration tests...");
  let token = '';

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // Test 1: Register User
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: 'Testy Tester',
        username: `tester_${Date.now()}`
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201, `Failed registration: ${JSON.stringify(data)}`);
    assert.ok(data.token, "Token missing in registration response");
    assert.strictEqual(data.user.email, testEmail, "Emails mismatch");
    console.log("✔ Test 1 passed: User Registration");
  } catch (err) {
    console.error("✘ Test 1 failed:", err.message);
    process.exit(1);
  }

  // Test 2: Login User
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200, `Failed login: ${JSON.stringify(data)}`);
    assert.ok(data.token, "Token missing in login response");
    token = data.token;
    console.log("✔ Test 2 passed: User Login");
  } catch (err) {
    console.error("✘ Test 2 failed:", err.message);
    process.exit(1);
  }

  // Test 3: Get Profile (/auth/me)
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200, `Failed getting profile: ${JSON.stringify(data)}`);
    assert.strictEqual(data.email, testEmail, "Email mismatch in profile");
    console.log("✔ Test 3 passed: Retrieve Profile (/auth/me)");
  } catch (err) {
    console.error("✘ Test 3 failed:", err.message);
    process.exit(1);
  }

  // Test 4: Update Profile
  try {
    const updatedName = 'Updated Name';
    const updatedUsername = `updated_${Date.now()}`;
    const res = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName: updatedName,
        username: updatedUsername,
        email: testEmail,
        currency: 'EUR'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200, `Failed profile update: ${JSON.stringify(data)}`);

    // Re-fetch profile to verify changes
    const verifyRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.fullName, updatedName, "Name not updated");
    assert.strictEqual(verifyData.username, updatedUsername, "Username not updated");
    assert.strictEqual(verifyData.currency, 'EUR', "Currency not updated");
    console.log("✔ Test 4 passed: Update Profile");
  } catch (err) {
    console.error("✘ Test 4 failed:", err.message);
    process.exit(1);
  }

  // Test 5: Fetch Destinations Catalog
  try {
    const res = await fetch(`${BASE_URL}/destinations`);
    const data = await res.json();
    assert.strictEqual(res.status, 200, "Failed fetching destinations");
    assert.ok(Array.isArray(data), "Destinations must be an array");
    assert.ok(data.length > 0, "Seeded destinations list is empty");
    console.log("✔ Test 5 passed: Fetch Destinations Catalog");
  } catch (err) {
    console.error("✘ Test 5 failed:", err.message);
    process.exit(1);
  }

  // Test 6: Create & Fetch Booking
  try {
    const itemName = 'Lunar Gateway Tour';
    const totalPrice = '$8,500,000';
    const utr = '123456789012';

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ itemName, totalPrice, utr })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201, `Failed creating booking: ${JSON.stringify(data)}`);

    // Fetch user bookings to verify
    const getRes = await fetch(`${BASE_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookings = await getRes.json();
    assert.ok(Array.isArray(bookings), "Bookings must be an array");
    assert.ok(bookings.some(b => b.item_name === itemName && b.utr === utr), "Created booking not found in user list");
    console.log("✔ Test 6 passed: Create & Verify User Bookings");
  } catch (err) {
    console.error("✘ Test 6 failed:", err.message);
    process.exit(1);
  }

  // Test 7: Submit & Retrieve User Feedback
  try {
    const category = 'Praise';
    const rating = 5;
    const message = 'The galactic travels are absolutely spectacular! Magnificent support!';

    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ category, rating, message })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201, `Failed submitting feedback: ${JSON.stringify(data)}`);
    assert.ok(data.feedbackId, "FeedbackId missing in feedback submit response");

    // Fetch user feedback to verify
    const getRes = await fetch(`${BASE_URL}/feedback`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const feedbackList = await getRes.json();
    assert.ok(Array.isArray(feedbackList), "Feedback list must be an array");
    assert.ok(feedbackList.some(f => f.category === category && f.rating === rating && f.message === message), "Created feedback not found in user list");
    console.log("✔ Test 7 passed: Submit & Verify User Feedback");
  } catch (err) {
    console.error("✘ Test 7 failed:", err.message);
    process.exit(1);
  }

  console.log("\nALL BACKEND API TESTS COMPLETED SUCCESSFULLY! ✔");
  process.exit(0);
}

runTests();
