'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Plus, Download, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { InventoryItem } from '@/types'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name')

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-osprey-navy">Inventory Engine</h2>
          <p className="text-osprey-navy/60 mt-2">Manage stock, valuation, and transfers.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/inventory/receive">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Receive Stock
            </Button>
          </Link>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Global Stock</CardTitle>
            <div className="w-72">
               <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-osprey-navy/50" />
                <Input
                  placeholder="Search SKU or Name..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
               </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-osprey-navy/50">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-osprey-navy/50">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right font-mono">
                      {item.current_stock}
                    </TableCell>
                    <TableCell className="text-xs text-osprey-navy/60">{item.unit}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(item.cost_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      {formatCurrency(item.current_stock * item.cost_price)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.current_stock <= item.minimum_stock ? 'pending' : 'active'} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
