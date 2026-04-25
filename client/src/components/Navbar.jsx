import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => {
    setOpen(false)
    document.body.style.overflow = ''
  }

  const toggleMenu = () => {
    const next = !open
    setOpen(next)
    document.body.style.overflow = next ? 'hidden' : ''
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#home" className="nav-logo">
          <img
            src="/logo.png"
            alt="Royal Detailing Logo"
            className="nav-logo-img"
            onError={e => { e.target.style.display = 'none' }}
          />
          <span className="logo-royal">Royal</span>
          <span className="logo-detailing">Detailing</span>
        </a>

        <button
          className={`hamburger${open ? ' open' : ''}`}
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>

        <ul className={`nav-links${open ? ' open' : ''}`}>
          <li><a href="#home"     className="nav-link" onClick={closeMenu}>Home</a></li>
          <li><a href="#services" className="nav-link" onClick={closeMenu}>Services</a></li>
          <li><a href="#booking"  className="nav-link" onClick={closeMenu}>Book Now</a></li>
          <li><a href="#contact"  className="nav-link" onClick={closeMenu}>Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}
