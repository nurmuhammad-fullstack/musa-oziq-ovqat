document.addEventListener('DOMContentLoaded', function() {
  // Load translations FIRST
  const uzbekScript = document.createElement('script');
  uzbekScript.src = 'uzbek_translations.js';
  document.head.appendChild(uzbekScript);
  
  uzbekScript.onload = function() {
    const appScript = document.createElement('script');
    appScript.src = 'script.js';
    document.head.appendChild(appScript);
  };
  
  console.log('Init loaded');
});
