import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma"; // This imports the file from Step 1

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

        // 5. Handle "Order Created" (Successful Payment)
        if (eventName === "order_created" || eventName === "subscription_created") {
            const userEmail = attributes.user_email;

            // Upsert: Update if exists, Create if not
            await prisma.userSubscription.upsert({
                where: { email: userEmail },
                update: {
                    isPro: true,
                    lemonSqueezyCustomerId: `${attributes.customer_id}`,
                    lemonSqueezySubscriptionId: `${attributes.first_subscription_item?.subscription_id || ''}`
                },
                create: {
                    email: userEmail,
                    isPro: true,
                    lemonSqueezyCustomerId: `${attributes.customer_id}`,
                    lemonSqueezySubscriptionId: `${attributes.first_subscription_item?.subscription_id || ''}`
                }
            });

            console.log(`✅ Upgraded ${userEmail} to PRO`);
        }

        // 6. Handle Cancellations
        if (eventName === "subscription_cancelled") {
            const subId = `${data.id}`;

            await prisma.userSubscription.updateMany({
                where: { lemonSqueezySubscriptionId: subId },
                data: { isPro: false }
            });
            console.log(`❌ Subscription ${subId} cancelled`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}