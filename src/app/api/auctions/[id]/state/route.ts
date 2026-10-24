import { NextRequest, NextResponse } from "next/server";
import { mockProducts } from "@/data/mockProducts";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auctionId = params.id;
  const now = Date.now();

  // If Supabase is connected to live credentials, fetch from database
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select("*, bids(amount, bidder_id, created_at)")
        .eq("id", auctionId)
        .single();

      if (!error && data) {
        return NextResponse.json(
          {
            id: data.id,
            currentBid: data.current_bid,
            bidCount: data.bid_count,
            highestBidderMasked: data.highest_bidder_id ? "Bidder Verified" : null,
            endTime: data.end_time,
            isSettled: data.is_settled,
            serverEpochMs: now,
            recentBids: data.bids || [],
          },
          {
            headers: {
              "Cache-Control": "public, s-maxage=1, stale-while-revalidate=2",
            },
          }
        );
      }
    } catch (err) {
      // Fallback to local mock below
    }
  }

  // Graceful fallback to mock store for local development and preview
  const product = mockProducts.find((p) => p.id === auctionId);

  const fallbackData = {
    id: auctionId,
    currentBid: product?.currentBid || product?.price || 1850,
    bidCount: product?.bidCount || 9,
    highestBidderMasked: "B***m (Yaiskul)",
    endTime: product?.endTime || new Date(now + 1000 * 60 * 38).toISOString(),
    isSettled: product?.isSoldOut || false,
    serverEpochMs: now,
    recentBids: [
      {
        id: "bid-1",
        bidderMasked: "B***m (Yaiskul)",
        amount: product?.currentBid || 1850,
        timestamp: "Just now",
      },
      {
        id: "bid-2",
        bidderMasked: "T***a (Khurai)",
        amount: Math.max((product?.currentBid || 1850) - 50, 100),
        timestamp: "2 mins ago",
      },
    ],
  };

  return NextResponse.json(fallbackData, {
    headers: {
      "Cache-Control": "public, s-maxage=1, stale-while-revalidate=2",
    },
  });
}
