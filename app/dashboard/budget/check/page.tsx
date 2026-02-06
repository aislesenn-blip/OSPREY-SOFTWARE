"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { CheckCircle, XCircle, Search } from "lucide-react";

type BudgetLine = {
  budget_name: string;
  department: string;
  expense_head: string;
  remaining: number;
};

export default function BudgetCheckPage() {
  const [lines, setLines] = useState<BudgetLine[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [selectedLine, setSelectedLine] = useState<BudgetLine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLines();
  }, []);

  async function fetchLines() {
    setLoading(true);
    const { data } = await supabase.from("view_budget_performance").select("*");
    if (data) setLines(data);
    setLoading(false);
  }

  const isAffordable = selectedLine ? selectedLine.remaining >= amount : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Vote Book Simulator</h1>
        <p className="text-gray-500">Check if a request would be approved or blocked</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">1. Select Budget Line</h3>

            {loading ? (
                <div>Loading lines...</div>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {lines.map((line, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedLine(line)}
                            className={`p-3 rounded border cursor-pointer transition-colors ${
                                selectedLine === line ? 'bg-navy text-white border-navy' : 'hover:bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="font-medium text-sm">{line.department} - {line.expense_head}</div>
                            <div className={`text-xs ${selectedLine === line ? 'text-gray-300' : 'text-gray-500'}`}>
                                Budget: {line.budget_name} | Remaining: {line.remaining.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">2. Enter Amount</h3>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Request Amount</label>
                    <input
                        type="number"
                        className="w-full border p-3 rounded text-lg font-mono"
                        value={amount}
                        onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                    />
                </div>
            </div>

            {selectedLine && amount > 0 && (
                <div className={`p-6 rounded-lg shadow-sm border text-center transition-all transform duration-500 ${
                    isAffordable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                    <div className="flex justify-center mb-4">
                        {isAffordable ? (
                            <CheckCircle className="text-green-600 w-16 h-16" />
                        ) : (
                            <XCircle className="text-red-600 w-16 h-16" />
                        )}
                    </div>
                    <h2 className={`text-2xl font-bold ${isAffordable ? 'text-green-800' : 'text-red-800'}`}>
                        {isAffordable ? 'APPROVED' : 'BLOCKED'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {isAffordable
                            ? `Funds available. Remaining after: ${(selectedLine.remaining - amount).toLocaleString()}`
                            : `Insufficient funds. Deficit: ${(amount - selectedLine.remaining).toLocaleString()}`
                        }
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
