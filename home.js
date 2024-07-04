window.addEventListener('load', function() {
    const tasktrace = document.querySelector('.tasktrace');
    tasktrace.style.visibility = 'visible';

    // Remove background gradient and make text color white after animation ends
    tasktrace.addEventListener('animationend', function() {
        tasktrace.classList.add('visible');
    });
});

const userinfo = document.getElementById('user');
const info = document.getElementById('info');

userinfo.addEventListener('click', function(event) {
    event.preventDefault();
    info.style.opacity = '1';
    info.style.visibility = 'visible'; // Ensure it's visible
});

// Hide info when clicking outside of it
document.addEventListener('click', function(event) {
    const isClickInsideInfo = info.contains(event.target);
    const isClickOnUser = userinfo.contains(event.target);

    if (!isClickInsideInfo && !isClickOnUser) {
        info.style.opacity = '0';
        info.style.visibility = 'hidden'; // Optional: hide it completely
    }
});
