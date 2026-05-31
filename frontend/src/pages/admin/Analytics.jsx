import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'

export default function Analytics() {
  const [deptId, setDeptId] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const { data: deptAttendance } = useQuery({
    queryKey: ['deptAttendance', deptId, month, year],
    queryFn: () => api.get(`/analytics/department-attendance?departmentId=${deptId}&month=${month}&year=${year}`).then(res => res.data),
    enabled: !!deptId,
  })

  const { data: topPerformers } = useQuery({
    queryKey: ['topPerformers'],
    queryFn: () => api.get('/analytics/top-performers?role=INTERN&limit=5').then(res => res.data),
  })

  const { data: trends } = useQuery({
    queryKey: ['attendanceTrends'],
    queryFn: () => api.get('/analytics/attendance-trends?months=6').then(res => res.data),
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Department Attendance</h3>
        <div className="flex gap-2">
          <input type="text" placeholder="Department ID" value={deptId} onChange={e => setDeptId(e.target.value)} className="border p-2" />
          <input type="number" placeholder="Month" value={month} onChange={e => setMonth(e.target.value)} className="border p-2 w-20" />
          <input type="number" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} className="border p-2 w-24" />
        </div>
        {deptAttendance && (
          <table className="w-full border mt-2">
            <thead><tr className="bg-gray-100"><th className="p-2 border">Name</th><th className="p-2 border">Present</th><th className="p-2 border">Absent</th><th className="p-2 border">Half Day</th></tr></thead>
            <tbody>
              {deptAttendance.map(u => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.full_name || u.email}</td>
                  <td className="p-2 border">{u.present}</td>
                  <td className="p-2 border">{u.absent}</td>
                  <td className="p-2 border">{u.half_day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Top Intern Performers</h3>
        {topPerformers?.map((u, idx) => (
          <p key={u.id}>{idx+1}. {u.full_name || u.email} – {parseFloat(u.avg_rating).toFixed(2)} ({u.total_ratings} ratings)</p>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Attendance Trends (Last 6 months)</h3>
        {trends && (
          <ul>
            {Object.entries(trends.reduce((acc, row) => {
              acc[row.month] = acc[row.month] || {};
              acc[row.month][row.status] = row.count;
              return acc;
            }, {})).map(([month, stats]) => (
              <li key={month}>{month}: Present {stats.PRESENT || 0}, Absent {stats.ABSENT || 0}, Half-day {stats.HALF_DAY || 0}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
