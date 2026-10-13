export default function Contact() {
  const contacts = [
    {
      label: 'Email',
      value: 'dadzie2005@gmail.com',
      href: 'mailto:dadzie2005@gmail.com',
      icon: '✉️',
    },
    {
      label: 'LinkedIn',
      /*input your linkdin link*/
      value: '#',
      href: '#',
      icon: '💼',
    },
    {
      label: 'GitHub',
      /*input your github link*/
      value: '#',
      href: '#',
      icon: '💻',
    },
  ]

  return (
    <section className="min-h-screen bg-slate-950 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-slate-400 mb-10">
          Open to internships, networking opportunities, and collaboration. Feel free to reach out.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition flex flex-col items-start"
            >
              <span className="text-3xl mb-3">{c.icon}</span>
              <p className="font-semibold mb-1">{c.label}</p>
              <p className="text-sm text-slate-400 break-all">{c.value}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}