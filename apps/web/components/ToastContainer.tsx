"use client";
import { useToasts, toast } from "../lib/toast";

export default function ToastContainer() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toastItem) => {
        const bgColor = {
          success: 'bg-success',
          error: 'bg-primary',
          warning: 'bg-yellow-600',
          info: 'bg-blue-600',
        }[toastItem.type];

        const icon = {
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️',
        }[toastItem.type];

        return (
          <div
            key={toastItem.id}
            className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}
          >
            <span className="text-lg">{icon}</span>
            <div className="flex-1">
              <p className="text-sm">{toastItem.message}</p>
            </div>
            <button
              onClick={() => toast.remove(toastItem.id)}
              className="text-white/70 hover:text-white transition ml-2"
            >
              ✕
            </button>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 