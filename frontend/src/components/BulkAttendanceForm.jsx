import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export default function BulkAttendanceForm() {
  const queryClient = useQueryClient()
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [status, setStatus] = useState('PRESENT')
  const [remarks, setRemarks] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [error, setError] = useState('')

  const { data: reports } = useQuery({
    queryKey: ['directReports'],
    queryFn: () => api.get('/hierarchy/my/direct-reports').then(res => res.data),
  })

  const bulkMutation = useMutation({
    mutationFn: (data) => api.post('/attendance/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries('attendance')
      setError('')
      alert(`Marked ${selectedUsers.length} users`)
      setSelectedUsers([])
    },
    onError: (err) => setError(err.response?.data?.error || 'Bulk mark failed')
  })

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedUsers.length === 0) {
      setError('Select at least one user')
      return
    }
    const entries = selectedUsers.map(uid => ({
      user_id: uid,
      date,
      status,
      remarks
    }))
    bulkMutation.mutate({ entries })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Bulk Mark Attendance</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-2">
        <label className="block text-sm">Select Team Members</label>
        <div className="max-h-40 overflow-y-auto border p-2">
          {reports?.map(user => (
            <label key={user.id} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUser(user.id)} />
              {user.full_name || user.email} ({user.role})
            </label>
          ))}
        </div>
      </div>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 w-full mb-2" required />
      <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2 w-full mb-2">
        <option value="PRESENT">Present</option>
        <option value="ABSENT">Absent</option>
        <option value="HALF_DAY">Half Day</option>
      </select>
      <input type="text" placeholder="Remarks (optional)" value={remarks} onChange={e => setRemarks(e.target.value)} className="border p-2 w-full mb-2" />
      <button type="submit" disabled={bulkMutation.isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded">
        {bulkMutation.isLoading ? 'Marking...' : 'Bulk Mark'}
      </button>
    </form>
  )
}
