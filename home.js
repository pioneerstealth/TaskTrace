document.addEventListener('DOMContentLoaded', function() {
    const picHead = document.querySelector('.pic-head');

    // Function to load pic-head div with a delay
    function loadPicHeadWithDelay() {
        setTimeout(() => {
            picHead.classList.add('visible');
            // Optionally add a loaded class to container or pic-head itself
            picHead.parentElement.classList.add('loaded'); // Add loaded class to container
        }, 200); // Adjust delay (300ms here) as needed
    }

    // Call the function to load pic-head div with delay
    loadPicHeadWithDelay();
});

document.addEventListener('DOMContentLoaded', function() {
    const flexHead = document.querySelector('.head');

    // Function to load pic-head div with a delay
    function loadPicHeadWithDelay() {
        setTimeout(() => {
            flexHead.classList.add('visible');
            // Optionally add a loaded class to container or pic-head itself
            flexHead.parentElement.classList.add('loaded'); // Add loaded class to container
        }, 400); // Adjust delay (300ms here) as needed
    }

    // Call the function to load pic-head div with delay
    loadPicHeadWithDelay();
});


