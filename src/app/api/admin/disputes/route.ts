import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("disputes")
      .select("*, orders(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json({ success: true, disputes: data });
    }
  }

  // Realistic mock dispute for arbitration review
  const mockDisputes = [
    {
      id: "disp-101",
      orderCode: "SH-1048",
      buyerName: "Linthoingambi S.",
      buyerPhone: "9862222222",
      sellerHandle: "vintagey2k",
      sellerName: "Y2K Aesthetic Lab",
      itemTitle: "Japanese Evisu Raw Indigo Selvedge Denim",
      category: "thrift",
      itemPrice: 2400,
      reason: "Waist measures 28 inches instead of listed 32 inches (Pit-to-pit sizing mismatch).",
      tamperSealBroken: false, // Seal was verified INTACT before unboxing video started
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      status: "OPEN",
      claimedAt: "3 hours ago",
    },
  ];

  return NextResponse.json({
    success: true,
    simulation: true,
    disputes: mockDisputes,
    transitInsurancePoolBalance: 482, // Accumulated at ₹2/order
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      disputeId,
      decision, // "APPROVE_REFUND_BUYER" | "REJECT_CLAIM_RELEASE_SELLER" | "PAY_FROM_INSURANCE_POOL"
      adminNotes = "Lookmai Arbitration Review: Unboxing video inspected and verified.",
    } = body;

    const now = new Date();

    if (isSupabaseConfigured()) {
      let disputeStatus = "UNDER_REVIEW";
      if (decision === "APPROVE_REFUND_BUYER") {
        disputeStatus = "REFUNDED_BUYER";
      } else if (decision === "REJECT_CLAIM_RELEASE_SELLER") {
        disputeStatus = "RELEASED_SELLER";
      }

      await supabase
        .from("disputes")
        .update({
          status: disputeStatus,
          admin_resolution_notes: adminNotes,
          resolved_at: now.toISOString(),
        })
        .eq("id", disputeId);

      return NextResponse.json({
        success: true,
        disputeId,
        decision,
        status: disputeStatus,
      });
    }

    return NextResponse.json({
      success: true,
      simulation: true,
      disputeId,
      decision,
      status:
        decision === "APPROVE_REFUND_BUYER"
          ? "REFUNDED_BUYER"
          : decision === "REJECT_CLAIM_RELEASE_SELLER"
          ? "RELEASED_SELLER"
          : "INSURANCE_SETTLED",
      message:
        decision === "APPROVE_REFUND_BUYER"
          ? "100% Refund Approved. Seller payout cancelled. Measurement strike logged."
          : decision === "REJECT_CLAIM_RELEASE_SELLER"
          ? "Claim Rejected. Tamper seal was broken prior to recording. Seller payout released."
          : "Covered by ₹2 Transit Micro-Insurance Reserve pool. Both parties reimbursed.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
