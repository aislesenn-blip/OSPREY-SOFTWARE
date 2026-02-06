"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Users, Plus, Search } from "lucide-react";

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  department_node_id: string;
  contracts: {
    contract_type: string;
    salary_scales: {
      name: string;
      basic_pay: number;
    } | null;
  }[];
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    // Fetch employees with their active contract
    // We filter contracts where is_active is true.
    const { data } = await supabase
      .from("employees")
      .select(`
        *,
        contracts!inner (
          contract_type,
          salary_scales (
            name,
            basic_pay
          )
        )
      `)
      .eq("contracts.is_active", true); // This filters employees to only those with active contracts? No, it filters the join.
      // Actually, Supabase filtering on nested resource requires specific syntax.
      // If we use inner join (!inner), it filters the parent rows.
      // Let's keep it simple: fetch all contracts and filter in JS if needed, or use proper filter.
      // contracts(is_active.eq.true) syntax is valid PostgREST.

    // Let's retry with standard syntax
    const { data: rawData } = await supabase
        .from("employees")
        .select(`
            *,
            contracts (
                contract_type,
                is_active,
                salary_scales (name, basic_pay)
            )
        `);

    if (rawData) {
        // Filter contracts in JS to get only active one
        const processed = rawData.map((e: any) => ({
            ...e,
            contracts: e.contracts.filter((c: any) => c.is_active)
        }));
        setEmployees(processed);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Employees</h1>
          <p className="text-gray-500">Manage workforce and contracts</p>
        </div>
        <button className="bg-navy text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition">
          <Plus size={16} />
          <span>New Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading employees...</div>
        ) : employees.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No employees found.</div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3">ID Number</th>
                        <th className="px-6 py-3">Contract Type</th>
                        <th className="px-6 py-3">Salary Scale</th>
                        <th className="px-6 py-3">Basic Pay</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {employees.map((emp) => {
                        const contract = emp.contracts[0];
                        return (
                            <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                            {emp.first_name[0]}{emp.last_name[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-navy">{emp.first_name} {emp.last_name}</div>
                                            <div className="text-xs text-gray-500">{emp.employee_number}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{emp.employee_number}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{contract?.contract_type || '-'}</td>
                                <td className="px-6 py-4">
                                    {contract?.salary_scales ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {contract.salary_scales.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic text-sm">No Scale</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm font-mono">
                                    {contract?.salary_scales?.basic_pay ? contract.salary_scales.basic_pay.toLocaleString() : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-navy hover:text-blue-600 font-medium text-sm">Edit</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
