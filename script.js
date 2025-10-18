// --- Star rating setup ---
const starRating = document.getElementById('starRating');
let currentRating = 0;
const totalStars = 5;

function renderStars(rating) {
  starRating.innerHTML = '';
  for (let i = 1; i <= totalStars; i++) {
    const star = document.createElement('span');
    star.classList.add('star');
    if (i <= rating) star.classList.add('selected');
    star.innerHTML = '\u2605';
    star.tabIndex = 0;
    star.setAttribute('role', 'button');
    star.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
    star.addEventListener('click', () => {
      currentRating = i;
      renderStars(currentRating);
    });
    star.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        currentRating = i;
        renderStars(currentRating);
      }
    });
    starRating.appendChild(star);
  }
}
renderStars(0);

// --- Form validation ---
const form = document.getElementById('feedbackForm');
const nameInput = document.getElementById('name');
const commentInput = document.getElementById('comment');
const charCount = document.getElementById('charCount');
const feedbackList = document.getElementById('feedbackList');
const nameError = document.getElementById('nameError');
const ratingError = document.getElementById('ratingError');
const emailInput = document.getElementById('email');
const mobileInput = document.getElementById('mobile');
const emailError = document.getElementById('emailError');
const mobileError = document.getElementById('mobileError');

// Character count logic
commentInput.addEventListener('input', () => {
  charCount.textContent = commentInput.value.length;
});

// Form submit
form.addEventListener('submit', async function(event) {
  event.preventDefault();
  // Clear errors
  nameError.textContent = '';
  ratingError.textContent = '';
  emailError.textContent = '';
  mobileError.textContent = '';

  // Validation
  let valid = true;
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const mobile = mobileInput.value.trim();
  const comment = commentInput.value.trim();
  if (!name) {
    nameError.textContent = 'Name is required.';
    valid = false;
  } else if (!/^[a-zA-Z0-9 _.'-]+$/.test(name)) {
    nameError.textContent = 'Name contains invalid characters.';
    valid = false;
  }
  if (!email) {
    emailError.textContent = 'Email is required.';
    valid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    emailError.textContent = 'Please enter a valid email address.';
    valid = false;
  }
  if (!mobile) {
    mobileError.textContent = 'Mobile number is required.';
    valid = false;
  } else if (!/^[0-9+\-() ]{8,15}$/.test(mobile)) {
    mobileError.textContent = 'Please enter a valid mobile number.';
    valid = false;
  }
  if (currentRating === 0) {
    ratingError.textContent = 'Rating is required.';
    valid = false;
  }
  if (comment.length > 300) {
    // Extra guard, UI limits but may paste more
    commentInput.value = comment.slice(0, 300);
    charCount.textContent = '300';
  }
  if (!valid) return;

  const feedback = {
    name,
    email,
    mobile,
    rating: currentRating,
    comment,
    date: new Date().toISOString(),
  };

  // --- Send to n8n webhook ---
  try {
    await fetch('https://debashish03.app.n8n.cloud/webhook/8d7b7abc-9f97-4f78-a56a-e383123ecadb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });
  } catch (err) {
    // Optional: show error to user, or silently log
    console.error('Failed to send feedback to n8n webhook:', err);
  }

  saveFeedback(feedback);
  addFeedbackEntry(feedback);
  form.reset();
  renderStars(0);
  charCount.textContent = '0';
  currentRating = 0;
});

// --- Local Storage Logic ---
function saveFeedback(feedback) {
  let feedbacks = JSON.parse(localStorage.getItem('feedbackList') || '[]');
  feedbacks.unshift(feedback);
  localStorage.setItem('feedbackList', JSON.stringify(feedbacks));
}

function loadFeedbacks() {
  feedbackList.innerHTML = '';
  let feedbacks = JSON.parse(localStorage.getItem('feedbackList') || '[]');
  feedbacks.forEach(addFeedbackEntry);
}
function addFeedbackEntry(feedback) {
  const li = document.createElement('li');
  li.className = "feedback-entry";
  const emailMasked = feedback.email ? (feedback.email.replace(/(.{2})(.*)(?=@)/,
    (m,p1,p2)=> p1+"*".repeat(p2.length))) : '';
  const mobileMasked = feedback.mobile ? feedback.mobile.replace(/.(?=.{4})/g, '*') : '';
  li.innerHTML = `
    <div class="entry-header">
      <span class="entry-name">${escapeHTML(feedback.name)}</span>
      <span class="entry-rating">${'\u2605'.repeat(feedback.rating)}<span class="star" style="color:#e1e1e1;">${'\u2605'.repeat(totalStars-feedback.rating)}</span></span>
    </div>
    <div class="entry-contact" style="color:#888;font-size:0.93em;">
      ${feedback.email ? `Email: ${escapeHTML(emailMasked)}` : ''} ${feedback.mobile ? `| Mobile: ${escapeHTML(mobileMasked)}` : ''}
    </div>
    <div class="entry-comment">${escapeHTML(feedback.comment)}</div>
  `;
  feedbackList.appendChild(li);
}

// Defend against XSS by escaping HTML
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, function(m) {
    return {
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[m];
  });
}

// --- App Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  loadFeedbacks();
});

// Modal close (if needed)
document.querySelector('.close-btn').addEventListener('click', () => {
  alert('Modal closed. (Implement custom close logic if embedding in modal)');
});

// Help Center modal logic
const helpCenterModal = document.getElementById('helpCenterModal');
const helpCenterLink = document.getElementById('helpCenterLink');
const modalCloseBtn = document.getElementById('modalCloseBtn');

helpCenterLink.addEventListener('click', function(event) {
  event.preventDefault();
  helpCenterModal.style.display = 'flex';
});
modalCloseBtn.addEventListener('click', function() {
  helpCenterModal.style.display = 'none';
});
helpCenterModal.addEventListener('click', function(e) {
  if (e.target === helpCenterModal) {
    helpCenterModal.style.display = 'none';
  }
});

