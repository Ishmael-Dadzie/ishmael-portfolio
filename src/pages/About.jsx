import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function About() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.from('profile').select('*').eq('id', 1).single().then(({ data }) => setProfile(data))
  }, [])

  return (
    <section className="min-h-screen bg-slate-950 text-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">About Me</h1>
        <p className="text-slate-400 mb-10">{profile?.headline || 'Networking & Systems Administration Student'}</p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 leading-relaxed whitespace-pre-line text-slate-300">
          {profile?.about || 'About section coming soon…'}
        </div>
      </div>
    </section>
  )
}