import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      customer_name,
      customer_phone,
      customer_email,
      total_price,
      tracking_id,
      order_id,
    } = body

    if (!customer_name || !customer_phone || !order_id) {
      return NextResponse.json(
        {
          error: 'Missing required order information.',
        },
        {
          status: 400,
        }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    const notificationEmail =
      process.env.ORDER_NOTIFICATION_EMAIL

    if (!apiKey) {
      console.error('RESEND_API_KEY is missing.')

      return NextResponse.json(
        {
          error: 'Email service is not configured.',
        },
        {
          status: 500,
        }
      )
    }

    if (!notificationEmail) {
      console.error(
        'ORDER_NOTIFICATION_EMAIL is missing.'
      )

      return NextResponse.json(
        {
          error: 'Notification email is not configured.',
        },
        {
          status: 500,
        }
      )
    }

    const response = await fetch(
      'https://api.resend.com/emails',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          from: 'DATA MARINE <orders@datamarine.ng>',

          to: [notificationEmail],

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
                <h1>DATA MARINE ⚓</h1>

                <p>
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
                  A new order has been placed on
                  the DATA MARINE website.
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
                    Total:
                    ₦${Number(
                      total_price
                    ).toLocaleString()}
                  </strong>
                </p>

              </div>

            </div>
          `,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error(
        'Resend API error:',
        result
      )

      return NextResponse.json(
        {
          error:
            result?.message ||
            'Resend failed to send email.',
        },
        {
          status: response.status,
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order notification sent.',
      id: result.id,
    })

  } catch (error) {

    console.error(
      'Order notification error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to send order notification.',
      },
      {
        status: 500,
      }
    )
  }
}
