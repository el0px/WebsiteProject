/*
  ROYAL DETAILING — BACKEND SERVER
  Flow:
  1. Someone fills out the booking form and clicks submit
  2. The browser sends that data to THIS server (POST /book)
  3. This server formats it into an email
  4. Resend (resend.com) sends that email — works on Render unlike Gmail SMTP
  5. Server replies to the browser: success or error

  To run this server: node server.js
*/

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { Resend } = require('resend');

require('dotenv').config();

const app    = express();
const PORT   = process.env.PORT || 4000;
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

  const serviceLabel = serviceLabels[serviceType] || serviceType;
  const formattedDate = formatDate(date);

  // Format add-ons
  let addonsText = 'None';
  if (addons) {
    const addonsArray = Array.isArray(addons) ? addons : [addons];
    addonsText = addonsArray.join(', ');
  }

  // ── EMAIL 1: Notification to the business ───────────────────
  const businessHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden;">

      <!-- Header -->
      <div style="background: #5b21b6; padding: 28px 32px; display: flex; align-items: center; gap: 16px;">
        <div>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">ROYAL DETAILING</h1>
          <p style="color: #d8b4fe; margin: 4px 0 0; font-size: 14px;">New Booking Request</p>
        </div>
      </div>

      <!-- Body -->
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
          ${notes ? `
          <tr>
            <td style="padding: 12px 0; color: #666; font-size: 13px; vertical-align: top;">Notes</td>
            <td style="padding: 12px 0; color: #1a1a1a;">${notes}</td>
          </tr>` : ''}
        </table>

        <div style="margin-top: 28px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 13px;">Reply to this email or contact <strong>${contact}</strong> to confirm this appointment.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #eee;">
        <p style="margin: 0; color: #999; font-size: 12px;">Royal Detailing · Franklin Park / Bensenville · (872) 400-1491</p>
      </div>

    </div>
  `;

  // ── EMAIL 2: Confirmation to the customer ────────────────────
  const isEmail = contact.includes('@');
  const firstName = name.split(' ')[0];

  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden;">

      <!-- Header -->
      <div style="background: #5b21b6; padding: 28px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Royal Detailing</h1>
        <p style="color: #d8b4fe; margin: 8px 0 0; font-size: 15px;">Your car deserves the royal treatment.</p>
      </div>

      <!-- Body -->
      <div style="padding: 36px 32px; background: #ffffff; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">&#10003;</div>
        <h2 style="color: #1a1a1a; margin: 0 0 12px;">Request Received, ${firstName}!</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
          Thanks for reaching out! We've received your booking request and will confirm your appointment within <strong>24 hours</strong>.
        </p>

        <!-- Booking Summary Box -->
        <div style="background: #f5f3ff; border: 1px solid #ddd8f5; border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 28px;">
          <h4 style="margin: 0 0 14px; color: #5b21b6; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Request Summary</h4>
          <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Service:</strong> ${serviceLabel}</p>
          <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Vehicle:</strong> ${vehicle || 'Not specified'}</p>
          ${addonsText !== 'None' ? `<p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Add-ons:</strong> ${addonsText}</p>` : ''}
        </div>

        <p style="color: #555; font-size: 14px; margin: 0 0 8px;">Questions? Reach us directly:</p>
        <p style="color: #5b21b6; font-size: 16px; font-weight: 700; margin: 0;">(872) 400-1491 &nbsp;|&nbsp; (224) 391-4351</p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #eee; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 12px;">Royal Detailing · Franklin Park / Bensenville</p>
        <p style="margin: 4px 0 0; color: #bbb; font-size: 11px;">You're receiving this because you submitted a booking request.</p>
      </div>

    </div>
  `;

  try {
    // Send business notification
    await resend.emails.send({
      from:    'Royal Detailing Bookings <onboarding@resend.dev>',
      to:      process.env.EMAIL_TO,
      subject: `New Booking — ${name} | ${serviceLabel}`,
      html:    businessHtml,
    });
    console.log(`Booking notification sent for: ${name}`);

    // Send customer confirmation only if they gave an email address
    if (isEmail) {
      await resend.emails.send({
        from:    'Royal Detailing <onboarding@resend.dev>',
        to:      contact,
        subject: 'Booking Request Received — Royal Detailing',
        html:    confirmationHtml,
      });
      console.log(`Confirmation sent to customer: ${contact}`);
    }

    res.status(200).json({
      success: true,
      message: 'Booking request received! We will contact you within 24 hours.'
    });

  } catch (error) {
    console.error('Email send failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please call or text us directly.'
    });
  }

});

app.listen(PORT, () => {
  console.log(`Royal Detailing server running on http://localhost:${PORT}`);
});
