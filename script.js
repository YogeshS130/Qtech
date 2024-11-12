document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('enquiryForm');
    const submitButton = form.querySelector('.submit-button');
    const loadingSpinner = form.querySelector('.loading-spinner');
    const buttonText = form.querySelector('.button-text');
    const successMessage = document.getElementById('formSuccess');
    const errorMessage = document.getElementById('formError');

    // Form validation functions with more comprehensive checks
    const validators = {
        fullName: (value) => {
            const nameRegex = /^[a-zA-Z\s]{2,50}$/;
            return nameRegex.test(value) ? '' : 'Please enter a valid name (2-50 characters, letters only)';
        },
        email: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? '' : 'Please enter a valid email address';
        },
        phone: (value) => {
            // Allows for optional country code and different formats
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
            return phoneRegex.test(value) ? '' : 'Please enter a valid phone number';
        },
        course: (value) => {
            return value ? '' : 'Please select a course';
        },
        message: (value) => {
            return value.trim().length >= 10 ? '' : 'Message must be at least 10 characters long';
        }
    };

    // Debounce function to limit validation frequency
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Hide messages when user starts typing
    form.addEventListener('input', debounce(() => {
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }, 300));

    // Add input event listeners for real-time validation
    Object.keys(validators).forEach(fieldName => {
        const input = form.querySelector(`#${fieldName}`);
        const errorSpan = input.parentElement.querySelector('.error-message');

        input.addEventListener('input', debounce(() => {
            const error = validators[fieldName](input.value);
            errorSpan.textContent = error;
            errorSpan.style.display = error ? 'block' : 'none';
            input.setCustomValidity(error);
            
            // Add/remove success/error classes
            input.classList.remove('valid', 'invalid');
            input.classList.add(error ? 'invalid' : 'valid');
        }, 300));
    });

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields before submission
        let hasErrors = false;
        Object.keys(validators).forEach(fieldName => {
            const input = form.querySelector(`#${fieldName}`);
            const error = validators[fieldName](input.value);
            if (error) {
                hasErrors = true;
                input.setCustomValidity(error);
            }
        });

        if (hasErrors) {
            return;
        }

        // Hide any existing messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';

        // Disable submit button and show loading spinner
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'block';

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message
                successMessage.style.display = 'block';
                form.reset(); // Clear the form
                
                // Reset validation states
                Object.keys(validators).forEach(fieldName => {
                    const input = form.querySelector(`#${fieldName}`);
                    input.classList.remove('valid', 'invalid');
                });

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            // Show error message
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            // Re-enable submit button and hide loading spinner
            submitButton.disabled = false;
            buttonText.style.display = 'block';
            loadingSpinner.style.display = 'none';
        }
    });

    // Add keypress handler for Enter key
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
            const currentIndex = inputs.indexOf(e.target);
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            }
        }
    });
});