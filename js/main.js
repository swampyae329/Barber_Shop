// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }

  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when clicking links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // 2. Navbar Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 3. Category Filter for Services
  const filterBtns = document.querySelectorAll('.filter-btn');
  const serviceCards = document.querySelectorAll('.service-card[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      serviceCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // 4. Booking Form Submission Handling with Cloudflare Worker
  const bookingForm = document.getElementById('bookingForm');
  const feedback = document.getElementById('formFeedback');

  if (bookingForm && feedback) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Submit ခလုတ်ကို ချက်ချင်း Disable လုပ်ပြီး Loading ပြခြင်း
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ပေးပို့နေပါသည်...';

      // Input Values ရယူခြင်း
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const serviceSelect = document.getElementById('service');
      const service = serviceSelect.options[serviceSelect.selectedIndex].text;
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;
      const noteInput = document.getElementById('note');
      const note = noteInput && noteInput.value.trim() ? noteInput.value.trim() : 'မရှိပါ';

      // Cloudflare Worker URL (Token ကို Worker Secret ထဲတွင် လုံခြုံစွာ ထည့်ထားပြီးဖြစ်ပါသည်)
      const workerUrl = "https://barber-booking-api.swampyaeaung085.workers.dev";

      try {
        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            phone: phone,
            service: service,
            date: date,
            time: time,
            note: note
          })
        });

        const data = await response.json();

        if (data.ok) {
          feedback.className = 'form-feedback success';
          feedback.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
          feedback.style.border = '1px solid #22c55e';
          feedback.style.color = '#4ade80';
          feedback.innerHTML = `
            <strong><i class="fa-solid fa-circle-check"></i> Booking အောင်မြင်ပါသည်!</strong><br>
            ကျေးဇူးတင်ပါတယ် <b>${name}</b>။ လူကြီးမင်း ရွေးချယ်ထားသော (${date} - ${time}) အတွက် ဖုန်းနံပါတ် <b>${phone}</b> သို့ မကြာမီ ဆိုင်မှ ပြန်လည်ဆက်သွယ် အတည်ပြုပေးပါမည်။
          `;
          bookingForm.reset();
        } else {
          throw new Error(data.description || 'API Error');
        }
      } catch (error) {
        feedback.className = 'form-feedback';
        feedback.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
        feedback.style.border = '1px solid #ef4444';
        feedback.style.color = '#f87171';
        feedback.innerHTML = `
          <strong><i class="fa-solid fa-triangle-exclamation"></i> ချိတ်ဆက်မှု မအောင်မြင်ပါ။</strong><br>
          လိုင်းချို့ယွင်းချက်ကြောင့် ဖြစ်နိုင်ပါသဖြင့် ဆိုင်ဖုန်းသို့ တိုက်ရိုက်ဆက်သွယ်ပြီး Booking ရယူပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။
        `;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        feedback.classList.remove('hidden');
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
});
