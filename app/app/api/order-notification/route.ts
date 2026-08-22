import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const order = await request.json()

    const {
      customer_name,
      customer_phone,
      customer_email,
      total_price,
      tracking_id,
      order_id,
    } = order

    const { data, error } = await resend.emails.send({
      from: 'Data Marine <onboarding@resend.dev>',
      to: [process.env.ORDER_NOTIFICATION_EMAIL!],
      subject: `🛒 New Data Marine Order #${order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

          <h1 style="color: #1d4ed8;">
            🛒 New Data Marine Order
          </h1>

          <p>A new customer order has been placed.</p>

          <hr />

          <h2>Customer Details</h2>

          <p>
            <strong>Name:</strong> ${customer_name}
          </p>

          <p>
            <strong>Phone:</strong> ${customer_phone}
          </p>

          <p>
            <strong>Email:</strong> ${customer_email || 'Not provided'}
          </p>

          <h2>Order Details</h2>

          <p>
            <strong>Order ID:</strong> #${order_id}
          </p>

          <p>
            <strong>Tracking ID:</strong> ${tracking_id}
          </p>

          <p style="font-size: 22px;">
            <strong>Total:</strong>
            ₦${Number(total_price).toLocaleString()}
          </p>

          <hr />

          <p>
            Log in to the DATA MARINE Admin Dashboard to manage this order.
          </p>

        </div>
      `,
    })

    if (error) {
      console.error('Email error:', error)

      return Response.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      data,
    })

  } catch (error) {

    console.error(error)

    return Response.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
