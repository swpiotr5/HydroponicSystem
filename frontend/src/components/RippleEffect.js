import React, { useEffect } from 'react';

const RippleEffect = ({ darkMode }) => {
  useEffect(() => {
    const createRipple = (e) => {
      const ripple = document.createElement('div');
      ripple.classList.add('ripple');
      if (darkMode) ripple.classList.add('ripple-dark');
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      e.currentTarget.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 1000);
    };

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.addEventListener('click', createRipple);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('click', createRipple);
      });
    };
  }, [darkMode]);

  return null;
};

export default RippleEffect;
