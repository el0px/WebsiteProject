# Royal Detailing — Booking Website

A full-stack booking and business management web application built for Royal Detailing, a mobile auto detailing business based in Franklin Park / Bensenville, IL.

Live site: [royal-detailing.org](https://royal-detailing.org)

---

## Features

- **Online booking form** — customers select a service, date, vehicle info, and add-ons
- **Automated email notifications** — confirmation email sent to the customer instantly, notification email sent to the business on every new booking
- **SMS alerts** — business receives a text message via Twilio on every new booking
- **Admin panel** — password-protected dashboard to view all bookings, confirm or reject appointments, and block unavailable dates
- **Blocked date system** — admin can block dates which are hidden from the booking calendar in real time
- **Customer status emails** — customers receive a confirmation or rejection email when the admin acts on their booking
- **Supabase database** — all bookings and blocked dates stored and retrieved from a cloud database

---

## Tech Stack

**Frontend**
- HTML, CSS, JavaScript

**Backend**
- Node.js + Express
- REST API

**Database**
- Supabase (PostgreSQL)

**Email**
- Resend API

**SMS**
- Twilio

**Deployment**
- Cloud-hosted with custom domain (royal-detailing.org)

---

## Project Structure

```
WebsiteProject/
├── index.html        # Main booking page
├── admin.html        # Admin dashboard
├── css/
│   └── style.css     # Stylesheet
├── js/
│   └── script.js     # Frontend logic
├── images/
│   └── logo.png      # Business logo
├── server.js         # Express backend
├── package.json
└── .env              # Environment variables (not committed)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/book` | Submit a new booking |
| GET | `/blocked-dates` | Get all blocked dates |
| GET | `/admin/bookings` | Get all bookings (admin) |
| PATCH | `/admin/bookings/:id` | Confirm or reject a booking (admin) |
| POST | `/admin/blocked-dates` | Block a date (admin) |
| DELETE | `/admin/blocked-dates/:date` | Unblock a date (admin) |

---

## Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory using the template below:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
EMAIL_TO=business_email@example.com
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
BUSINESS_PHONE=business_phone_number
ADMIN_PASSWORD=your_admin_password
PORT=4000
```

3. Start the server:

```bash
npm start
```

4. Visit `http://localhost:4000`

---

## Booking Flow

1. Customer fills out the booking form on the frontend
2. Form data is sent to `POST /book` on the backend
3. Backend checks if the requested date is blocked
4. Booking is saved to the Supabase database
5. Customer receives an automated confirmation email via Resend
6. Business receives a notification email and SMS via Twilio
7. Admin logs into `/admin` to confirm or reject the booking
8. Customer receives a follow-up email with the booking status

---

Built by Ethan Lopez
