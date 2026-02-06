'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { InventoryItem } from '@/types'

export default function ReceiveStockPage() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [lines, setLines] = useState([{ itemId: '', quantity: 0, cost: 0 }])

  useEffect(() => {
    async function fetchData() {
      const { data: itemsData } = await supabase.from('inventory_items').select('*').order('name')
      const { data: whData } = await supabase.from('warehouses').select('*').order('name')

      if (itemsData) setItems(itemsData)
      if (whData) setWarehouses(whData)
    }
    fetchData()
  }, [])

  const addLine = () => {
    setLines([...lines, { itemId: '', quantity: 0, cost: 0 }])
  }

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (!selectedWarehouse) throw new Error('Select a warehouse')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get org id from profile (in a real app, use context or hook)
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
      if (!profile) throw new Error('No profile')

      const movements = lines.map(line => ({
        organization_id: profile.organization_id,
        item_id: line.itemId,
        warehouse_id: selectedWarehouse,
        type: 'in',
        quantity: line.quantity,
        unit_cost: line.cost,
        created_by: user.id
      }))

      const { error } = await supabase.from('stock_movements').insert(movements)
      if (error) throw error

      router.push('/dashboard/inventory')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/inventory">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-light text-osprey-navy">Receive Stock</h2>
          <p className="text-osprey-navy/60">Record incoming inventory items.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Details</CardTitle>
          <CardDescription>Select destination warehouse and add items.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-1/2">
            <label className="text-sm font-medium mb-1 block">Destination Warehouse</label>
            <Select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              <option value="">Select Warehouse...</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name} ({wh.type})</option>
              ))}
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={line.itemId}
                      onChange={(e) => updateLine(index, 'itemId', e.target.value)}
                    >
                      <option value="">Select Item...</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.cost}
                      onChange={(e) => updateLine(index, 'cost', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    {lines.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeLine(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={addLine}>
              <Plus className="h-4 w-4 mr-2" />
              Add Line
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Receipt'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
