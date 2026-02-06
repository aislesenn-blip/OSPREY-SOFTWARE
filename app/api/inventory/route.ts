import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://shdyscaybjzhblxqxfhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHlzY2F5Ymp6aGJseHF4ZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDA4MjIsImV4cCI6MjA4NTg3NjgyMn0.jb8S3-lFypRQzKyJFt8xycnmbX25_J3DHk6QqcfKhvs';

export async function GET(request: NextRequest) {
  const cookieStore = {
    getAll() { return request.cookies.getAll() },
    setAll(cookiesToSet: any[]) { },
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get User Org
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()

  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 400 })

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .eq('organization_id', profile.organization_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const cookieStore = {
    getAll() { return request.cookies.getAll() },
    setAll(cookiesToSet: any[]) { },
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 400 })

  const body = await request.json()
  const { name, sku, unit, cost_price, selling_price } = body

  const { data, error } = await supabase
    .from('items')
    .insert({
        organization_id: profile.organization_id,
        name,
        sku,
        unit,
        cost_price,
        selling_price
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
