// Test script to verify automatic token refresh
// This can be run in the browser console after logging in

console.log("=== Token Refresh Test ===");

// 1. Check if tokens are stored
const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");

console.log("✓ Access Token exists:", !!accessToken);
console.log("✓ Refresh Token exists:", !!refreshToken);

if (!accessToken || !refreshToken) {
  console.error("❌ Please login first!");
} else {
  console.log("\n📝 Tokens are stored correctly");

  // 2. Decode JWT to check expiry (simple base64 decode)
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    const expiryDate = new Date(payload.exp * 1000);
    const now = new Date();
    const minutesUntilExpiry = Math.floor((expiryDate - now) / 1000 / 60);

    console.log("\n⏰ Access Token Info:");
    console.log("  - Expires at:", expiryDate.toLocaleString());
    console.log("  - Time until expiry:", minutesUntilExpiry, "minutes");
    console.log("  - User ID:", payload.sub);
    console.log("  - Email:", payload.email);
    console.log("  - Role:", payload.role);

    if (minutesUntilExpiry < 0) {
      console.log(
        "\n⚠️  Access token is expired - next API call should trigger refresh"
      );
    } else if (minutesUntilExpiry < 5) {
      console.log(
        "\n⚠️  Access token expires soon - good time to test refresh"
      );
    } else {
      console.log(
        "\n✓ Access token is still valid for",
        minutesUntilExpiry,
        "minutes"
      );
    }
  } catch (e) {
    console.error("❌ Error decoding token:", e);
  }

  console.log("\n📋 To test automatic refresh:");
  console.log("1. Wait for access token to expire (15 minutes)");
  console.log("2. Make any API request (e.g., navigate to a protected page)");
  console.log("3. Open Network tab and look for /auth/refresh call");
  console.log("4. Verify you are NOT logged out");
  console.log("\n💡 Or manually test by setting an expired token:");
  console.log('localStorage.setItem("accessToken", "expired-token")');
  console.log("Then make any API request to trigger refresh");
}
