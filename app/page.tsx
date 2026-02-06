import { AuthForm } from '@/components/auth/AuthForm'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-osprey-sand via-osprey-sand to-stone-100">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="h-16 w-16 bg-osprey-navy rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-osprey-navy">OSPREY</h1>
          <p className="text-osprey-navy/60 tracking-widest text-xs uppercase">Enterprise Tourism Operating System</p>
        </div>

        <AuthForm />

        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <p className="text-xs text-osprey-navy/30">
            &copy; 2024 Osprey Systems. Secured by Supabase.
          </p>
        </div>
      </div>
    </main>
  )
}
