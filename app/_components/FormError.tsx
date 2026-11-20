export default function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-sm text-sm"
    >
      {message}
    </p>
  );
}
