import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-osprey-sand text-osprey-navy">
      <h1 className="text-9xl font-light">404</h1>
      <h2 className="text-2xl font-light mt-4">Page Not Found</h2>
      <p className="text-osprey-navy/60 mt-2 mb-8">The coordinate you are looking for does not exist.</p>
      <Link href="/dashboard">
        <Button>Return to Base</Button>
      </Link>
    </div>
  )
}
