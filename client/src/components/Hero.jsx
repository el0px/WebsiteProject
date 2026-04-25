import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] },
})

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg-orb orb-1" />
      <div className="hero-bg-orb orb-2" />

      <div className="hero-content">
        <motion.img
          {...fadeUp(0.1)}
          src="/logo.png"
          alt="Royal Detailing"
          className="hero-logo"
          onError={e => { e.target.style.display = 'none' }}
        />

        <motion.p {...fadeUp(0.2)} className="hero-eyebrow">
          Premium Auto Detailing
        </motion.p>

        <motion.h1 {...fadeUp(0.3)} className="hero-title">
          <span className="title-royal">Royal</span>
          <span className="title-detailing">Detailing</span>
        </motion.h1>

        <motion.p {...fadeUp(0.4)} className="hero-tagline">
          Your car deserves the royal treatment.
        </motion.p>

        <motion.p {...fadeUp(0.5)} className="hero-sub">
          Professional detailing services tailored to your vehicle's needs.<br />
          Serving Franklin Park, Bensenville &amp; surrounding areas.
        </motion.p>

        <motion.div {...fadeUp(0.6)} className="hero-buttons">
          <a href="#booking"  className="btn btn-primary">Book Appointment</a>
          <a href="#services" className="btn btn-secondary">View Packages</a>
        </motion.div>
      </div>

      <div className="scroll-hint">
        <i className="fas fa-chevron-down" />
      </div>
    </section>
  )
}
