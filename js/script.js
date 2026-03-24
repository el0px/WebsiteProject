/* ============================================================
   ROYAL DETAILING — JAVASCRIPT

   JavaScript makes the page interactive. Without it, the page
   looks good but nothing responds to user actions.

   Here's what this file handles:
   1. Navbar background change on scroll
   2. Mobile hamburger menu open/close
   3. Smooth close menu when a nav link is clicked
   4. Service package tab switching
   5. Booking form submission handling
   6. Set minimum date on the date picker to today
============================================================ */


/* ============================================================
   1. NAVBAR — add background when user scrolls

   "document.getElementById" finds an HTML element by its id.
   "window.addEventListener('scroll', ...)" runs a function
   every time the user scrolls the page.

   When they scroll more than 50px down, we add the 'scrolled'
   class to the navbar — our CSS then applies the dark background.
============================================================ */

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  // window.scrollY = how many pixels the user has scrolled down
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


/* ============================================================
   2. MOBILE HAMBURGER MENU

   On mobile, the nav links are hidden. Clicking the hamburger
   button toggles the 'open' class on both the button and the
   nav links — our CSS uses that class to show/hide the menu.

   "classList.toggle" adds the class if it's missing, removes
   it if it's already there. Basically a flip-flop.
============================================================ */

const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');

  // Prevent scrolling while mobile menu is open
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});


/* ============================================================
   3. CLOSE MOBILE MENU WHEN A LINK IS CLICKED

   "document.querySelectorAll" finds ALL elements matching
   a CSS selector. Here we grab every nav link.

   "forEach" loops over each one and adds a click listener
   so clicking any link closes the menu.
============================================================ */

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});


/* ============================================================
   4. SERVICE PACKAGE TABS

   When a tab button is clicked:
   - Remove 'active' from all tab buttons
   - Add 'active' to the clicked button
   - Hide all package grids
   - Show the grid that matches the clicked tab

   The "data-tab" attribute on each button tells us which
   grid to show (e.g., data-tab="full" → show #tab-full).
============================================================ */

const tabBtns    = document.querySelectorAll('.tab-btn');
const packageGrids = document.querySelectorAll('.packages-grid');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {

    // Remove active from all buttons
    tabBtns.forEach(b => b.classList.remove('active'));

    // Add active to the clicked button
    btn.classList.add('active');

    // Hide all grids
    packageGrids.forEach(grid => grid.classList.remove('active'));

    // Show the matching grid
    // btn.dataset.tab reads the data-tab="..." attribute value
    const targetTab = document.getElementById('tab-' + btn.dataset.tab);
    if (targetTab) {
      targetTab.classList.add('active');
    }

  });
});


/* ============================================================
   5. BOOKING FORM SUBMISSION

   When the form is submitted, we:
   - Prevent the default behavior (which would refresh the page)
   - Check that required fields are filled
   - Show the success message
   - Reset the form
============================================================ */

const bookingForm  = document.getElementById('booking-form');
const formSuccess  = document.getElementById('form-success');
const submitButton = bookingForm.querySelector('.btn-submit');

bookingForm.addEventListener('submit', async (event) => {

  // Stop the form from refreshing the page
  event.preventDefault();

  // Show loading state on button
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitButton.disabled = true;

  // Collect all form field values into an object
  // FormData grabs every named input in the form automatically
  const formData     = new FormData(bookingForm);
  const bookingData  = {};

  // Convert FormData into a plain object
  // Checkboxes (add-ons) can have multiple values, so handle those specially
  formData.forEach((value, key) => {
    if (bookingData[key]) {
      // Key already exists — turn it into an array
      bookingData[key] = [].concat(bookingData[key], value);
    } else {
      bookingData[key] = value;
    }
  });

  try {
    // fetch() sends an HTTP request from the browser to our server
    // 'POST' means we're sending data (vs GET which just requests data)
    // We send the data as JSON (a standard data format)
    // In production (Render), frontend and backend run on the same server
    // so we use a relative URL. Locally we still hit port 4000.
    const apiUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:4000/book'
      : '/book';

    // After 8 seconds, update the button text so the user knows we're still working
    // (Render free tier can take ~30-60 seconds to wake up from sleep)
    const slowWarningTimer = setTimeout(() => {
      if (submitButton.disabled) {
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Almost there...';
      }
    }, 8000);

    // AbortController lets us cancel the fetch if it takes too long
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 90000); // 90 second timeout

    const response = await fetch(apiUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(bookingData),
      signal:  controller.signal,
    });

    clearTimeout(slowWarningTimer);
    clearTimeout(timeoutId);

    // Parse the JSON response our server sends back
    const result = await response.json();

    if (result.success) {
      // Success — hide the button, show success message
      submitButton.style.display = 'none';
      formSuccess.classList.add('visible');
      bookingForm.reset();
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Reset after 6 seconds
      setTimeout(() => {
        formSuccess.classList.remove('visible');
        submitButton.style.display = 'flex';
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }, 6000);

    } else {
      // Server responded but with an error
      alert(result.message || 'Something went wrong. Please call us directly.');
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }

  } catch (error) {
    // Network error or timeout — couldn't reach the server
    if (error.name === 'AbortError') {
      alert('The server is taking too long to respond. Please try again in a moment, or call/text us directly at (872) 400-1491.');
    } else {
      alert('Could not connect to the server. Please call or text us directly at (872) 400-1491.');
    }
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }

});


/* ============================================================
   6. DATE PICKER — set minimum date to today

   We don't want people booking in the past, so we set the
   minimum selectable date to today's date.

   toISOString() gives us a string like "2025-03-23T12:00:00Z"
   .split('T')[0] grabs just the date part: "2025-03-23"
   That format is what the date input expects.
============================================================ */

const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}


/* ============================================================
   BONUS: Highlight the active nav section on scroll

   As the user scrolls, we figure out which section is
   currently in view and highlight the matching nav link.
============================================================ */

const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
  threshold: 0.3,       // trigger when 30% of a section is visible
  rootMargin: '-80px 0px -20% 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');

      // Remove active styling from all nav links
      allNavLinks.forEach(link => link.style.color = '');

      // Highlight the nav link matching the current section
      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) {
        activeLink.style.color = '#9f60f5';   /* var(--purple-light) */
      }
    }
  });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));
