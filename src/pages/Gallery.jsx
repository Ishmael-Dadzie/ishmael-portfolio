import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('gallery').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setItems(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <section className="min-h-screen bg-slate-950 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Gallery</h1>
        <p className="text-slate-400 mb-10">Moments from labs, setups, and networking projects.</p>

        {loading && <p className="text-slate-500">Loading…</p>}
        {!loading && items.length === 0 && <p className="text-slate-500">No gallery items yet.</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition">
              {it.media_type === 'video' ? (
                <video src={it.media_url} controls className="w-full h-52 object-cover bg-black" />
              ) : (
                <img src={it.media_url} alt={it.title} className="w-full h-52 object-cover" />
              )}
              <div className="p-5">
                <h3 className="font-semibold mb-2">{it.title}</h3>
                {it.caption && <p className="text-slate-400 text-sm">{it.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}