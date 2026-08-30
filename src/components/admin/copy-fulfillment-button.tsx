"use client";

import { useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";

export function CopyFulfillmentButton({
  sourceUrl,
  shippingAddress,
  phone,
  quantity,
  productName,
}: {
  sourceUrl: string;
  shippingAddress: string;
  phone: string;
  quantity: number;
  productName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [
      `Order: ${quantity}x ${productName}`,
      `Source: ${sourceUrl}`,
      `Ship to: ${shippingAddress}`,
      `Phone: ${phone}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 rounded border border-neutral-300 px-2 py-1 text-xs font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
    >
      {copied ? (
        <>
          <CheckIcon className="size-3.5" /> Copied
        </>
      ) : (
        "Copy fulfillment info"
      )}
    </button>
  );
}
