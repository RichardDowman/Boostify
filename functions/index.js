// functions/index.js
const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51R2PGSE0e3X64HIoV28FEIzKBqtraHU3efPQLQpAWCzHi3lk45wDZqJPI8xzuQ9dGnqBu1QeIxXcpFiiFe4puOsX00m1MUzVVD");

if (!admin.apps.length) {
  admin.initializeApp();
}

// =====================
// sendPayout function
// =====================
exports.sendPayout = onCall(
  {
    region: "us-central1",
    runtimeOptions: {
      memory: "256MiB",
      timeoutSeconds: 60,
    },
    serviceAccount: "boostify-b0f94@appspot.gserviceaccount.com",
  },
  async (request) => {
    try {
      const { eventId, performerId } = request.data;

      if (!eventId || !performerId) {
        throw new Error("Missing required parameters (eventId, performerId)");
      }

      const performerRef = admin
        .firestore()
        .collection("events")
        .doc(eventId)
        .collection("performers")
        .doc(performerId);

      const performerDoc = await performerRef.get();
      if (!performerDoc.exists) {
        throw new Error("Performer not found in event");
      }

      const performerData = performerDoc.data();
      const totalTips = performerData.totalTips || 0;
      const performerAccountId = performerData.stripeAccountId;

      if (!performerAccountId) {
        throw new Error("Performer Stripe account ID missing");
      }

      if (totalTips <= 0) {
        throw new Error("No funds available for payout");
      }

      const payoutAmount = Math.round(totalTips * 0.75 * 100); // cents
      const currency = "usd";

      const transfer = await stripe.transfers.create({
        amount: payoutAmount,
        currency,
        destination: performerAccountId,
        metadata: { eventId, performerId, totalTips: totalTips.toFixed(2) },
      });

      console.log("Transfer successful:", transfer.id);
      return { success: true, transferId: transfer.id };
    } catch (error) {
      console.error("Payout failed:", error.message);
      return { success: false, error: error.message || "Unknown error" };
    }
  }
);

// =====================
// createStripeAccountLink function
// =====================
exports.createStripeAccountLink = onCall(
  {
    region: "us-central1",
    runtimeOptions: {
      memory: "256MiB",
      timeoutSeconds: 60,
    },
    serviceAccount: "boostify-b0f94@appspot.gserviceaccount.com",
  },
  async (request) => {
    const { uid } = request.data;
    if (!uid) {
      throw new Error("Missing required parameter: uid");
    }

    try {
      const account = await stripe.accounts.create({
        type: "custom",
        country: "US",
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
        },
      });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: "https://your-app-url.com/reauth",
        return_url: "https://your-app-url.com/complete",
        type: "account_onboarding",
      });

      return { link: accountLink.url, accountId: account.id };
    } catch (error) {
      console.error("Stripe onboarding error:", error);
      throw new Error(error.message);
    }
  }
);

// =====================
// ✅ UPDATED createCheckoutSession function
// =====================
exports.createCheckoutSession = onCall(
  {
    region: "us-central1",
    runtimeOptions: {
      memory: "256MiB",
      timeoutSeconds: 60,
    },
    serviceAccount: "boostify-b0f94@appspot.gserviceaccount.com",
  },
  async (request) => {
    try {
      const { amount } = request.data;
      const userId = request.auth?.uid;

      if (!userId || !amount) {
        throw new Error("Missing required parameters");
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Boostify Token Top-Up",
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://boostify-b0f94.firebaseapp.com/success",
        cancel_url: "https://boostify-b0f94.firebaseapp.com/cancel",
        metadata: {
          userId,
        },
      });

      // ✅ Return full URL instead of just sessionId
      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("createCheckoutSession error:", error.message);
      throw new Error(error.message);
    }
  }
);









