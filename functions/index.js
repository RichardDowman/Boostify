// Optional: Ensure Firebase doesn't auto-parse the body so that req.rawBody is available.
// Uncomment the next line if you experience issues with req.rawBody
// process.env.FIREBASE_FUNCTIONS_BODY_PARSER = "false";

const { onCall, onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51R2PGSE0e3X64HIoV28FEIzKBqtraHU3efPQLQpAWCzHi3lk45wDZqJPI8xzuQ9dGnqBu1QeIxXcpFiiFe4puOsX00m1MUzVVD");

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

// =====================
// sendPayout function
// =====================
exports.sendPayout = onCall(
  {
    region: "us-central1",
    runtimeOptions: { memory: "256MiB", timeoutSeconds: 60 },
    serviceAccount: "boostify-b0f94@appspot.gserviceaccount.com",
  },
  async (request) => {
    try {
      const { eventId, performerId } = request.data;
      if (!eventId || !performerId) {
        throw new Error("Missing required parameters (eventId, performerId)");
      }
      const performerRef = firestore
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

      const payoutAmount = Math.round(totalTips * 0.75 * 100);
      await stripe.transfers.create({
        amount: payoutAmount,
        currency: "usd",
        destination: performerAccountId,
        metadata: { eventId, performerId, totalTips: totalTips.toFixed(2) },
      });
      console.log("Transfer successful");
      return { success: true };
    } catch (error) {
      console.error("Payout failed:", error.message);
      return { success: false, error: error.message };
    }
  }
);

// =====================
// createStripeAccountLink function
// =====================
exports.createStripeAccountLink = onCall(
  {
    region: "us-central1",
    runtimeOptions: { memory: "256MiB", timeoutSeconds: 60 },
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
        capabilities: { transfers: { requested: true } },
      });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: "https://your-app-url.com/reauth",
        return_url: "https://your-app-url.com/complete",
        type: "account_onboarding",
      });
      return { link: accountLink.url, accountId: account.id };
    } catch (error) {
      console.error("Stripe onboarding error:", error.message);
      throw new Error(error.message);
    }
  }
);

// =====================
// createCheckoutSession function
// =====================
exports.createCheckoutSession = onCall(
  {
    region: "us-central1",
    runtimeOptions: { memory: "256MiB", timeoutSeconds: 60 },
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
              product_data: { name: "Boostify Token Top-Up" },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://boostify-b0f94.firebaseapp.com/success",
        cancel_url: "https://boostify-b0f94.firebaseapp.com/cancel",
        metadata: { userId },
      });
      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error("createCheckoutSession error:", error.message);
      throw new Error(error.message);
    }
  }
);

// =====================
// verifyCheckoutSession function
// =====================
exports.verifyCheckoutSession = onCall(
  {
    region: "us-central1",
    runtimeOptions: { memory: "256MiB", timeoutSeconds: 60 },
    serviceAccount: "boostify-b0f94@appspot.gserviceaccount.com",
  },
  async (request) => {
    const { sessionId } = request.data;
    const userId = request.auth?.uid;
    if (!sessionId || !userId) {
      throw new Error("Missing sessionId or unauthenticated user");
    }
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return { success: false };
      }
      const amount = session.amount_total / 100;

      const userRef = firestore.collection("wallets").doc(userId);
      await firestore.runTransaction(async (t) => {
        const docSnap = await t.get(userRef);
        const currentBalance = docSnap.exists ? docSnap.data().balance || 0 : 0;
        t.set(userRef, { balance: currentBalance + amount }, { merge: true });
      });

      return { success: true, newBalance: amount };
    } catch (err) {
      console.error("verifyCheckoutSession error:", err.message);
      throw new Error("Failed to verify session");
    }
  }
);

// =====================
// Stripe Webhook function using req.rawBody
// with your new secret: whsec_sTli6uSC3HLIdGcgEAEsiY3jlubKgOFS
// =====================
exports.handleStripeWebhook = onRequest(
  { region: "us-central1", serviceAccount: "boostify-b0f94@appspot.gserviceaccount.com" },
  (req, res) => {
    console.log("🔔 Stripe webhook endpoint hit");

    const sig = req.headers["stripe-signature"];
    const webhookSecret = "whsec_sTli6uSC3HLIdGcgEAEsiY3jlubKgOFS"; // <-- Correct secret

    if (!sig) {
      console.error("❌ No stripe-signature header found");
      return res.status(400).send("No signature header");
    }

    let event;
    try {
      // Use req.rawBody as provided by Firebase for signature verification
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
      console.log(`📦 Event type: ${event.type}`);
      console.log("🧾 Full event received:", JSON.stringify(event, null, 2));
    } catch (err) {
      console.error("❌ Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const amount = session.amount_total / 100;
      console.log(`✅ Payment complete: userId=${userId}, amount=$${amount}`);

      if (!userId) {
        console.warn("⚠️ No userId in session metadata");
        return res.status(400).send("Missing userId");
      }

      // Update Firestore wallet
      const walletRef = firestore.collection("wallets").doc(userId);
      walletRef
        .set({ balance: admin.firestore.FieldValue.increment(amount) }, { merge: true })
        .then(() => {
          console.log(`💰 Wallet updated for ${userId} by $${amount}`);
          return res.status(200).send("Webhook processed");
        })
        .catch((err) => {
          console.error("❌ Error updating wallet:", err.message);
          return res.status(500).send("Failed to update wallet");
        });
    } else {
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
      return res.status(200).send("Unhandled event type");
    }
  }
);
























