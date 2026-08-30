import { BanknotesIcon, PhoneIcon, TruckIcon } from "@heroicons/react/24/outline";

const TRUST_BADGES = [
  { Icon: BanknotesIcon, label: "Cash on Delivery" },
  { Icon: PhoneIcon, label: "We call to confirm your order" },
  { Icon: TruckIcon, label: "Nationwide delivery" },
];

export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 ${className}`}
    >
      {TRUST_BADGES.map(({ Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <Icon className="size-4 text-brand" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
