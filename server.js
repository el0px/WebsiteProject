/*
  ROYAL DETAILING — BACKEND SERVER
  Post:
  1. Someone fills out the booking form and clicks submit
  2. The browser sends that data to THIS server (POST /book)
  3. This server formats it into an email
  4. Nodemailer sends that email to your cousin's inbox
  5. Server replies to the browser: success or error

  To run this server: node server.js
*/

// "require" is how Node.js imports libraries (like import in other languages)
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const path       = require('path');

// dotenv reads the .env file and loads those values into process.env
// This way customers email/password never appear in the actual code
require('dotenv').config();

// Create the Express app — this IS our server
const app  = express();
const PORT = process.env.PORT || 4000;


// Middleware is functions that run on every request before it hits our routes

// Allow the frontend (port 3000) to send requests to this server (port 4000)
app.use(cors());

// Tell Express to parse JSON bodies
app.use(express.json());

// Serve the static website files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// A "transporter" is Nodemailer's term for the email account it uses to send.
// Using Gmail here. The credentials come from the .env file.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // e.g. royaldetailing@gmail.com
    pass: process.env.EMAIL_PASS,  // Gmail App Password (not your regular password)
  },
});

// This is the endpoint the form submits to.
// app.post means: when the browser sends a POST request to /book, run this function.
app.post('/book', async (req, res) => {

  // req.body contains all the form data the browser sent
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

  // Basic validation — make sure required fields are present
  if (!name || !contact || !serviceType) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields.'
    });
  }

  // Format the add-ons into a readable string
  // addons comes in as an array (or single string if only one checked)
  let addonsText = 'None';
  if (addons) {
    const addonsArray = Array.isArray(addons) ? addons : [addons];
    addonsText = addonsArray.join(', ');
  }

  // Logo attachment — embedded inline so it shows up in both emails
  const logoAttachment = {
    filename: 'logo.png',
    path:     path.join(__dirname, 'images', 'logo.png'),
    cid:      'royaldetailinglogo' 
  };

  // ── EMAIL 1: Notification to the business ───────────────────
  const businessEmail = {
    from:        `"Royal Detailing Bookings" <${process.env.EMAIL_USER}>`,
    to:          process.env.EMAIL_TO,
    subject:     `📋 New Booking — ${name} | ${serviceType}`,
    attachments: [logoAttachment],
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden;">

        <!-- Header -->
        <div style="background: #5b21b6; padding: 28px 32px; display: flex; align-items: center; gap: 16px;">
          <img src="cid:royaldetailinglogo" alt="Royal Detailing" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3);" />
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
              <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${date || 'Not specified'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 12px 0; color: #666; font-size: 13px;">Time</td>
              <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">${time || 'Not specified'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 12px 0; color: #666; font-size: 13px;">Service</td>
              <td style="padding: 12px 0;">
                <span style="background: #5b21b6; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 13px;">${serviceType}</span>
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
            <p style="margin: 0; color: #92400e; font-size: 13px;">⚡ Reply to this email or contact <strong>${contact}</strong> to confirm this appointment.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #999; font-size: 12px;">Royal Detailing · Franklin Park / Bensenville · (872) 400-1491</p>
        </div>

      </div>
    `
  };

  // ── EMAIL 2: Confirmation to the customer ────────────────────
  // Only send if their contact info looks like an email address
  const isEmail = contact.includes('@');
  const confirmationEmail = {
    from:        `"Royal Detailing" <${process.env.EMAIL_USER}>`,
    to:          contact,
    subject:     `Booking Request Received — Royal Detailing 👑`,
    attachments: [logoAttachment],
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden;">

        <!-- Header -->
        <div style="background: #5b21b6; padding: 28px 32px; text-align: center;">
          <img src="cid:royaldetailinglogo" alt="Royal Detailing" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.3); margin-bottom: 14px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Royal Detailing</h1>
          <p style="color: #d8b4fe; margin: 8px 0 0; font-size: 15px;">Your car deserves the royal treatment.</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 32px; background: #ffffff; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <h2 style="color: #1a1a1a; margin: 0 0 12px;">Request Received, ${name.split(' ')[0]}!</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
            Thanks for reaching out! We've received your booking request and will confirm your appointment within <strong>24 hours</strong>.
          </p>

          <!-- Booking Summary Box -->
          <div style="background: #f5f3ff; border: 1px solid #ddd8f5; border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 28px;">
            <h4 style="margin: 0 0 14px; color: #5b21b6; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Request Summary</h4>
            <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Service:</strong> ${serviceType}</p>
            <p style="margin: 6px 0; color: #333; font-size: 14px;"><strong>Date:</strong> ${date || 'To be confirmed'}</p>
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
    `
  };

  try {
    // Send the business notification email
    await transporter.sendMail(businessEmail);
    console.log(`Booking notification sent for: ${name}`);

    // Send customer confirmation only if they gave an email address
    if (isEmail) {
      await transporter.sendMail(confirmationEmail);
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

// app.listen tells Node to start listening for incoming requests on the given port
app.listen(PORT, () => {
  console.log(`Royal Detailing server running on http://localhost:${PORT}`);
});
