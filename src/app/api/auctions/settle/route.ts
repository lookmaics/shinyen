import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { auctionId, simulateExpired = false } = body;
    const now = new Date();

    // 1. If live Supabase connection is active, query ended auctions
    if (isSupabaseConfigured()) {
      let query = supabase
        .from("auctions")
        .select("*, bids(id, bidder_id, amount, created_at)")
        .eq("is_settled", false)
        .lt("end_time", now.toISOString());

      if (auctionId) {
        query = query.eq("id", auctionId);
      }

      const { data: endedAuctions, error } = await query;
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      const settlementResults = [];

      for (const auction of endedAuctions || []) {
        const sortedBids = (auction.bids || []).sort((a: any, b: any) => b.amount - a.amount);
        const winner = sortedBids[0];
        const runnerUp = sortedBids[1];

        if (!winner) {
          // No bids placed
          await supabase.from("auctions").update({ is_settled: true }).eq("id", auction.id);
          settlementResults.push({ auctionId: auction.id, outcome: "NO_BIDS_EXPIRED" });
          continue;
        }

        // Check if existing winner offer expired
        const { data: existingOffer } = await supabase
          .from("auction_offers")
          .select("*")
          .eq("auction_id", auction.id)
          .eq("status", "PENDING")
          .single();

        if (existingOffer && (new Date(existingOffer.expires_at) < now || simulateExpired)) {
          // Winner defaulted on 3-hour checkout window
          await supabase
            .from("auction_offers")
            .update({ status: "EXPIRED" })
            .eq("id", existingOffer.id);

          // Record strike on defaulting winner
          await supabase.rpc("increment_strikes", { p_user_id: winner.bidder_id });

          // ANTI-COLLUSION ROLL-DOWN PROTOCOL
          if (runnerUp) {
            const gapPercentage = ((winner.amount - runnerUp.amount) / winner.amount) * 100;

            if (gapPercentage <= 25) {
              // Within 25% threshold: Clean auto roll-down to 2nd bidder
              await supabase.from("auction_offers").insert({
                auction_id: auction.id,
                bidder_id: runnerUp.bidder_id,
                rank: 2,
                offer_amount: runnerUp.amount,
                expires_at: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
                status: "PENDING",
              });

              settlementResults.push({
                auctionId: auction.id,
                outcome: "ROLLED_DOWN_TO_RUNNER_UP",
                runnerUpBid: runnerUp.amount,
                gapPercentage: gapPercentage.toFixed(1) + "%",
              });
            } else {
              // Blowout gap > 25%: Flag for seller discretion to prevent shill manipulation
              settlementResults.push({
                auctionId: auction.id,
                outcome: "SELLER_DECISION_REQUIRED",
                gapPercentage: gapPercentage.toFixed(1) + "%",
                options: ["OFFER_TO_2ND", "RE_DROP_SUNDAY", "CONVERT_TO_BUY_NOW"],
              });
            }
          } else {
            settlementResults.push({
              auctionId: auction.id,
              outcome: "WINNER_DEFAULTED_NO_RUNNER_UP",
            });
          }
        } else if (!existingOffer) {
          // Freshly ended: create initial 3-hour offer for 1st place winner
          await supabase.from("auction_offers").insert({
            auction_id: auction.id,
            bidder_id: winner.bidder_id,
            rank: 1,
            offer_amount: winner.amount,
            expires_at: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
            status: "PENDING",
          });

          settlementResults.push({
            auctionId: auction.id,
            outcome: "WINNER_OFFER_CREATED_3HR_WINDOW",
            winnerAmount: winner.amount,
          });
        }
      }

      return NextResponse.json({ success: true, settlements: settlementResults });
    }

    // 2. Simulation response for local test preview
    const sampleWinnerAmount = 1850;
    const sampleRunnerUpAmount = 1800; // 2.7% gap -> triggers clean auto-roll-down
    const gap = (((sampleWinnerAmount - sampleRunnerUpAmount) / sampleWinnerAmount) * 100).toFixed(1);

    return NextResponse.json({
      success: true,
      simulation: true,
      protocol: "LOOKMAI_3_HOUR_SETTLEMENT_WORKER",
      status: "CHECKOUT_WINDOW_ACTIVE",
      details: {
        winnerCheckoutWindowHours: 3,
        antiCollusionThreshold: "25%",
        sampleGap: `${gap}%`,
        rollDownEligible: true,
        actionsOnDefault: [
          "Record strike on non-paying bidder",
          "Auto-roll down to 2nd bidder if within 25% gap",
          "Seller 1-tap decision if gap > 25%",
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
