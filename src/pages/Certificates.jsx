import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Certificates() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('files')
      .select('*')
      .eq('category', 'certificate')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFiles(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <section className="min-h-screen bg-slate-950 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Certificates</h1>
        <p className="text-slate-400 mb-10">
          Professional certifications and completed courses.
        </p>

        {loading && <p className="text-slate-500">Loading…</p>}

        {!loading && files.length === 0 && (
          <p className="text-slate-500">No certificates uploaded yet.</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((f) => (
            <div
              key={f.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-cyan-500/50 transition"
            >
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              {f.description && (
                <p className="text-slate-400 text-sm mb-4 flex-1">{f.description}</p>
              )}
              <a
                href={f.file_url}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-block text-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2 px-4 rounded-lg transition text-sm"
              >
                View Certificate
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}