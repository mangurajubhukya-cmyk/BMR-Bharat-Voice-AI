# BMR AI CHATBOART Browser Access Guide

BMR AI CHATBOART is a **web application**. End users do not download or install a desktop app, browser extension, or mobile package. They open the published HTTPS address in a current desktop or mobile browser.

## For users

1. Open the public Companion URL in Chrome, Edge, Firefox, Safari, or another modern browser.
2. Select **Open your workspace** and sign in when you want an account-specific conversation history.
3. Create a chat, send a prompt, and return to it later from the history sidebar.
4. Voice dictation is optional. If the microphone button is available, grant the browser microphone permission when prompted. Typing always remains available. Assistant speech playback uses the browser’s built-in speech capability and has no download requirement.

## Publishing the web app

The hosted project is ready for publication through the project management interface. Create or select the latest checkpoint, then use **Publish** to obtain a public HTTPS URL. Users can visit that URL directly in a browser.

## Self-hosting (developer option)

Developers who choose to host their own copy can build and start the server with the following commands. These commands are only for the hosting environment; **end users still only need a browser**.

```bash
pnpm build
pnpm start
```

The AI chat backend, database connection, and Manus OAuth environment values must be configured on the hosting service before self-hosting.
