export const metadata = {
  title: "Subscription Success | More Minutes",
  description: "Your subscription is now active!",
};

export default function SubscribeSuccessPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <h1 className="text-3xl font-display text-success">🎉 Subscription Activated!</h1>
      <p className="text-accent max-w-sm">
        Thank you for upgrading. You now have unlimited simulations and 1&nbsp;GB Vault storage.
      </p>
      <a href="/" className="text-primary hover:underline">
        ← Back to Dashboard
      </a>
    </main>
  );
} 