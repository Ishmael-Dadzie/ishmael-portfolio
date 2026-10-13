import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(true)

  // File upload state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('project')
  const [file, setFile] = useState(null)
  const [docFile, setDocFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState([])

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Load files when logged in
  useEffect(() => {
    if (session) loadFiles()
  }, [session])

  async function loadFiles() {
    const { data } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })
    setFiles(data || [])
  }

  async function handleLogin(e) {
    e.preventDefault()
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // Helper: upload any file to storage, return { url, name }
  async function uploadToStorage(fileObj, folder) {
    const ext = fileObj.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `${folder}/${fileName}`

    const { error: upErr } = await supabase.storage
      .from('portfolio-files')
      .upload(path, fileObj)

    if (upErr) throw upErr

    const { data } = supabase.storage
      .from('portfolio-files')
      .getPublicUrl(path)

    return { url: data.publicUrl, name: fileObj.name }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !title) {
      setMessage('Please add a title and choose a file.')
      return
    }
    setUploading(true)
    setMessage('')

    try {
      // 1. Upload main file
      const main = await uploadToStorage(file, category)

      // 2. Upload documentation if provided
      let doc = { url: null, name: null }
      if (docFile) {
        doc = await uploadToStorage(docFile, `${category}-docs`)
      }

      // 3. Save row in DB
      const { error: dbErr } = await supabase.from('files').insert({
        title,
        description,
        category,
        file_url: main.url,
        file_name: main.name,
        file_type: file.type,
        doc_url: doc.url,
        doc_name: doc.name,
      })

      if (dbErr) {
        setMessage('Saved file but DB error: ' + dbErr.message)
      } else {
        setMessage('✅ Uploaded successfully!')
        setTitle('')
        setDescription('')
        setFile(null)
        setDocFile(null)
        e.target.reset()
        loadFiles()
      }
    } catch (err) {
      setMessage('Upload failed: ' + err.message)
    }

    setUploading(false)
  }

  async function handleDelete(id, fileUrl, docUrl) {
    if (!confirm('Delete this file permanently?')) return

    // Delete main file
    if (fileUrl) {
      const path = fileUrl.split('/portfolio-files/')[1]
      if (path) await supabase.storage.from('portfolio-files').remove([path])
    }

    // Delete doc file if it exists
    if (docUrl) {
      const docPath = docUrl.split('/portfolio-files/')[1]
      if (docPath) await supabase.storage.from('portfolio-files').remove([docPath])
    }

    await supabase.from('files').delete().eq('id', id)
    loadFiles()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading…
      </div>
    )
  }

  // ---- LOGIN VIEW ----
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none"
            required
          />
          {authError && <p className="text-red-400 text-sm mb-4">{authError}</p>}
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 rounded-lg transition"
          >
            Log In
          </button>
        </form>
      </div>
    )
  }

  // ---- ADMIN VIEW ----
  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-red-400 transition"
          >
            Log Out
          </button>
        </div>

        {/* Upload form */}
        <form
          onSubmit={handleUpload}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10"
        >
          <h2 className="text-xl font-semibold mb-6">Upload New File</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title (e.g. Campus Network Design)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none"
            >
              <option value="project">Project</option>
              <option value="certificate">Certificate</option>
              <option value="resume">Resume / CV</option>
            </select>
          </div>

          <textarea
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none resize-none"
          />

          <label className="block text-sm text-slate-400 mb-2">
            Main file (required)
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full mb-4 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-slate-950 file:font-semibold hover:file:bg-cyan-400"
            required
          />

          <label className="block text-sm text-slate-400 mb-2">
            Documentation file (optional — PDF, DOCX, etc.)
          </label>
          <input
            type="file"
            onChange={(e) => setDocFile(e.target.files[0])}
            className="w-full mb-4 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-600 file:text-white file:font-semibold hover:file:bg-slate-500"
          />

          <button
            type="submit"
            disabled={uploading}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold px-6 py-3 rounded-lg transition"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>

          {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
        </form>

        {/* Files list */}
        <h2 className="text-xl font-semibold mb-4">
          Uploaded Files ({files.length})
        </h2>
        <div className="space-y-3">
          {files.map((f) => (
            <div
              key={f.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{f.title}</p>
                <p className="text-xs text-slate-500">
                  {f.category} • {f.file_name}
                  {f.doc_name && <> • 📄 {f.doc_name}</>}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  View
                </a>
                {f.doc_url && (
                  <a
                    href={f.doc_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    Docs
                  </a>
                )}
                <button
                  onClick={() => handleDelete(f.id, f.file_url, f.doc_url)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <p className="text-slate-500 text-sm">No files uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}