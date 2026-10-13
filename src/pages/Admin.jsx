import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('files') // files | skills | about | gallery

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading…</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none" required />
          {authError && <p className="text-red-400 text-sm mb-4">{authError}</p>}
          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 rounded-lg transition">Log In</button>
        </form>
      </div>
    )
  }

  const tabs = [
    { id: 'files', label: 'Files' },
    { id: 'skills', label: 'Skills' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Gallery' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-400 transition">Log Out</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                tab === t.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'files' && <FilesTab />}
        {tab === 'skills' && <SkillsTab />}
        {tab === 'about' && <AboutTab />}
        {tab === 'gallery' && <GalleryTab />}
      </div>
    </div>
  )
}

/* ---------------- FILES TAB ---------------- */
function FilesTab() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('project')
  const [file, setFile] = useState(null)
  const [docFile, setDocFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState([])

  useEffect(() => { loadFiles() }, [])

  async function loadFiles() {
    const { data } = await supabase.from('files').select('*').order('created_at', { ascending: false })
    setFiles(data || [])
  }

  async function uploadToStorage(fileObj, folder) {
    const ext = fileObj.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `${folder}/${fileName}`
    const { error } = await supabase.storage.from('portfolio-files').upload(path, fileObj)
    if (error) throw error
    const { data } = supabase.storage.from('portfolio-files').getPublicUrl(path)
    return { url: data.publicUrl, name: fileObj.name }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !title) return setMessage('Please add a title and choose a file.')
    setUploading(true)
    setMessage('')
    try {
      const main = await uploadToStorage(file, category)
      let doc = { url: null, name: null }
      if (docFile) doc = await uploadToStorage(docFile, `${category}-docs`)

      const { error: dbErr } = await supabase.from('files').insert({
        title, description, category,
        file_url: main.url, file_name: main.name, file_type: file.type,
        doc_url: doc.url, doc_name: doc.name,
      })
      if (dbErr) setMessage('DB error: ' + dbErr.message)
      else {
        setMessage('✅ Uploaded successfully!')
        setTitle(''); setDescription(''); setFile(null); setDocFile(null)
        e.target.reset(); loadFiles()
      }
    } catch (err) { setMessage('Upload failed: ' + err.message) }
    setUploading(false)
  }

  async function handleDelete(id, fileUrl, docUrl) {
    if (!confirm('Delete permanently?')) return
    if (fileUrl) { const p = fileUrl.split('/portfolio-files/')[1]; if (p) await supabase.storage.from('portfolio-files').remove([p]) }
    if (docUrl) { const p = docUrl.split('/portfolio-files/')[1]; if (p) await supabase.storage.from('portfolio-files').remove([p]) }
    await supabase.from('files').delete().eq('id', id)
    loadFiles()
  }

  return (
    <>
      <form onSubmit={handleUpload} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6">Upload New File</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none" required />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none">
            <option value="project">Project</option>
            <option value="certificate">Certificate</option>
            <option value="resume">Resume / CV</option>
          </select>
        </div>
        <textarea placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3} className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none resize-none" />

        <label className="block text-sm text-slate-400 mb-2">Main file (required)</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])}
          className="w-full mb-4 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-slate-950 file:font-semibold hover:file:bg-cyan-400" required />

        <label className="block text-sm text-slate-400 mb-2">Documentation (optional)</label>
        <input type="file" onChange={(e) => setDocFile(e.target.files[0])}
          className="w-full mb-4 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-600 file:text-white file:font-semibold hover:file:bg-slate-500" />

        <button type="submit" disabled={uploading}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold px-6 py-3 rounded-lg transition">
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
      </form>

      <h2 className="text-xl font-semibold mb-4">Files ({files.length})</h2>
      <div className="space-y-3">
        {files.map((f) => (
          <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center gap-4">
            <div className="min-w-0">
              <p className="font-medium truncate">{f.title}</p>
              <p className="text-xs text-slate-500">{f.category} • {f.file_name}{f.doc_name && <> • 📄 {f.doc_name}</>}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href={f.file_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm">View</a>
              {f.doc_url && <a href={f.doc_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm">Docs</a>}
              <button onClick={() => handleDelete(f.id, f.file_url, f.doc_url)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p className="text-slate-500 text-sm">No files yet.</p>}
      </div>
    </>
  )
}

/* ---------------- SKILLS TAB ---------------- */
function SkillsTab() {
  const [name, setName] = useState('')
  const [level, setLevel] = useState(80)
  const [category, setCategory] = useState('Networking')
  const [skills, setSkills] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => { loadSkills() }, [])

  async function loadSkills() {
    const { data } = await supabase.from('skills').select('*').order('created_at', { ascending: false })
    setSkills(data || [])
  }

  async function addSkill(e) {
    e.preventDefault()
    if (!name) return
    const { error } = await supabase.from('skills').insert({ name, level: Number(level), category })
    if (error) setMessage(error.message)
    else { setName(''); setLevel(80); setMessage('✅ Added!'); loadSkills() }
  }

  async function deleteSkill(id) {
    if (!confirm('Delete this skill?')) return
    await supabase.from('skills').delete().eq('id', id)
    loadSkills()
  }

  return (
    <>
      <form onSubmit={addSkill} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6">Add Skill</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <input type="text" placeholder="Skill name (e.g. Cisco Routing)" value={name} onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none" required />
          <input type="text" placeholder="Category (e.g. Networking)" value={category} onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none" />
          <input type="number" min="0" max="100" placeholder="Level 0-100" value={level} onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none" />
        </div>
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-lg transition">Add Skill</button>
        {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
      </form>

      <h2 className="text-xl font-semibold mb-4">Skills ({skills.length})</h2>
      <div className="space-y-3">
        {skills.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center gap-4">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-slate-500">{s.category} • {s.level}%</p>
            </div>
            <button onClick={() => deleteSkill(s.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
          </div>
        ))}
        {skills.length === 0 && <p className="text-slate-500 text-sm">No skills yet.</p>}
      </div>
    </>
  )
}

/* ---------------- ABOUT TAB ---------------- */
function AboutTab() {
  const [headline, setHeadline] = useState('')
  const [about, setAbout] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('profile').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) { setHeadline(data.headline || ''); setAbout(data.about || '') }
    })
  }, [])

  async function save(e) {
    e.preventDefault()
    const { error } = await supabase.from('profile')
      .upsert({ id: 1, headline, about, updated_at: new Date().toISOString() })
    setMessage(error ? error.message : '✅ Saved!')
  }

  return (
    <form onSubmit={save} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-6">About Me</h2>
      <label className="block text-sm text-slate-400 mb-2">Headline (short tagline)</label>
      <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
        className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none" />

      <label className="block text-sm text-slate-400 mb-2">About Me (long text)</label>
      <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={10}
        className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none resize-none" />

      <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-lg transition">Save</button>
      {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
    </form>
  )
}

/* ---------------- GALLERY TAB ---------------- */
function GalleryTab() {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [items, setItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadGallery() }, [])

  async function loadGallery() {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
    setItems(data || [])
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!mediaFile || !title) return setMessage('Please add a title and choose a file.')
    setUploading(true)
    setMessage('')

    const isVideo = mediaFile.type.startsWith('video')
    const ext = mediaFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `gallery/${fileName}`

    const { error: upErr } = await supabase.storage.from('portfolio-files').upload(path, mediaFile)
    if (upErr) { setMessage('Upload failed: ' + upErr.message); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('portfolio-files').getPublicUrl(path)

    const { error: dbErr } = await supabase.from('gallery').insert({
      title, caption, media_url: urlData.publicUrl,
      media_type: isVideo ? 'video' : 'image',
    })

    if (dbErr) setMessage('DB error: ' + dbErr.message)
    else {
      setMessage('✅ Uploaded!')
      setTitle(''); setCaption(''); setMediaFile(null)
      e.target.reset(); loadGallery()
    }
    setUploading(false)
  }

  async function handleDelete(id, mediaUrl) {
    if (!confirm('Delete permanently?')) return
    const p = mediaUrl.split('/portfolio-files/')[1]
    if (p) await supabase.storage.from('portfolio-files').remove([p])
    await supabase.from('gallery').delete().eq('id', id)
    loadGallery()
  }

  return (
    <>
      <form onSubmit={handleUpload} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6">Upload to Gallery</h2>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none" required />
        <textarea placeholder="Caption / description" value={caption} onChange={(e) => setCaption(e.target.value)} rows={3}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none resize-none" />
        <input type="file" accept="image/*,video/*" onChange={(e) => setMediaFile(e.target.files[0])}
          className="w-full mb-4 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-slate-950 file:font-semibold hover:file:bg-cyan-400" required />
        <button type="submit" disabled={uploading}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold px-6 py-3 rounded-lg transition">
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
      </form>

      <h2 className="text-xl font-semibold mb-4">Gallery Items ({items.length})</h2>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center gap-4">
            <div className="min-w-0">
              <p className="font-medium truncate">{it.title}</p>
              <p className="text-xs text-slate-500">{it.media_type} • {it.caption || 'no caption'}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href={it.media_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm">View</a>
              <button onClick={() => handleDelete(it.id, it.media_url)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-slate-500 text-sm">No gallery items yet.</p>}
      </div>
    </>
  )
}