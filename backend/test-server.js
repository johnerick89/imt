const axios = require("axios");

async function testServer() {
  try {
    console.log("Testing server health...");
    const response = await axios.get("http://localhost:5000/health");
    console.log("✅ Server is running!");
    console.log("Response:", response.data);

    console.log("\nTesting API endpoint...");
    const apiResponse = await axios.get("http://localhost:5000/api");
    console.log("✅ API endpoint is working!");
    console.log("Response:", apiResponse.data);
  } catch (error) {
    console.error("❌ Server test failed:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testServer();
