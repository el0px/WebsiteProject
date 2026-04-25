import { motion } from 'framer-motion'

const CARDS = [
  {
    href:  'tel:+17087142432',
    icon:  'fa-phone',
    title: 'Call or Text',
    lines: ['(708) 714-2432', '(224) 391-4351'],
  },
  {
    href:   'https://maps.google.com/?q=Franklin+Park+IL',
    target: '_blank',
    icon:   'fa-map-marker-alt',
    title:  'Location',
    lines:  ['Franklin Park / Bensenville'],
  },
  {
    href:   'https://instagram.com/royal_detailing3',
    target: '_blank',
    icon:   'fa-instagram',
    fab:    true,
    title:  'Instagram',
    lines:  ['@royal_detailing3'],
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const card = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-eyebrow">Get In Touch</p>
          <h2 className="section-title">Contact Us</h2>
          <p className="section-sub">
            Have a question? Reach out and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <motion.div
          className="contact-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {CARDS.map(c => (
            <motion.a
              key={c.title}
              variants={card}
              href={c.href}
              target={c.target}
              rel={c.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="contact-card"
            >
              <div className="contact-icon">
                <i className={`${c.fab ? 'fab' : 'fas'} ${c.icon}`} />
              </div>
              <h4>{c.title}</h4>
              {c.lines.map((line, i) => (
                <p key={i} style={i > 0 ? { fontSize: '0.8rem', marginTop: '2px', color: 'var(--text-muted)' } : undefined}>
                  {line}
                </p>
              ))}
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
