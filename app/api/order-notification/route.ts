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

    if (!customer_name || !customer_phone || !order_id) {
      return Response.json(
        {
          error: 'Missing required order information',
        },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Data Marine <onboarding@resend.dev>',

      to: [
        process.env.ORDER_NOTIFICATION_EMAIL as string,
      ],

      subject: `🛒 New Data Marine Order #${order_id}`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 650px;
            margin: 0 auto;
            background: #f8fafc;
            padding: 30px;
          "
        >

          <div
            style="
              background: #0f172a;
              color: white;
              padding: 25px;
              border-radius: 12px;
            "
          >
            <h1 style="margin: 0;">
              DATA MARINE ⚓
            </h1>

            <p style="margin-bottom: 0;">
              New Order Notification
            </p>
          </div>

          <div
            style="
              background: white;
              padding: 25px;
              margin-top: 20px;
              border-radius: 12px;
            "
          >

            <h2>
              🛒 New Customer Order
            </h2>

            <p>
              A new order has been placed on the DATA MARINE website.
            </p>

            <hr />

            <h3>
              Customer Details
            </h3>

            <p>
              <strong>Name:</strong>
              ${customer_name}
            </p>

            <p>
              <strong>Phone:</strong>
              ${customer_phone}
            </p>

            <p>
              <strong>Email:</strong>
              ${customer_email || 'Not provided'}
            </p>

            <hr />

            <h3>
              Order Details
            </h3>

            <p>
              <strong>Order ID:</strong>
              #${order_id}
            </p>

            <p>
              <strong>Tracking ID:</strong>
              ${tracking_id || 'Not assigned'}
            </p>

            <p
              style="
                font-size: 24px;
                color: #1d4ed8;
              "
            >
              <strong>
                Total: ₦${Number(total_price).toLocaleString()}
              </strong>
            </p>

            <hr />

            <p>
              Log in to the DATA MARINE Admin Dashboard
              to manage this order.
            </p>

          </div>

        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)

      return Response.json(
        {
          error: error.message,
        },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Order notification email sent successfully.',
      data,
    })

  } catch (error) {

    console.error(
      'Order notification error:',
      error
    )

    return Response.json(
      {
        error: 'Failed to send order notification.',
      },
      { status: 500 }
    )
  }
}
