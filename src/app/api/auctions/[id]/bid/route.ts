import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      proposedAmount,
      bidderId = "user-local-guest",
      bidderMasked = "You (Verified)",
      clientDisplayedPrice,
      isWhatsAppVerified = false,
      currentAuctionEndTime,
    } = body;

    const now = Date.now();

    // 1. Zero-Cost Anti-Sybil Verification Check (Meta Cloud API Inbound Webhook)
    if (!isWhatsAppVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "WHATSAPP_VERIFICATION_REQUIRED",
          message:
            "Zero-Troll Bidding Gate: Tap 'Verify via WhatsApp' to activate bidding. Free inbound verification, 0 SMS toll fraud.",
        },
        { status: 403 }
      );
    }

    // 2. Validate Explicit Target Price
    if (!proposedAmount || typeof proposedAmount !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_BID_AMOUNT",
          message: "Proposed target price is missing or invalid.",
        },
        { status: 400 }
      );
    }

    // 3. High-Water Mark Anti-Sniping Soft Close Logic
    let newEndTime = currentAuctionEndTime;
    let softCloseApplied = false;

    if (currentAuctionEndTime) {
      const endMs = new Date(currentAuctionEndTime).getTime();
      const diffMs = endMs - now;

      // If bid lands within final 60 seconds, reset clock to exactly now + 120s
      if (diffMs > 0 && diffMs < 60 * 1000) {
        newEndTime = new Date(now + 120 * 1000).toISOString();
        softCloseApplied = true;
      }
    }

    // 4. Supabase RPC place_bid if connected
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.rpc("place_bid", {
        p_auction_id: params.id,
        p_bidder_id: bidderId,
        p_proposed_amount: proposedAmount,
      });

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }

      // Broadcast to multiplexed Realtime channel "sunday_drop_stream"
      try {
        await supabase.channel("sunday_drop_stream").send({
          type: "broadcast",
          event: "new_bid",
          payload: {
            auctionId: params.id,
            amount: proposedAmount,
            bidderMasked,
            endTime: newEndTime,
            softCloseApplied,
            serverEpochMs: now,
          },
        });
      } catch (broadcastErr) {
        // Broadcast non-fatal
      }

      return NextResponse.json(data);
    }

    // 5. Atomic fallback simulation for local and test previews
    return NextResponse.json({
      success: true,
      bidId: `bid-${now}`,
      currentBid: proposedAmount,
      endTime: newEndTime,
      softCloseApplied,
      serverEpochMs: now,
      message: softCloseApplied
        ? "Bid Accepted! Anti-sniping soft-close triggered: clock extended to 2:00 mins."
        : "Bid Accepted!",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: err.message || "Failed to process bid.",
      },
      { status: 500 }
    );
  }
}
