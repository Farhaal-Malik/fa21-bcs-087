function validateForm() {
    let isValid = true;

    // Full Name Validation
    const fullName = document.getElementById('fullName');
    const fullNameError = document.getElementById('fullNameError');
    if (!fullName.value.match(/^[A-Za-z ]+$/)) {
        fullNameError.textContent = "Please enter a valid name (only alphabets allowed).";
        fullNameError.style.display = "block";
        isValid = false;
    } else {
        fullNameError.style.display = "none";
    }

    // Email Validation
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email.value.match(emailRegex)) {
        emailError.textContent = "Please enter a valid email address.";
        emailError.style.display = "block";
        isValid = false;
    } else {
        emailError.style.display = "none";
    }

    // Phone Number Validation
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    if (!phone.value.match(/^\d{10,15}$/)) {
        phoneError.textContent = "Phone number must be between 10 and 15 digits.";
        phoneError.style.display = "block";
        isValid = false;
    } else {
        phoneError.style.display = "none";
    }

    // Address Validation
    const address = document.getElementById('address');
    const addressError = document.getElementById('addressError');
    if (!address.value.trim()) {
        addressError.textContent = "Address is required.";
        addressError.style.display = "block";
        isValid = false;
    } else {
        addressError.style.display = "none";
    }

    // Credit Card Validation
    const creditCard = document.getElementById('creditCard');
    const creditCardError = document.getElementById('creditCardError');
    if (!creditCard.value.match(/^\d{16}$/)) {
        creditCardError.textContent = "Credit card number must be exactly 16 digits.";
        creditCardError.style.display = "block";
        isValid = false;
    } else {
        creditCardError.style.display = "none";
    }

    // Expiry Date Validation
    const expiryDate = document.getElementById('expiryDate');
    const expiryDateError = document.getElementById('expiryDateError');
    const today = new Date();
    const expiry = new Date(expiryDate.value + "-01");
    if (expiry <= today) {
        expiryDateError.textContent = "Expiry date must be a valid future date.";
        expiryDateError.style.display = "block";
        isValid = false;
    } else {
        expiryDateError.style.display = "none";
    }

    // CVV Validation
    const cvv = document.getElementById('cvv');
    const cvvError = document.getElementById('cvvError');
    if (!cvv.value.match(/^\d{3}$/)) {
        cvvError.textContent = "CVV must be exactly 3 digits.";
        cvvError.style.display = "block";
        isValid = false;
    } else {
        cvvError.style.display = "none";
    }

    // Prevent form submission if validation fails
    if (!isValid) {
        return false;
    }

    // Reset form upon successful submission
    alert("Form submitted successfully!");
    document.getElementById("checkoutForm").reset();
    return true;
}
