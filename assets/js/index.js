/* =============================================
   index.js — Noi-Noi Paints
   ============================================= */


/* ── 1. GALLERY SLIDER ──────────────────────────────────────────────────── */
(function initGallerySlider() {
  var track   = document.getElementById('galleryTrack');
  var wrap    = document.getElementById('galleryWrap');
  var prevBtn = document.getElementById('galleryPrev');
  var nextBtn = document.getElementById('galleryNext');
  var dotsEl  = document.getElementById('galleryDots');

  if (!track) return;

  var slides  = track.querySelectorAll('.gallery-slide');
  var total   = slides.length;
  var current = 0;

  /* Build dots */
  for (var i = 0; i < total; i++) {
    (function (idx) {
      var dot = document.createElement('button');
      dot.className = 'gallery-dot' + (idx === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
      dot.addEventListener('click', function () { moveTo(idx); });
      dotsEl.appendChild(dot);
    })(i);
  }

  function moveTo(target) {
    target  = Math.max(0, Math.min(total - 1, target));
    current = target;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dotsEl.querySelectorAll('.gallery-dot').forEach(function (d, idx) {
      d.classList.toggle('active', idx === current);
    });
    prevBtn.style.opacity = current === 0           ? '0.35' : '1';
    nextBtn.style.opacity = current === total - 1   ? '0.35' : '1';
  }

  moveTo(0);

  prevBtn.addEventListener('click', function () { if (current > 0) moveTo(current - 1); });
  nextBtn.addEventListener('click', function () { if (current < total - 1) moveTo(current + 1); });

  /* Scroll wheel */
  var cooling = false;
  wrap.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (cooling) return;
    cooling = true;
    setTimeout(function () { cooling = false; }, 600);
    if      (e.deltaY > 0 && current < total - 1) moveTo(current + 1);
    else if (e.deltaY < 0 && current > 0)         moveTo(current - 1);
  }, { passive: false });
})();


/* ── 2. CONTACT FORM ────────────────────────────────────────────────────── */

const EMAILJS_SERVICE_ID  = 'service_45ewyso';
const EMAILJS_TEMPLATE_ID = 'template_v07u2h9';
const EMAILJS_PUBLIC_KEY  = 'h2Vm1a8ibjtUMY_Mj';

emailjs.init(EMAILJS_PUBLIC_KEY);

/* ---- Coupon codes ──────────────────────────────────────────────────────
 *  To add a code:    'NEWCODE': 'Description shown to customer',
 *  To remove a code: delete its line.
 * ----------------------------------------------------------------------- */
const VALID_CODES = {
  'NOINOIPAINTS10': '10% off your commission — applied!'
};

let couponApplied     = false;
let appliedCouponCode = '';

function applyCoupon() {
  var input    = document.getElementById('couponCode');
  var feedback = document.getElementById('couponFeedback');
  if (!input || !feedback) return;

  var code = input.value.trim().toUpperCase();

  if (!code) {
    feedback.textContent = 'Please enter a coupon code first.';
    feedback.className   = 'coupon-feedback coupon-error';
    couponApplied        = false;
    appliedCouponCode    = '';
    return;
  }

  if (VALID_CODES[code]) {
    feedback.textContent = '✓ ' + VALID_CODES[code];
    feedback.className   = 'coupon-feedback coupon-success';
    couponApplied        = true;
    appliedCouponCode    = code;
    input.disabled       = true;
  } else {
    feedback.textContent = '✗ Invalid code. Check the Promotions box for current codes.';
    feedback.className   = 'coupon-feedback coupon-error';
    couponApplied        = false;
    appliedCouponCode    = '';
    input.focus();
  }
}

document.addEventListener('DOMContentLoaded', function () {

  var form   = document.getElementById('contactForm');
  var btn    = document.getElementById('contactBtn');
  var status = document.getElementById('contactStatus');

  /* Coupon — Apply button */
  var applyBtn    = document.getElementById('applyCouponBtn');
  var couponInput = document.getElementById('couponCode');
  var feedback    = document.getElementById('couponFeedback');

  if (applyBtn) applyBtn.addEventListener('click', applyCoupon);

  /* Coupon — Enter key in coupon field triggers Apply */
  if (couponInput) {
    couponInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
    });

    /* Editing the field after a valid apply resets state */
    couponInput.addEventListener('input', function () {
      if (couponApplied) {
        couponApplied        = false;
        appliedCouponCode    = '';
        couponInput.disabled = false;
        feedback.textContent = 'Code cleared — click Apply to re-validate.';
        feedback.className   = 'coupon-feedback coupon-error';
      }
    });
  }

  /* Form submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name    = document.getElementById('name').value.trim();
    var email   = document.getElementById('email').value.trim();
    var message = document.getElementById('message').value.trim();

    /* Basic field validation */
    if (!name || !email || !message) {
      status.textContent = 'Please fill in all fields before sending.';
      status.className   = 'form-status error';
      return;
    }

    /* Coupon gate — block if typed but not validated */
    if (couponInput && couponInput.value.trim() && !couponApplied) {
      feedback.textContent = 'Please click Apply to validate your coupon, or clear the field to send without one.';
      feedback.className   = 'coupon-feedback coupon-error';
      couponInput.focus();
      return;
    }

    btn.disabled       = true;
    btn.textContent    = 'Sending…';
    status.textContent = '';
    status.className   = 'form-status';

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      name:         name,
      email:        email,
      message:      message,
      coupon_code:  couponApplied ? appliedCouponCode           : 'None',
      coupon_offer: couponApplied ? VALID_CODES[appliedCouponCode] : 'None'
    })
    .then(function () {
      status.textContent = "✓ Message sent! I'll be in touch soon.";
      status.className   = 'form-status success';
      form.reset();
      /* Reset coupon state after successful send */
      couponApplied        = false;
      appliedCouponCode    = '';
      if (couponInput) couponInput.disabled = false;
      if (feedback)    { feedback.textContent = ''; feedback.className = 'coupon-feedback'; }
    })
    .catch(function (err) {
      console.error('EmailJS error:', err.status, err.text);
      status.textContent = '❌ Something went wrong. Please try again or email owner.noinoipaints@gmail.com directly.';
      status.className   = 'form-status error';
    })
    .finally(function () {
      btn.disabled    = false;
      btn.textContent = 'Send Message';
    });
  });

});