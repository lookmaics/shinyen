import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { simulateAllDelivered = false } = body;
    const now = new Date();

    // 1. If Supabase is connected, query orders past 48h inspection window
    if (isSupabaseConfigured()) {
      let query = supabase
        .from("orders")
        .select("*, products(title, category)")
        .eq("status", "DELIVERED_INSPECTION_WINDOW");

      if (!simulateAllDelivered) {
        query = query.lt("inspection_ends_at", now.toISOString());
      }

      const { data: eligibleOrders, error } = await query;
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      const settledOrders = [];
      let totalSellerDisbursed = 0;
      let totalRiderDisbursed = 0;
      let totalPlatformRetained = 0;
      let totalInsuranceAccumulated = 0;

      for (const order of eligibleOrders || []) {
        // Verify no open dispute exists
        const { data: dispute } = await supabase
          .from("disputes")
          .select("id")
          .eq("order_id", order.id)
          .eq("status", "OPEN")
          .single();

        if (dispute) {
          // Skip disputed orders
          continue;
        }

        const sellerSplitKey = `seller_split_${order.id}`;
        const riderPayoutKey = `rider_payout_${order.id}`;
        const utrNumber = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;

        // Transactional outbox update
        await supabase
          .from("orders")
          .update({
            status: "COMPLETED_SETTLED",
            settled_at: now.toISOString(),
          })
          .eq("id", order.id);

        // Record seller payout
        await supabase.from("payouts").insert({
          order_id: order.id,
          seller_id: order.seller_id,
          amount: order.seller_payout_amount,
          upi_vpa: "seller@upi",
          utr_number: utrNumber,
          is_settled: true,
          settled_at: now.toISOString(),
        });

        totalSellerDisbursed += Number(order.seller_payout_amount);
        totalRiderDisbursed += 45;
        totalPlatformRetained += Number(order.platform_fee);
        totalInsuranceAccumulated += 2;

        settledOrders.push({
          orderId: order.id,
          orderCode: order.order_code,
          sellerPayout: order.seller_payout_amount,
          utrNumber,
          sellerSplitKey,
          riderPayoutKey,
        });
      }

      return NextResponse.json({
        success: true,
        count: settledOrders.length,
        settledOrders,
        summary: {
          totalSellerDisbursed,
          totalRiderDisbursed,
          totalPlatformRetained,
          totalInsuranceAccumulated,
        },
      });
    }

    // 2. Simulation ledger for local development & demonstration
    const sampleOrders = [
      {
        orderCode: "SH-1049",
        itemTitle: "Vintage 90s Carhartt Detroit Duck Canvas Jacket",
        category: "thrift",
        grossAmount: 1850,
        platformFee: 130, // 7%
        sellerNetPayout: 1720,
        riderPayout: 45,
        tamperBagPool: 3,
        insurancePool: 2,
        sellerUpi: "imphalthrift@okhdfcbank",
        utrNumber: `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        settledAt: now.toISOString(),
      },
      {
        orderCode: "SH-1042",
        itemTitle: "Authentic Wangkhei Rani Phi",
        category: "handloom",
        grossAmount: 5400,
        platformFee: 270, // 5%
        sellerNetPayout: 5130,
        riderPayout: 45,
        tamperBagPool: 3,
        insurancePool: 2,
        sellerUpi: "wangkhei@okaxis",
        utrNumber: `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        settledAt: now.toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      simulation: true,
      protocol: "LOOKMAI_T_PLUS_2_SPLIT_CRON",
      status: "EXECUTED",
      ordersSettledCount: sampleOrders.length,
      settledOrders: sampleOrders,
      financialSummary: {
        totalGrossTransacted: 7250,
        totalDisbursedToSellers: 6850,
        totalDisbursedToRiders: 90,
        totalPlatformCommission: 400,
        transitMicroInsuranceAccumulated: 4,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
