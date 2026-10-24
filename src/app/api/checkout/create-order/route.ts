import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      sellerId = "seller-01",
      buyerId = "buyer-local-guest",
      buyerName = "Bembem Devi",
      phone = "9862000000",
      district = "Imphal West",
      leikai = "Yaiskul Leirak",
      landmark = "Near Achom Leikai Club",
      gateNotes = "",
      lat,
      lng,
      deliveryMethod = "std_doorstep",
      deliveryFee = 50,
      itemAmount,
      platformFee = 130,
      upiApp = "PhonePe",
    } = body;

    // 1. Generate in-app 4-digit Delivery OTP (Swiggy/Uber zero-SMS model)
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
    const orderCode = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
    const sellerPayoutAmount = itemAmount - platformFee;

    // 2. Persist in Supabase if configured
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("orders").insert({
        order_code: orderCode,
        product_id: productId,
        seller_id: sellerId,
        buyer_id: buyerId,
        item_amount: itemAmount,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        seller_payout_amount: sellerPayoutAmount,
        delivery_otp: deliveryOtp,
        delivery_district: district,
        delivery_leikai: leikai,
        delivery_landmark: landmark,
        delivery_lat: lat,
        delivery_lng: lng,
        status: "PAID_ESCROW_LOCKED",
      }).select().single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          order: data,
          orderCode: data.order_code,
          deliveryOtp: data.delivery_otp,
        });
      }
    }

    // 3. Fallback response for local preview
    return NextResponse.json({
      success: true,
      simulation: true,
      orderCode,
      deliveryOtp, // In-app 4-digit OTP shown directly on screen
      totalPaid: itemAmount + deliveryFee,
      sellerPayoutAmount,
      deliveryDistrict: district,
      deliveryLeikai: leikai,
      status: "PAID_ESCROW_LOCKED",
      escrowGuarantee: "48-Hour Inspection Window begins upon rider OTP delivery verification",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order." },
      { status: 500 }
    );
  }
}
