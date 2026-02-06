export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-navy mb-2">Active Nodes</h3>
        <p className="text-3xl font-bold text-forest">12</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-navy mb-2">Team Members</h3>
        <p className="text-3xl font-bold text-forest">24</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-navy mb-2">System Status</h3>
        <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-navy font-medium">Operational</span>
        </div>
      </div>
    </div>
  );
}
