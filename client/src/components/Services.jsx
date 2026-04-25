import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { id: 'full',     label: 'Full Detail'    },
  { id: 'exterior', label: 'Exterior Only'  },
  { id: 'interior', label: 'Interior Only'  },
]

const PACKAGES = {
  full: [
    {
      name: 'Basic', price: '$65',
      features:  ['Hand wash & dry (exterior)', 'Window cleaning (in & out)', 'Interior vacuum', 'Dashboard & surface wipe down', 'Tire & rim cleaning'],
      excluded:  ['Wax / paint sealant', 'Carpet shampoo', 'Leather conditioning'],
    },
    {
      name: 'Standard', price: '$110', featured: true,
      features:  ['Everything in Basic', 'Carpet & upholstery shampoo', 'Tire shine & trim dressing', 'Door jamb cleaning', 'Air freshener'],
      excluded:  ['Wax / paint sealant', 'Clay bar treatment', 'Leather conditioning'],
    },
    {
      name: 'Premium', price: '$160',
      features:  ['Everything in Standard', 'Clay bar & paint decontamination', 'Wax & paint sealant', 'Leather cleaning & conditioning', 'Odor elimination treatment', 'Pet hair removal', 'Full detailing report'],
      excluded:  [],
    },
  ],
  exterior: [
    {
      name: 'Basic', price: '$35',
      features:  ['Hand wash & dry', 'Exterior window cleaning', 'Tire & rim cleaning', 'Wheel well rinse'],
      excluded:  ['Tire shine', 'Wax / sealant', 'Trim dressing'],
    },
    {
      name: 'Standard', price: '$55', featured: true,
      features:  ['Everything in Basic', 'Tire shine', 'Trim dressing', 'Door jamb wipe down', 'Bug & tar removal'],
      excluded:  ['Clay bar', 'Wax / sealant'],
    },
    {
      name: 'Premium', price: '$85',
      features:  ['Everything in Standard', 'Clay bar treatment', 'Wax & paint sealant', 'Paint decontamination', 'Chrome & metal polish', 'Plastic trim restoration'],
      excluded:  [],
    },
  ],
  interior: [
    {
      name: 'Basic', price: '$40',
      features:  ['Full vacuum (seats, carpet, trunk)', 'Dashboard & console wipe down', 'Interior window cleaning', 'Cup holder cleaning'],
      excluded:  ['Carpet shampoo', 'Leather conditioning', 'Odor treatment'],
    },
    {
      name: 'Standard', price: '$65', featured: true,
      features:  ['Everything in Basic', 'Carpet & mat shampoo', 'Seat cleaning', 'Vent cleaning', 'Air freshener'],
      excluded:  ['Leather conditioning', 'Odor elimination'],
    },
    {
      name: 'Premium', price: '$95',
      features:  ['Everything in Standard', 'Leather cleaning & conditioning', 'Steam cleaning', 'Odor elimination treatment', 'Pet hair removal', 'Headliner cleaning', 'Stain treatment'],
      excluded:  [],
    },
  ],
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
  exit:  { opacity: 0, transition: { duration: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}

function PackageCard({ pkg }) {
  return (
    <motion.div variants={cardVariants} className={`package-card${pkg.featured ? ' featured' : ''}`}>
      {pkg.featured && <div className="popular-badge">Most Popular</div>}
      <div className="package-header">
        <h3 className="package-name">{pkg.name}</h3>
        <div className="package-price">
          <span className="price-amount">{pkg.price}</span>
          <span className="price-note">starting price</span>
        </div>
      </div>
      <ul className="package-features">
        {pkg.features.map(f => (
          <li key={f}><i className="fas fa-check" /> {f}</li>
        ))}
        {pkg.excluded.map(f => (
          <li key={f} className="feature-excluded"><i className="fas fa-times" /> {f}</li>
        ))}
      </ul>
      <a href="#booking" className="btn btn-card">Book {pkg.name}</a>
    </motion.div>
  )
}

export default function Services() {
  const [activeTab, setActiveTab] = useState('full')

  return (
    <section className="services" id="services">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-eyebrow">What We Offer</p>
          <h2 className="section-title">Detailing Packages</h2>
          <p className="section-sub">
            Choose the service type and tier that fits your needs. All packages include
            professional-grade products and meticulous attention to detail.
          </p>
        </motion.div>

        <div className="service-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="packages-grid"
            variants={gridVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {PACKAGES[activeTab].map(pkg => (
              <PackageCard key={pkg.name} pkg={pkg} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="services-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="addons-box">
            <h4><i className="fas fa-plus-circle" /> Available Add-ons</h4>
            <div className="addons-grid">
              <span className="addon-tag">Wax / Paint Sealant +$20</span>
              <span className="addon-tag">Odor Elimination +$20</span>
              <span className="addon-tag">Pet Hair Removal +$15</span>
              <span className="addon-tag">Ceramic Coating — Quote Required</span>
            </div>
          </div>
          <div className="quote-note">
            <i className="fas fa-info-circle" />
            <p>
              Prices shown are <strong>starting prices</strong>. Final cost may vary based on
              vehicle size and condition. Heavily soiled vehicles may require a custom quote —
              contact us or mention it in your booking.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
