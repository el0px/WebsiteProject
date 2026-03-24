/*
  ROYAL DETAILING — BACKEND SERVER
  Flow:
  1. Someone fills out the booking form and clicks submit
  2. The browser sends that data to THIS server (POST /book)
  3. This server saves the booking to Supabase database
  4. Resend sends email notifications
  5. Admin can view bookings, block dates, confirm/reject at /admin
*/

const express        = require('express');
const cors           = require('cors');
const path           = require('path');
const { Resend }     = require('resend');
const { createClient } = require('@supabase/supabase-js');
const twilio           = require('twilio');

require('dotenv').config();

const app    = express();
const PORT   = process.env.PORT || 4000;
const resend = new Resend(process.env.RESEND_API_KEY);

// Twilio client — for sending SMS
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Helper to send a text message (silently fails if SMS isn't set up)
async function sendSMS(to, body) {
  try {
    if (!to || !process.env.TWILIO_PHONE_NUMBER) return;
    // Format number: strip non-digits and add +1 if needed
    const cleaned = to.replace(/\D/g, '');
    const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   formatted,
    });
  } catch (err) {
    console.error('SMS failed:', err.message);
  }
}

// Supabase client — connects to our database
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Simple admin auth middleware
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
}

// Map raw form values to human-readable labels
const serviceLabels = {
  'exterior-basic':    'Exterior — Basic',
  'exterior-standard': 'Exterior — Standard',
  'exterior-premium':  'Exterior — Premium',
  'interior-basic':    'Interior — Basic',
  'interior-standard': 'Interior — Standard',
  'interior-premium':  'Interior — Premium',
  'full-basic':        'Full Detail — Basic',
  'full-standard':     'Full Detail — Standard',
  'full-premium':      'Full Detail — Premium',
  'ceramic':           'Ceramic Coating',
};

// Format a date string like "2026-03-25" into "March 25, 2026"
function formatDate(dateStr) {
  if (!dateStr) return 'Not specified';
  const [year, month, day] = dateStr.split('-');
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ── PUBLIC: Get blocked dates (for the booking form calendar) ──
app.get('/blocked-dates', async (req, res) => {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('date, reason');

  if (error) return res.status(500).json({ success: false });
  res.json({ success: true, dates: data });
});

// ── PUBLIC: Submit a booking ────────────────────────────────────
app.post('/book', async (req, res) => {

  const {
    name,
    contact,
    date,
    time,
    'service-type': serviceType,
    vehicle,
    addons,
    condition,
    notes
  } = req.body;

  // Basic validation
  if (!name || !contact || !serviceType) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  // Check if date is blocked
  if (date) {
    const { data: blocked } = await supabase
      .from('blocked_dates')
      .select('date')
      .eq('date', date)
      .single();

    if (blocked) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, that date is unavailable. Please choose another date.'
      });
    }
  }

  const serviceLabel  = serviceLabels[serviceType] || serviceType;
  const formattedDate = formatDate(date);

  // Format add-ons
  let addonsText = 'None';
  if (addons) {
    const addonsArray = Array.isArray(addons) ? addons : [addons];
    addonsText = addonsArray.join(', ');
  }

  // Save booking to database
  const { data: booking, error: dbError } = await supabase
    .from('bookings')
    .insert([{
      name,
      contact,
      date,
      time,
      service_type: serviceType,
      vehicle,
      addons: addonsText,
      condition,
      notes,
      status: 'pending'
    }])
    .select()
    .single();

  if (dbError) {
    console.error('Database error:', dbError.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please call or text us directly.' });
  }

  // ── EMAIL 1: Notification to the business ─────────────────────
  const businessHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
      <div style="background: #5b21b6; padding: 28px 32px; text-align: center;">
        <p style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 4px;">Royal Detailing</p>
        <p style="color: #d8b4fe; margin: 4px 0 0; font-size: 14px;">New Booking Request</p>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1a1a1a; margin: 0 0 24px; font-size: 18px;">Customer Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #666; font-size: 13px; width: 140px;">Name</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #666; font-size: 13px;">Contact</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${contact}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #666; font-size: 13px;">Date Requested</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${formattedDate}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #666; font-size: 13px;">Time</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${time || 'Not specified'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #666; font-size: 13px;">Service</td>
            <td style="padding: 12px 0;">
              <span style="background: #5b21b6; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 13px;">${serviceLabel}</span>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #666; font-size: 13px;">Vehicle</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${vehicle || 'Not specified'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #666; font-size: 13px;">Add-ons</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${addonsText}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; color: #666; font-size: 13px;">Vehicle Condition</td>
            <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${condition || 'Not specified'}</td>
          </tr>
          ${notes ? `<tr><td style="padding: 12px 0; color: #666; font-size: 13px; vertical-align: top;">Notes</td><td style="padding: 12px 0; color: #1a1a1a;">${notes}</td></tr>` : ''}
        </table>
        <div style="margin-top: 28px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 13px;">Reply to this email or contact <strong>${contact}</strong> to confirm this appointment.</p>
        </div>
      </div>
      <div style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #eee;">
        <p style="margin: 0; color: #999; font-size: 12px;">Royal Detailing · Franklin Park / Bensenville · (708) 714-2432</p>
      </div>
    </div>
  `;

  // ── EMAIL 2: Confirmation to the customer ──────────────────────
  const firstName = name.split(' ')[0];

  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
      <div style="background: #5b21b6; padding: 28px 32px; text-align: center;">
        <p style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 4px;">Royal Detailing</p>
        <p style="color: #d8b4fe; margin: 8px 0 0; font-size: 15px;">Your car deserves the royal treatment.</p>
      </div>
      <div style="padding: 36px 32px; background: #ffffff; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">&#10003;</div>
        <h2 style="color: #1a1a1a; margin: 0 0 12px;">Request Received, ${firstName}!</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
          Thanks for reaching out! We've received your booking request and will confirm your appointment within <strong>24 hours</strong>.
        </p>
        <div style="background: #f5f3ff; border: 1px solid #ddd8f5; border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 28px;">
          <h4 style="margin: 0 0 14px; color: #5b21b6; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Request Summary</h4>
          <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Service:</strong> ${serviceLabel}</p>
          <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Vehicle:</strong> ${vehicle || 'Not specified'}</p>
          ${addonsText !== 'None' ? `<p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Add-ons:</strong> ${addonsText}</p>` : ''}
        </div>
        <p style="color: #555; font-size: 14px; margin: 0 0 8px;">Questions? Reach us directly:</p>
        <p style="color: #5b21b6; font-size: 16px; font-weight: 700; margin: 0;">(708) 714-2432 &nbsp;|&nbsp; (224) 391-4351</p>
      </div>
      <div style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #eee; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 12px;">Royal Detailing · Franklin Park / Bensenville</p>
      </div>
    </div>
  `;

  try {
    const { error: bizEmailError } = await resend.emails.send({
      from:    'Royal Detailing Bookings <bookings@royal-detailing.org>',
      to:      process.env.EMAIL_TO,
      subject: `New Booking — ${name} | ${serviceLabel}`,
      html:    businessHtml,
    });
    if (bizEmailError) console.error('Business email error:', JSON.stringify(bizEmailError));
    else console.log('Business email sent to:', process.env.EMAIL_TO);

    const { error: custEmailError } = await resend.emails.send({
      from:    'Royal Detailing <bookings@royal-detailing.org>',
      to:      contact,
      subject: 'Booking Request Received — Royal Detailing',
      html:    confirmationHtml,
    });
    if (custEmailError) console.error('Customer email error:', JSON.stringify(custEmailError));
    else console.log('Customer email sent to:', contact);

    // Send SMS to business
    await sendSMS(process.env.BUSINESS_PHONE,
      `New booking from ${name}!\nService: ${serviceLabel}\nDate: ${formattedDate}\nContact: ${contact}\nVehicle: ${vehicle || 'N/A'}\nCheck admin panel to confirm.`
    );

    console.log(`Booking saved and notification sent for: ${name}`);
    res.status(200).json({ success: true, message: 'Booking request received! We will contact you within 24 hours.' });

  } catch (error) {
    console.error('Email send failed:', error.message);
    // Booking was saved to DB even if email failed
    res.status(200).json({ success: true, message: 'Booking request received! We will contact you within 24 hours.' });
  }
});

// ── ADMIN: Get all bookings ─────────────────────────────────────
app.get('/admin/bookings', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false });
  res.json({ success: true, bookings: data });
});

// ── ADMIN: Confirm or reject a booking ─────────────────────────
app.patch('/admin/bookings/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'confirmed' or 'rejected'

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false });

  // Send email to customer if they provided an email
  if (booking.contact.includes('@')) {
    const firstName    = booking.name.split(' ')[0];
    const serviceLabel = serviceLabels[booking.service_type] || booking.service_type;
    const formattedDate = formatDate(booking.date);

    const isConfirmed = status === 'confirmed';
    const statusHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden;">
        <div style="background: #5b21b6; padding: 28px 32px; text-align: center;">
          <p style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">Royal Detailing</p>
        </div>
        <div style="padding: 36px 32px; background: #ffffff; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">${isConfirmed ? '✅' : '❌'}</div>
          <h2 style="color: #1a1a1a; margin: 0 0 12px;">
            ${isConfirmed ? `Booking Confirmed, ${firstName}!` : `Booking Update, ${firstName}`}
          </h2>
          <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
            ${isConfirmed
              ? `Your appointment has been <strong>confirmed</strong>! We'll see you on <strong>${formattedDate}</strong>. If you need to reschedule, give us a call.`
              : `Unfortunately we're unable to accommodate your booking request for <strong>${formattedDate}</strong>. Please reach out to reschedule.`
            }
          </p>
          ${isConfirmed ? `
          <div style="background: #f5f3ff; border: 1px solid #ddd8f5; border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 28px;">
            <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Service:</strong> ${serviceLabel}</p>
            <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Vehicle:</strong> ${booking.vehicle || 'Not specified'}</p>
          </div>` : ''}
          <p style="color: #5b21b6; font-size: 16px; font-weight: 700; margin: 0;">(708) 714-2432 &nbsp;|&nbsp; (224) 391-4351</p>
        </div>
        <div style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #eee; text-align: center;">
          <p style="margin: 0; color: #999; font-size: 12px;">Royal Detailing · Franklin Park / Bensenville</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from:    'Royal Detailing <bookings@royal-detailing.org>',
      to:      booking.contact,
      subject: isConfirmed ? 'Booking Confirmed — Royal Detailing' : 'Booking Update — Royal Detailing',
      html:    statusHtml,
    });
  }

  res.json({ success: true, booking });
});

// ── ADMIN: Block a date ─────────────────────────────────────────
app.post('/admin/blocked-dates', requireAdmin, async (req, res) => {
  const { date, reason } = req.body;
  const { error } = await supabase
    .from('blocked_dates')
    .upsert([{ date, reason }], { onConflict: 'date' });

  if (error) return res.status(500).json({ success: false });
  res.json({ success: true });
});

// ── ADMIN: Unblock a date ───────────────────────────────────────
app.delete('/admin/blocked-dates/:date', requireAdmin, async (req, res) => {
  const { date } = req.params;
  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('date', date);

  if (error) return res.status(500).json({ success: false });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Royal Detailing server running on http://localhost:${PORT}`);
});
