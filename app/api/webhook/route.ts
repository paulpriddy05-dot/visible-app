import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        // 1. Get raw body for verification
        const rawBody = await req.text();

        // 2. Get signature
        const hmac = req.headers.get("x-signature");

        // 3. Verify signature
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";
        const digest = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        if (!hmac || hmac !== digest) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // 4. Parse payload
        const payload = JSON.parse(rawBody);
        const eventName = payload.meta.event_name;
        const data = payload.data;
        const attributes = data.attributes;

        // 5. Handle "Order Created" or "Subscription Created"
        if (eventName === "order_created" || eventName === "subscription_created" || eventName === "subscription_updated") {
            const userEmail = attributes.user_email;

            // -- NEW: Determine Plan Type --
            // We look at the "variant_name" (e.g., "Visible Pro", "Visible Team")
            const variantName = attributes.variant_name || "";
            const productName = variantName.toLowerCase();

            let planType = "free"; // Default
            if (productName.includes("team")) {
                planType = "team";
            } else if (productName.includes("pro")) {
                planType = "pro";
            }

            // Upsert: Update if exists, Create if not
            await prisma.userSubscription.upsert({
                where: { email: userEmail },
                update: {
                    plan: planType, // Save 'pro' or 'team'
                    isPro: true,    // Keep this true for both paid plans
                    lemonSqueezyCustomerId: `${attributes.customer_id}`,
                    lemonSqueezySubscriptionId: `${attributes.first_subscription_item?.subscription_id || data.id}`
                },
                create: {
                    email: userEmail,
                    plan: planType,
                    isPro: true,
                    lemonSqueezyCustomerId: `${attributes.customer_id}`,
                    lemonSqueezySubscriptionId: `${attributes.first_subscription_item?.subscription_id || data.id}`
                }
            });

            console.log(`✅ Upgraded ${userEmail} to ${planType.toUpperCase()}`);
        }

        // 6. Handle Cancellations / Expirations
        if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
            const subId = `${data.id}`;

            // Revert plan to 'free' and isPro to false
            await prisma.userSubscription.updateMany({
                where: { lemonSqueezySubscriptionId: subId },
                data: {
                    isPro: false,
                    plan: "free"
                }
            });
            console.log(`❌ Subscription ${subId} cancelled - reverted to FREE`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}