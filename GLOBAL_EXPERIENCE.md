# Global Language and Billing Experience

## Language behavior

Zynvori AI matches the language and script of the user’s latest typed or transcribed message by default. There is no persistent profile language setting that can override a new conversation: a user may start in Telugu, Hindi, Marathi, Tamil, Kannada, Malayalam, Bengali, Gujarati, Punjabi, Urdu, or another supported language and receive the answer in that same language unless they explicitly request a translation.

When a modern browser supports microphone recording, Zynvori records the message, sends it for server-side transcription with spoken-language detection, and places the transcription into the composer before the user sends it. The browser-native dictation path remains a fallback when recording or the service is unavailable. The Web Speech API separates speech recognition from speech synthesis, and browser/device voice availability still varies.[1] [2] [3]

> **User experience rule:** If microphone permission is denied, server transcription is temporarily unavailable, or a matching device voice is absent, Zynvori keeps typed chat available and explains the fallback. It does not promise that every browser or device provides every language voice.

## Test multilingual behavior

Sign in and type a normal message in **తెలుగు**, **हिन्दी**, **मराठी**, or another language. Zynvori should answer in the language and script of that message. Use the microphone to record a short spoken message when available; the composer should first show a detected transcription, then send it normally. Use **Play voice** on an assistant response to request device-provided speech. Voice quality and availability vary by browser, operating system, and installed voices.

## Subscription management

The bottom account area shows the current Zynvori plan. Free users see an upgrade action. After a Stripe Checkout completion webhook records the minimal Stripe customer ID, paid users see **Manage or cancel plan**. This opens a short-lived Stripe-hosted billing portal in the current tab. Stripe keeps payment methods, invoices, subscription state, and cancellation workflows as the billing source of truth; Zynvori stores only the Stripe customer reference needed to create a portal session.

Before launch, configure the Stripe customer portal separately in both sandbox and live modes. Enable subscription cancellation, payment-method updates, invoice history, and any permitted upgrade or downgrade product catalog in **Stripe Dashboard → Settings → Billing → Customer portal**. Stripe documents that portal sessions are short-lived and should be created on demand for an authenticated customer.[4] It also supports configuring customer cancellation behavior in the portal.[5]

## References

[1] [MDN, Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

[2] [MDN, SpeechRecognition: lang property](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang)

[3] [MDN, SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

[4] [Stripe, Integrate the customer portal with the API](https://docs.stripe.com/customer-management/integrate-customer-portal)

[5] [Stripe, Add a cancellation page to the customer portal](https://docs.stripe.com/customer-management/cancellation-page)
