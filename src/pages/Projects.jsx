import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Projects() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('files')
      .select('*')
      .eq('category', 'project')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFiles(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <section className="min-h-screen bg-slate-950 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Projects</h1>
        <p className="text-slate-400 mb-10">
          Hands-on networking labs, Packet Tracer topologies, and documentation.
        </p>

        {loading && <p className="text-slate-500">Loading…</p>}

        {!loading && files.length === 0 && (
          <p className="text-slate-500">No projects uploaded yet. Check back soon!</p>
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

              <p className="text-xs text-slate-500 mb-4 truncate">
                📦 {f.file_name}
              </p>

              {f.doc_name && (
                <p className="text-xs text-slate-500 mb-4 truncate">
                  📄 {f.doc_name}
                </p>
              )}

              <div className="mt-auto flex gap-2">
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2 px-4 rounded-lg transition text-sm"
                >
                  Project File
                </a>
                {f.doc_url && (
                  <a
                    href={f.doc_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center border border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/10 font-semibold py-2 px-4 rounded-lg transition text-sm"
                  >
                    Documentation
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}