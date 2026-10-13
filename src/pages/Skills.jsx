import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('skills').select('*').order('level', { ascending: false }).then(({ data }) => {
      setSkills(data || [])
      setLoading(false)
    })
  }, [])

  // Group by category
  const grouped = skills.reduce((acc, s) => {
    acc[s.category] = acc[s.category] || []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <section className="min-h-screen bg-slate-950 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Skills</h1>
        <p className="text-slate-400 mb-10">Technologies, tools, and areas I work with.</p>

        {loading && <p className="text-slate-500">Loading…</p>}
        {!loading && skills.length === 0 && <p className="text-slate-500">No skills listed yet.</p>}

        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="mb-10">
            <h2 className="text-sm uppercase tracking-wider text-cyan-400 mb-4">{cat}</h2>
            <div className="space-y-4">
              {list.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-200">{s.name}</span>
                    <span className="text-slate-500">{s.level}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${s.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}