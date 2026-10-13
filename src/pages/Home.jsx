import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="min-h-[calc(100vh-64px)] flex items-center bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-cyan-400 font-medium mb-3 tracking-wide">
            Hi, I'm
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Ishmael Dadzie
          </h1>
          <h2 className="text-xl md:text-2xl text-slate-300 mb-6">
            Networking & Systems Administration Student
          </h2>
          <p className="text-slate-400 leading-relaxed mb-8 max-w-lg">
            Passionate about designing, securing, and troubleshooting networks.
            Currently building hands-on experience in routing, switching,
            network security, and system administration on my path toward
            becoming a Network Engineer.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/projects"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-lg transition"
            >
              View My Projects
            </Link>
            <Link
              to="/contact"
              className="border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-slate-200 font-semibold px-6 py-3 rounded-lg transition"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Photo placeholder */}
        <div className="flex justify-center">
          <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/40 flex items-center justify-center">
            <span className="text-slate-500 text-sm">Your photo here</span>
          </div>
        </div>
      </div>
    </section>
  )
}