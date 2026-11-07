# Zynvori AI Payments Setup

> **Current project state:** the Stripe integration is an **unclaimed test sandbox**, so it is not connected to a payout bank account and cannot send real money. Test card payments are only simulated. A real launch requires the business owner to complete Stripe live-account verification and bank-payout onboarding in Stripe Dashboard.

## What users can buy

| Plan | Price | Capacity shown in Zynvori | Checkout type |
|---|---:|---|---|
| **Free Trial** | $0 | 10 standard replies each day | No card or Stripe checkout |
| **Zynvori Credit** | $5/month | 300 Zynvori credits each month | Stripe monthly subscription |
| **Zynvori Ultra** | $18/month | 1,500 Zynvori credits each month | Stripe monthly subscription |

Paid plans are positioned as capacity for guided Client Win, Content-to-Lead, and Customer Reply workflows; reusable templates; and browser-based multilingual input and voice support. They are not sold as a promise of earnings, investing performance, client acquisition, or business results.

## Checkout behavior

An authenticated user selects a tier on the in-app **Plans** screen, reviews it again on an in-app confirmation screen, and then continues to Stripe Checkout in the **same browser tab**. The application creates the Checkout Session on the server and passes only the hosted Checkout URL to the browser. The browser never receives Stripe secret keys, webhook secrets, or card data.

The checkout request carries the authenticated user’s ID and basic account metadata so a later fulfillment workflow can be associated with the right user. Stripe remains the source of truth for payment, invoice, and subscription status; the application does not store card numbers, card details, raw webhook bodies, or Stripe credentials.

## Test the sandbox

1. Open **Settings → Payment** and claim the project’s Stripe test sandbox.
2. In Zynvori AI, sign in, open **Compare Zynvori plans**, and choose either **Zynvori Credit** or **Zynvori Ultra**.
3. Confirm the selected plan inside Zynvori. Stripe Checkout should replace the current tab. Use the Stripe test card `4242 4242 4242 4242` with any valid future expiry date, CVC, and postal code.
4. Complete the test checkout. Stripe redirects back to Zynvori with `?checkout=success`.
5. In the Stripe Dashboard, confirm the Checkout Session and subscription. The webhook endpoint is `/api/stripe/webhook`.

## Enable subscription management

In **Stripe Dashboard → Settings → Billing → Customer portal**, configure the sandbox portal before testing Zynvori Credit and Zynvori Ultra management. Enable cancellation, billing history, payment method updates, and plan switching where appropriate. After Stripe sends a real `checkout.session.completed` webhook, Zynvori stores only the Stripe customer ID. The profile’s **Manage or cancel plan** button then creates a short-lived, authenticated portal session for that customer.

## Before accepting real payments

| Required owner action | Why it matters |
|---|---|
| Claim the Stripe sandbox | Enables test-card verification only; no real customer funds or payouts move. |
| Activate and verify the Stripe live account | Stripe uses this to validate the business before live payment processing. |
| Add the owner’s payout bank account in Stripe | This is where cleared live funds are paid; Zynvori never stores bank details. |
| Create confirmed live Zynvori Credit and Zynvori Ultra prices | Ensures the $5 and $18 amounts, currency, renewal, and tax behavior are correct. |
| Configure refunds, cancellation, Customer Portal, taxes, and webhooks | Makes the customer journey and operational rules clear before live sales. |
| Replace sandbox keys with live keys through the project payment settings | Switches server-side checkout from test to real Stripe processing. |

Confirm the final price, currency, tax treatment, refund terms, cancellation terms, product switching rules, and exactly how Zynvori credits are metered before accepting live payments. Test the entire sequence in sandbox first; do not treat the current capacity limits as final commercial terms.
