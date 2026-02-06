import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Sidebar } from '@/components/layout/Sidebar'

const supabaseUrl = 'https://shdyscaybjzhblxqxfhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHlzY2F5Ymp6aGJseHF4ZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDA4MjIsImV4cCI6MjA4NTg3NjgyMn0.jb8S3-lFypRQzKyJFt8xycnmbX25_J3DHk6QqcfKhvs';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // Fetch user profile for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-osprey-sand">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto p-8 ml-64">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
