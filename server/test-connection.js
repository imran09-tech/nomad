fetch('http://localhost:5000/api/destinations')
  .then(res => {
    console.log("Status:", res.status);
    return res.json();
  })
  .then(data => {
    console.log("Fetched destinations count:", data.length);
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
