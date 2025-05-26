// src/app/obm-admin/dashboard/page.tsx

export default function AdminDashboard() {

  return (
    <div className="min-h-screen bg-black-muted text-white">
      <main className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-tan/20">
            <h3 className="text-xl font-serif text-tan mb-4">Products</h3>
            <p className="text-gray-300">Manage your product catalog</p>
            <button className="mt-4 bg-tan text-black px-4 py-2 rounded">
              Manage Products
            </button>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-tan/20">
            <h3 className="text-xl font-serif text-tan mb-4">Orders</h3>
            <p className="text-gray-300">View and manage orders</p>
            <button className="mt-4 bg-tan text-black px-4 py-2 rounded">
              View Orders
            </button>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-tan/20">
            <h3 className="text-xl font-serif text-tan mb-4">Users</h3>
            <p className="text-gray-300">Manage affiliates and users</p>
            <button className="mt-4 bg-tan text-black px-4 py-2 rounded">
              Manage Users
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}