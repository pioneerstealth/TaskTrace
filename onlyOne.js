// Function to allow only one checkbox to be selected
function onlyOne(checkbox) {
    const checkboxes = document.getElementsByName('rating');
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false;
    });
}
// Make the function globally accessible
window.onlyOne = onlyOne;
