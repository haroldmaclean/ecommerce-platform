const Stripe = require('stripe')

const { handlePaymentSuccess } = require('../services/paymentService')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message)

    return res.status(400).json({
      success: false,
      message: 'Invalid webhook signature',
    })
  }

  console.log('STRIPE WEBHOOK EVENT:', event.type)

  if (event.type === 'payment_intent.succeeded') {
    await handlePaymentSuccess(event.data.object)
  }

  res.status(200).json({
    received: true,
  })
}

module.exports = {
  handleStripeWebhook,
}
