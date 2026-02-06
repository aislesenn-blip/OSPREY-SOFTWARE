'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const supabaseUrl = 'https://shdyscaybjzhblxqxfhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHlzY2F5Ymp6aGJseHF4ZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDA4MjIsImV4cCI6MjA4NTg3NjgyMn0.jb8S3-lFypRQzKyJFt8xycnmbX25_J3DHk6QqcfKhvs';

function createClient() {
  const cookieStore = cookies()

  return createServerClient(
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
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export async function updateOrganizationAction(formData: FormData) {
  const industry = formData.get('industry') as string
  const companyName = formData.get('companyName') as string

  if (!industry) return { error: 'Industry is required' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Get Profile to find Org ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) return { error: 'No organization found' }

  // Update Organization
  const { error } = await supabase
    .from('organizations')
    .update({
      industry_type: industry,
      name: companyName || undefined, // Only update if provided
      config: {
        labels: getIndustryLabels(industry)
      }
    })
    .eq('id', profile.organization_id)

  if (error) return { error: error.message }

  // Create Default Location (Headquarters)
  // Check if one exists first? Or just add.
  // The trigger `handle_new_user` already created 'Main Store'.
  // We might want to rename it or add a new one based on industry.
  // For simplicity, let's just ensure a "HQ" type location exists or update the existing one.

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .eq('type', 'hq') // Assuming we want an HQ

  if (!locations || locations.length === 0) {
     await supabase.from('locations').insert({
        organization_id: profile.organization_id,
        name: companyName ? `${companyName} HQ` : 'Headquarters',
        type: 'hq'
     })
  }

  redirect('/dashboard')
}

export async function createItemAction(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'No profile' }

    const name = formData.get('name') as string
    const sku = formData.get('sku') as string
    const unit = formData.get('unit') as string
    const costPrice = formData.get('costPrice')
    const sellingPrice = formData.get('sellingPrice')

    const { error } = await supabase.from('items').insert({
        organization_id: profile.organization_id,
        name,
        sku,
        unit,
        cost_price: Number(costPrice),
        selling_price: Number(sellingPrice)
    })

    if (error) return { error: error.message }
    return { success: true }
}

export async function createEmployeeAction(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'No profile' }

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const jobTitle = formData.get('jobTitle') as string
    const basicSalary = formData.get('basicSalary')
    const locationId = formData.get('locationId') as string

    const { error } = await supabase.from('employees').insert({
        organization_id: profile.organization_id,
        first_name: firstName,
        last_name: lastName,
        email,
        job_title: jobTitle,
        basic_salary: Number(basicSalary),
        department_id: locationId || null
    })

    if (error) return { error: error.message }
    return { success: true }
}

export async function transferStockAction(formData: FormData) {
    // Logic for transfer
    // This is complex: needs transaction or multiple inserts (transaction out + transaction in)
    // For now, simpler: Just insert a 'transfer' record or 2 records.
    // The schema has `inventory_transactions`.

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('id, organization_id').eq('id', user.id).single()

    const itemId = formData.get('itemId') as string
    const fromLocation = formData.get('fromLocation') as string
    const toLocation = formData.get('toLocation') as string
    const quantity = Number(formData.get('quantity'))

    if (!itemId || !fromLocation || !toLocation || !quantity) return { error: 'Missing fields' }

    // 1. Out from Source
    const { error: err1 } = await supabase.from('inventory_transactions').insert({
        organization_id: profile?.organization_id,
        item_id: itemId,
        location_id: fromLocation,
        type: 'transfer_out',
        quantity: -quantity, // Negative for OUT
        created_by: profile?.id
    })

    if (err1) return { error: err1.message }

    // 2. In to Target
    const { error: err2 } = await supabase.from('inventory_transactions').insert({
        organization_id: profile?.organization_id,
        item_id: itemId,
        location_id: toLocation,
        type: 'transfer_in',
        quantity: quantity, // Positive for IN
        created_by: profile?.id
    })

    if (err2) return { error: err2.message }

    return { success: true }
}


function getIndustryLabels(industry: string) {
  switch (industry) {
    case 'Construction': return { location: 'Site', inventory: 'Material' }
    case 'Retail': return { location: 'Branch', inventory: 'Stock' }
    case 'Logistics': return { location: 'Hub', inventory: 'Package' }
    case 'Tourism': return { location: 'Camp', inventory: 'Item' }
    default: return { location: 'Location', inventory: 'Item' }
  }
}
