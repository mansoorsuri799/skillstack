import type { PlanId } from "@/lib/pricing";
import { getPlan, planPricePkr } from "@/lib/pricing";
import { createHash } from "crypto";

export function payfastConfigured() {
  return Boolean(
    process.env.PAYFAST_MERCHANT_ID &&
      process.env.PAYFAST_SECURED_KEY &&
      process.env.PAYFAST_MERCHANT_NAME &&
      process.env.PAYFAST_TOKEN_URL &&
      process.env.PAYFAST_CHECKOUT_URL,
  );
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

type TokenResponse = {
  token?: string;
  access_token?: string;
  code?: string | number;
  message?: string;
};

/** Fetch one-time PayFast access token */
export async function getPayfastAccessToken() {
  const merchantId = requireEnv("PAYFAST_MERCHANT_ID");
  const securedKey = requireEnv("PAYFAST_SECURED_KEY");
  const tokenUrl = requireEnv("PAYFAST_TOKEN_URL");

  const body = new URLSearchParams({
    merchant_id: merchantId,
    secured_key: securedKey,
    grant_type: process.env.PAYFAST_GRANT_TYPE?.trim() || "client_credentials",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = (await res.json()) as TokenResponse;
  const token = json.token || json.access_token;
  if (!res.ok || !token) {
    throw new Error(json.message || "PayFast access token failed");
  }
  return token;
}

/**
 * Build hosted checkout fields for auto-POST to PayFast.
 * Signature: md5(merchant_id:merchant_name:amount:order_id)
 */
export async function createPayfastHostedCheckout(options: {
  planId: PlanId;
  email: string;
  mobile: string;
  userId?: string;
  baseUrl: string;
}) {
  const plan = getPlan(options.planId);
  if (!plan) throw new Error("Invalid plan");

  const merchantId = requireEnv("PAYFAST_MERCHANT_ID");
  const merchantName = requireEnv("PAYFAST_MERCHANT_NAME");
  const checkoutUrl = requireEnv("PAYFAST_CHECKOUT_URL");
  const token = await getPayfastAccessToken();

  const amount = planPricePkr(plan).toFixed(2);
  const orderId = `SS-${options.planId}-${Date.now()}`;
  const signature = createHash("md5")
    .update(`${merchantId}:${merchantName}:${amount}:${orderId}`)
    .digest("hex");

  const successUrl = `${options.baseUrl}/pricing/success`;
  const failureUrl = `${options.baseUrl}/pricing/cancel`;
  const backendCallback = `signature=${signature}&order_id=${orderId}&plan_id=${options.planId}&user_id=${options.userId || ""}`;

  const fields: Record<string, string> = {
    MERCHANT_ID: merchantId,
    MERCHANT_NAME: merchantName,
    TOKEN: token,
    PROCCODE: "00",
    TXNAMT: amount,
    CUSTOMER_MOBILE_NO: options.mobile.replace(/\D/g, "").slice(-11),
    CUSTOMER_EMAIL_ADDRESS: options.email,
    SIGNATURE: signature,
    VERSION: "SKILLSTACK-NEXT-1.0",
    TXNDESC: `SkillStack · ${plan.name}`,
    SUCCESS_URL: encodeURIComponent(successUrl),
    FAILURE_URL: encodeURIComponent(failureUrl),
    BASKET_ID: orderId,
    ORDER_DATE: new Date().toISOString().slice(0, 19).replace("T", " "),
    CHECKOUT_URL: encodeURIComponent(backendCallback),
  };

  return {
    action: checkoutUrl,
    fields,
    orderId,
    amountPkr: amount,
  };
}
