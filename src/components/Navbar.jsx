import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
  ]
  const [resume, setResume] = useState(null)

useEffect(() => {
  supabase
    .from('files')
    .select('*')
    .eq('category', 'resume')
    .order('created_at', { ascending: false })
    .limit(1)
    .then(({ data }) => setResume(data?.[0] || null))
}, [])

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white tracking-tight">
          Ishmael<span className="text-cyan-400">.</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'text-cyan-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
          
        </div>

        {resume && (
  <a
    href={resume.file_url}
    target="_blank"
    rel="noreferrer"
    className="hidden md:inline-block text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
  >
    Resume
  </a>
)}

        

        {/* Mobile button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}