import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WEEKEND_SLOTS = [
  { value: 'morning',   label: 'Morning (8am – 12pm)'  },
  { value: 'afternoon', label: 'Afternoon (12pm – 4pm)' },
  { value: 'evening',   label: 'Evening (4pm – 7pm)'    },
]

const WEEKDAY_SLOTS = [
  { value: 'after-school', label: 'After School (3pm – 6pm)' },
  { value: 'evening',      label: 'Evening (6pm – 8pm)'      },
]

const EMPTY_FORM = {
  name: '', contact: '', date: '', time: '',
  'service-type': '', vehicle: '', condition: '', notes: '',
}

export default function Booking() {
  const [form, setForm]           = useState(EMPTY_FORM)
  const [addons, setAddons]       = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading]     = useState(false)
  const [slowWarn, setSlowWarn]   = useState(false)
  const [success, setSuccess]     = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // pre-fetch blocked dates so the backend can validate on submit
    // (we don't need to disable calendar days client-side right now)
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleDateChange = (val) => {
    set('date', val)
    set('time', '')
    if (!val) { setTimeSlots([]); return }
    const day = new Date(val + 'T12:00:00').getDay()
    setTimeSlots(day === 0 || day === 6 ? WEEKEND_SLOTS : WEEKDAY_SLOTS)
  }

  const toggleAddon = (val) =>
    setAddons(prev => prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSlowWarn(false)

    const payload   = { ...form, ...(addons.length && { addons }) }
    const apiUrl    = window.location.hostname === 'localhost'
      ? 'http://localhost:4000/book'
      : '/book'

    const slowTimer  = setTimeout(() => setSlowWarn(true), 8000)
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), 90000)

    try {
      const res    = await fetch(apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      })
      clearTimeout(slowTimer)
      clearTimeout(timeoutId)

      const result = await res.json()
      if (result.success) {
        setSuccess(true)
        setForm(EMPTY_FORM)
        setAddons([])
        setTimeSlots([])
        setTimeout(() => setSuccess(false), 6000)
      } else {
        alert(result.message || 'Something went wrong. Please call us directly.')
      }
    } catch (err) {
      clearTimeout(slowTimer)
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        alert('The server is taking too long. Please try again or call (708) 714-2432.')
      } else {
        alert('Could not connect. Please call or text us at (708) 714-2432.')
      }
    }

    setLoading(false)
    setSlowWarn(false)
  }

  return (
    <section className="booking" id="booking">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-eyebrow">Get Scheduled</p>
          <h2 className="section-title">Book an Appointment</h2>
          <p className="section-sub">
            Fill out the form below and we'll reach out to confirm your appointment
            and finalize pricing.
          </p>
        </motion.div>

        <div className="booking-wrapper">
          <motion.div
            className="booking-info"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { icon: 'fa-clock',        title: 'Quick Response',          desc: 'We\'ll confirm your booking within 24 hours' },
              { icon: 'fa-map-marker-alt', title: 'Mobile Service',        desc: 'We come to you — at home or work' },
              { icon: 'fa-shield-alt',   title: 'Satisfaction Guaranteed', desc: 'We don\'t leave until you\'re happy with the result' },
              { icon: 'fa-tag',          title: 'Fair Pricing',            desc: 'No hidden fees — transparent quotes every time' },
            ].map(card => (
              <div key={card.title} className="info-card">
                <i className={`fas ${card.icon}`} />
                <div>
                  <h4>{card.title}</h4>
                  <p>{card.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.form
            className="booking-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name" name="name" type="text"
                  placeholder="John Smith" required
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact">Email *</label>
                <input
                  id="contact" name="contact" type="email"
                  placeholder="email@example.com" required
                  value={form.contact}
                  onChange={e => set('contact', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Preferred Date</label>
                <input
                  id="date" name="date" type="date"
                  min={today}
                  value={form.date}
                  onChange={e => handleDateChange(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Preferred Time</label>
                <select
                  id="time" name="time"
                  value={form.time}
                  onChange={e => set('time', e.target.value)}
                  disabled={!form.date}
                >
                  <option value="">{form.date ? 'Select a time' : 'Select a date first'}</option>
                  {timeSlots.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="service-type">Service Type *</label>
                <select
                  id="service-type" name="service-type" required
                  value={form['service-type']}
                  onChange={e => set('service-type', e.target.value)}
                >
                  <option value="">Select service type</option>
                  <option value="full-basic">Full Detail — Basic ($65+)</option>
                  <option value="full-standard">Full Detail — Standard ($110+)</option>
                  <option value="full-premium">Full Detail — Premium ($160+)</option>
                  <option value="exterior-basic">Exterior Only — Basic ($35+)</option>
                  <option value="exterior-standard">Exterior Only — Standard ($55+)</option>
                  <option value="exterior-premium">Exterior Only — Premium ($85+)</option>
                  <option value="interior-basic">Interior Only — Basic ($40+)</option>
                  <option value="interior-standard">Interior Only — Standard ($65+)</option>
                  <option value="interior-premium">Interior Only — Premium ($95+)</option>
                  <option value="ceramic">Ceramic Coating — Custom Quote</option>
                  <option value="quote">Not sure — I need a custom quote</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="vehicle">Vehicle (Year, Make, Model)</label>
                <input
                  id="vehicle" name="vehicle" type="text"
                  placeholder="e.g. 2019 Honda Civic"
                  value={form.vehicle}
                  onChange={e => set('vehicle', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Add-ons (optional)</label>
              <div className="checkbox-group">
                {[
                  { value: 'wax',      label: 'Wax / Paint Sealant (+$20)' },
                  { value: 'odor',     label: 'Odor Elimination (+$20)'    },
                  { value: 'pet-hair', label: 'Pet Hair Removal (+$15)'     },
                ].map(a => (
                  <label key={a.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={addons.includes(a.value)}
                      onChange={() => toggleAddon(a.value)}
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="condition">Vehicle Condition</label>
              <select
                id="condition" name="condition"
                value={form.condition}
                onChange={e => set('condition', e.target.value)}
              >
                <option value="">How would you describe your vehicle's current condition?</option>
                <option value="light">Light — just needs a routine refresh</option>
                <option value="moderate">Moderate — some dirt, minor stains</option>
                <option value="heavy">Heavy — very dirty, major stains or odors</option>
                <option value="unsure">Not sure — I'd like a quote</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes" name="notes" rows="3"
                placeholder="Any specific requests, questions, or details about your vehicle..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.button
                  key="submit"
                  type="submit"
                  className="btn btn-primary btn-submit"
                  disabled={loading}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin" />
                      {slowWarn ? 'Almost there...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calendar-check" /> Request Appointment
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  key="success"
                  className="form-success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <i className="fas fa-check-circle" />
                  <h4>Request Received!</h4>
                  <p>Thanks! We'll reach out within 24 hours to confirm your appointment.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
