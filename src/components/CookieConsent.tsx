import { X } from "lucide-react";
import { getConsented } from "../lib/templateStore";

interface CookieConsentProps {
  onAccept: () => void;
  onDismiss: () => void;
}

export default function CookieConsent({ onAccept, onDismiss }: CookieConsentProps) {
  if (getConsented()) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl">
      <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--text)]">
            We use localStorage
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            This app stores your template designs and theme preference locally in
            your browser. No data is sent to any server. By continuing, you
            consent to this local storage usage.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="primary-button text-sm"
            onClick={onAccept}>
            Accept
          </button>
          <button
            className="secondary-button text-sm"
            onClick={onDismiss}>
            <X size={14} />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
