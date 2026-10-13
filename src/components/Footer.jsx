export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} Ishmael Dadzie. All rights reserved.</p>
        <p className="mt-2 text-slate-500">
          Networking & Systems Administration Student
        </p>
      </div>
    </footer>
  )
}