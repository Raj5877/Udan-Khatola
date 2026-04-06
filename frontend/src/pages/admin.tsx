import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Database, IndianRupee, ShieldAlert, BarChart3 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function Admin() {
  const navigate = useNavigate();
  const [revenueLog, setRevenueLog] = useState<any[]>([])
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [indexes, setIndexes] = useState<any[]>([])
  
  // Bulk update state
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")
  const [percentage, setPercentage] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.role !== "ADMIN") {
        navigate("/");
        return;
      }
    } catch {
      navigate("/login");
      return;
    }

    fetchRevenue()
    fetchAuditLog()
    fetchIndexes()
  }, [navigate])

  const fetchRevenue = () => {
    fetch('http://localhost:3000/api/analytics/revenue')
      .then(res => res.json())
      .then(data => setRevenueLog(data))
      .catch(err => console.error(err))
  }

  const fetchAuditLog = () => {
    fetch('http://localhost:3000/api/admin/audit-log')
      .then(res => res.json())
      .then(data => setAuditLog(data))
      .catch(err => console.error(err))
  }

  const fetchIndexes = () => {
    fetch('http://localhost:3000/api/admin/indexes')
      .then(res => res.json())
      .then(data => setIndexes(data))
      .catch(err => console.error(err))
  }

  const handleBulkUpdate = () => {
    fetch('http://localhost:3000/api/admin/bulk-price-update', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, destination, percentage: Number(percentage) })
    })
      .then(res => res.json())
      .then(data => {
        alert(`Updated ${data.summary.flights_updated} flights successfully!`)
        // Refresh revenue
        fetchRevenue()
      })
      .catch(err => console.error(err))
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-slate-200 selection:text-black pb-20">
      {/* Background Layer */}
      <img
        src="/hero_aviation_bg_1773304243639.png"
        alt="Backdrop"
        className="fixed inset-0 w-full h-full object-cover -z-20 scale-105"
      />
      {/* Lighter backdrop for dark text readability */}
      <div className="fixed inset-0 bg-white/70 -z-10 pointer-events-none" />

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10 w-full">
        <div className="mb-12 flex flex-col gap-6">
          <Link to="/">
            <Button variant="ghost" className="text-slate-600 hover:text-black hover:bg-slate-200 pl-2 gap-2 w-fit transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-slate-900">
              Admin Interface
            </h1>
            <p className="text-slate-600 mt-2 tracking-widest uppercase text-xs font-bold">Analytics & Database Management</p>
          </div>
        </div>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 bg-white/50 backdrop-blur-md border border-slate-200 p-1 shadow-sm rounded-xl">
            <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:text-black text-slate-600"><BarChart3 className="w-4 h-4 mr-2"/> Revenue</TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-white data-[state=active]:text-black text-slate-600"><ShieldAlert className="w-4 h-4 mr-2"/> Audit Log</TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-white data-[state=active]:text-black text-slate-600"><IndianRupee className="w-4 h-4 mr-2"/> Bulk Price</TabsTrigger>
            <TabsTrigger value="indexes" className="data-[state=active]:bg-white data-[state=active]:text-black text-slate-600"><Database className="w-4 h-4 mr-2"/> db Indexes</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Route Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-3">Route</th>
                        <th className="px-4 py-3">Total Bookings</th>
                        <th className="px-4 py-3">Seats Sold</th>
                        <th className="px-4 py-3 text-right">Avg Ticket Price</th>
                        <th className="px-4 py-3 text-right text-slate-900 font-bold">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueLog.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-4 font-bold text-slate-900">{row.source} → {row.destination}</td>
                          <td className="px-4 py-4">{row.total_bookings}</td>
                          <td className="px-4 py-4">{row.total_seats_sold}</td>
                          <td className="px-4 py-4 text-right">₹{row.avg_ticket_price}</td>
                          <td className="px-4 py-4 text-right font-black text-green-600">₹{row.total_revenue}</td>
                        </tr>
                      ))}
                      {revenueLog.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-4 text-center">No revenue data available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Trigger-Generated Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3">Seats Affected</th>
                        <th className="px-4 py-3">Status Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-4 whitespace-nowrap text-xs">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="px-4 py-4 font-bold text-blue-600">{log.action}</td>
                          <td className="px-4 py-4">{log.details}</td>
                          <td className="px-4 py-4 font-mono">{log.seats_affected || '-'}</td>
                          <td className="px-4 py-4 text-xs font-medium">
                            {log.old_status && <span className="text-red-500 line-through mr-1">{log.old_status}</span>}
                            {log.new_status && <span className="text-green-600">{log.new_status}</span>}
                          </td>
                        </tr>
                      ))}
                      {auditLog.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-4 text-center">No logs generated yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Update Tab */}
          <TabsContent value="bulk">
            <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Bulk Price Update</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-600 uppercase tracking-widest font-bold">Source</label>
                    <Input className="bg-white border-slate-200 text-slate-900" value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Delhi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-600 uppercase tracking-widest font-bold">Destination</label>
                    <Input className="bg-white border-slate-200 text-slate-900" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Mumbai" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-600 uppercase tracking-widest font-bold">Change Percentage (%)</label>
                    <Input className="bg-white border-slate-200 text-slate-900" type="number" value={percentage} onChange={e => setPercentage(e.target.value)} placeholder="e.g. 10 or -15" />
                  </div>
                </div>
                <Button onClick={handleBulkUpdate} className="bg-slate-900 hover:bg-slate-800 text-white font-bold tracking-wide border-0 shadow-lg">
                  Execute Bulk Update (Runs SP Cursor)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indexes Tab */}
          <TabsContent value="indexes">
            <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Active Database Indexes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Flights Table</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {indexes.filter(i => i.tableName === 'flights').map((i, idx) => (
                        <li key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-mono font-bold text-blue-600">{i.indexName}</span>
                          <span className="mx-2 text-slate-300">|</span>
                          Column: <span className="font-semibold text-slate-900">{i.columnName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Bookings Table</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {indexes.filter(i => i.tableName === 'bookings').map((i, idx) => (
                        <li key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-mono font-bold text-green-600">{i.indexName}</span>
                          <span className="mx-2 text-slate-300">|</span>
                          Column: <span className="font-semibold text-slate-900">{i.columnName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}
