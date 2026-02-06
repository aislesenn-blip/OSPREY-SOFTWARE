import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy text-sand">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="mb-8">Could not find requested resource</p>
      <Link href="/" className="px-4 py-2 bg-gold text-navy rounded hover:bg-opacity-90 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
