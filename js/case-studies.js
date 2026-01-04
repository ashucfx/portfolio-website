// Case Studies Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const caseCards = document.querySelectorAll('.case-card');
  const categories = document.querySelectorAll('.cases-category');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Hide all categories initially
      categories.forEach(cat => {
        cat.style.opacity = '0';
        cat.style.transform = 'translateY(-10px)';
        cat.style.pointerEvents = 'none';
        setTimeout(() => {
          cat.style.display = 'none';
        }, 150);
      });

      // Filter cards with animation
      caseCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        card.style.pointerEvents = 'none';

        setTimeout(() => {
          if (card.getAttribute('data-filter').includes(filter)) {
            card.style.display = 'block';
            card.parentElement.parentElement.style.display = 'block';
            card.parentElement.parentElement.style.opacity = '1';
            card.parentElement.parentElement.style.transform = 'translateY(0)';
            card.parentElement.parentElement.style.pointerEvents = 'auto';
            
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
              card.style.pointerEvents = 'auto';
            }, 10);
          } else {
            card.style.display = 'none';
          }
        }, 200);
      });
    });
  });

  // Fade in cards on page load
  caseCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });

  // Add transition styles to categories
  categories.forEach(cat => {
    cat.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  });
});
