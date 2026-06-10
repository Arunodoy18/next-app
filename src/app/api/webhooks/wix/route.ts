import { NextResponse } from 'next/server';

/**
 * WIX PAYMENTS / ECOM WEBHOOK ENDPOINT
 * 
 * Documentation Notes:
 * 1. Webhook Payload: Wix does NOT send standard JSON. They send a signed JWT (JSON Web Token).
 * 2. Checkout Email: The raw webhook payload typically only contains an entity ID (like an Order ID) 
 *    and the event status (e.g., order_paid). It DOES NOT contain the customer's checkout email.
 * 3. Solution: You must parse the JWT to get the Order ID, then make a secondary API request 
 *    back to Wix to fetch the full order details, which contains the `buyerInfo.email`.
 */

export async function POST(req: Request) {
  try {
    // 1. Read the raw JWT body sent by Wix
    const jwtPayload = await req.text();
    
    // 2. Verify and decode the JWT using your Wix Public Key
    // Example:
    // const wixPublicKey = process.env.WIX_PUBLIC_KEY;
    // const decoded = jwt.verify(jwtPayload, wixPublicKey);
    
    // The decoded structure will look roughly like this:
    /*
      {
        "instanceId": "...",
        "eventType": "wix.ecom.v1.order_paid",
        "data": {
          "entityId": "your-order-id-here", // This is the ID you need
          "eventTime": "2026-06-10T21:41:00Z"
        }
      }
    */
    
    // 3. Extract the Order ID
    // const orderId = JSON.parse(decoded.data).entityId;

    // 4. Fetch the full order from Wix API to capture the email
    /*
      // Assuming you've set up the @wix/sdk
      const wixClient = createClient({
        modules: { orders },
        auth: OAuthStrategy({ clientId: process.env.WIX_CLIENT_ID })
      });

      const fullOrder = await wixClient.orders.getOrder(orderId);
      
      // -> HERE IS WHERE YOU CAPTURE THE CHECKOUT EMAIL
      const checkoutEmail = fullOrder.buyerInfo?.email;
      const customerName = fullOrder.buyerInfo?.contactDetails?.firstName;
      
      console.log('Successfully captured checkout email:', checkoutEmail);
      
      // Execute your internal business logic (e.g., granting academy access)
    */

    return NextResponse.json({ 
      success: true, 
      message: "Webhook processed" 
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook Processing Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Webhook processing failed" 
    }, { status: 500 });
  }
}
