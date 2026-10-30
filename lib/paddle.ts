"use client";
import { initializePaddle, CheckoutEventNames, type Paddle, type PaddleEventData } from "@paddle/paddle-js";

let paddleInstance: Paddle | undefined;
let initPromise: Promise<Paddle | undefined> | null = null;
// Paddle.js only takes one eventCallback, set once at init — not per checkout
// open() call. Since this app only ever has one checkout overlay open at a
// time, a single "whoever is currently waiting" slot is enough.
let activeResolver: ((result: PaddleCheckoutResult) => void) | null = null;

export type PaddleCheckoutResult = "completed" | "closed";

function handlePaddleEvent(event: PaddleEventData) {
  if (!activeResolver) return;
  if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
    const resolve = activeResolver;
    activeResolver = null;
    resolve("completed");
  } else if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
    const resolve = activeResolver;
    activeResolver = null;
    resolve("closed");
  }
}

function getPaddle(): Promise<Paddle | undefined> {
  if (paddleInstance) return Promise.resolve(paddleInstance);
  if (!initPromise) {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token || token === "your_paddle_client_token") {
      return Promise.resolve(undefined);
    }
    initPromise = initializePaddle({
      token,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      eventCallback: handlePaddleEvent,
    }).then((instance) => {
      paddleInstance = instance;
      return instance;
    });
  }
  return initPromise;
}

/** Opens the Paddle checkout overlay and resolves once the shopper completes or closes it. */
export async function openPaddleCheckout(opts: {
  priceId: string;
  customData: Record<string, string>;
}): Promise<PaddleCheckoutResult> {
  const paddle = await getPaddle();
  if (!paddle) {
    throw new Error("Payments aren't configured yet — please try again later.");
  }

  return new Promise((resolve) => {
    activeResolver = resolve;
    paddle.Checkout.open({
      items: [{ priceId: opts.priceId, quantity: 1 }],
      customData: opts.customData,
      settings: { displayMode: "overlay" },
    });
  });
}
