document.addEventListener('DOMContentLoaded',function(){
  document.body.classList.add('page-loaded');

  // Theme toggle
  const root=document.documentElement;
  const toggle=document.getElementById('theme-toggle');
  const stored=localStorage.getItem('theme');
  if(stored==='dark') document.documentElement.setAttribute('data-theme','dark');
  toggle?.addEventListener('click',()=>{
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark? '':'dark');
    localStorage.setItem('theme', isDark? 'light':'dark');
  });

  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  hamburger?.addEventListener('click', ()=>{
    const isOpen = hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  // Close mobile menu when clicking a link
  mobileNav?.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', ()=>{
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
  
  // Add scrolled class to header on scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 50) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');
  });

  // Metrics counter
  const counters=document.querySelectorAll('.metric-value[data-target]');
  const runCount=(el,target)=>{
    let start=0;const dur=900;const step=Math.max(1,Math.floor(target/30));
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const iv=setInterval(()=>{
      start+=step;
      if(start>=target){
        el.textContent = target.toFixed(decimals) + suffix;
        clearInterval(iv);
      } else {
        el.textContent = start.toFixed(decimals) + suffix;
      }
    },Math.floor(dur/30));
  };
  // Only run counters when metrics are visible
  const metricsSection=document.querySelector('.metrics');
  if(metricsSection && counters.length){
    const mIo=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          counters.forEach(c=>runCount(c,parseFloat(c.dataset.target || '0')));
          mIo.unobserve(metricsSection);
        }
      });
    },{threshold:0.3});
    mIo.observe(metricsSection);
  }

  // Fade-in sections on scroll (lightweight)
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}});
  },{root:null,threshold:0.12});
  document.querySelectorAll('.fade-section').forEach(s=>io.observe(s));

  // Simple lightweight skill radar using SVG if present
  function drawRadar(){
    const radar=document.getElementById('skill-radar');
    if(!radar) return;
    const values=(radar.dataset.values||'60,50,70,55,65,50').split(',').map(v=>+v);
    const pts=[];const cx=75,cy=75,r=60; const n=values.length;
    values.forEach((v,i)=>{const angle=(Math.PI*2/n)*i - Math.PI/2;const rad = (v/100)*r;pts.push([cx+Math.cos(angle)*rad, cy+Math.sin(angle)*rad])});
    const poly=radar.querySelector('polygon'); if(poly) poly.setAttribute('points', pts.map(p=>p.join(',')).join(' '));
    // animate polygon stroke/fill when visible
    const pParent = radar.parentElement;
    const ro = new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){poly.style.transition='all 700ms ease';poly.style.fillOpacity='0.18';poly.style.strokeWidth='1.5';ro.unobserve(pParent)}});},{threshold:0.2});
    ro.observe(pParent);
  }
  drawRadar();

  // Timeline animation observer
  const timelineItems = document.querySelectorAll('.timeline-item');
  if(timelineItems.length){
    const tIo = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          // add in-view and stagger reveal of child elements
          e.target.classList.add('in-view');
          const body = e.target.querySelector('.timeline-body');
          if(body){
            const children = Array.from(body.children);
            children.forEach((child, idx)=>{
              child.style.opacity = 0;
              child.style.transform = 'translateY(10px)';
              setTimeout(()=>{
                child.style.transition = 'opacity 420ms ease, transform 420ms ease';
                child.style.opacity = 1;
                child.style.transform = 'none';
              }, idx * 120);
            });
          }
          tIo.unobserve(e.target);
        }
      });
    },{threshold:0.14});
    timelineItems.forEach(i=>tIo.observe(i));
  }

  // Contact form submission with Formspree
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('loader');
    const statusEl = document.getElementById('form-status');
    const fsEndpoint = contactForm.dataset.formspreeEndpoint;

    // Client-side validation
    function validateForm(){
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = document.getElementById('message').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if(!name){
        statusEl.textContent = 'Please enter your full name.';
        return false;
      }
      if(!email || !emailRegex.test(email)){
        statusEl.textContent = 'Please enter a valid email address.';
        return false;
      }
      if(phone && phone.length < 10){
        statusEl.textContent = 'Please enter a valid phone number.';
        return false;
      }
      if(!message){
        statusEl.textContent = 'Please enter your message.';
        return false;
      }
      return true;
    }

    contactForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      statusEl.textContent = '';
      if(!validateForm()) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      loader.style.display = 'block';

      const formData = new FormData(contactForm);
      const payload = {};
      formData.forEach((v,k)=>payload[k]=v);

      try{
        const res = await fetch(fsEndpoint, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload)
        });
        if(res.ok){
          statusEl.textContent = 'Thanks for reaching out — we’ll get back to you shortly.';
          contactForm.reset();
        } else {
          throw new Error('Submission failed');
        }
      } catch(err){
        statusEl.textContent = 'Submission failed. Please email directly to founder@theripplenexus.com';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        loader.style.display = 'none';
        setTimeout(()=>{statusEl.textContent=''},6000);
      }
    });
  }
});
