function calculate() {
    // height, weight, and age values
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    
    //  if height and weight are provided
    if (!height || !weight || isNaN(height) || isNaN(weight)) {
        showModal('Please enter valid height and weight values!');
        return;
    }

    //  BMI
    const bmi = (weight / ((height / 100) * (height / 100))).toFixed(2);

    // result 
    const result = document.getElementById('result');
    const comment = document.querySelector('.comment');
    
    // category and color
    let category = '';
    let color = '';

    // BMI category and corresponding styles
    if (bmi < 18.5) {
        category = 'Underweight';
        color = 'var(--underweight)';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        category = 'Healthy';
        color = 'var(--healthy)';
    } else if (bmi >= 25 && bmi <= 29.9) {
        category = 'Overweight';
        color = 'var(--overweight)';
    } else if (bmi >= 30) {
        category = 'Obese';
        color = 'var(--obese)';
    }

    // BMI and corresponding category
    result.innerText = bmi;
    comment.innerText = `You are ${category}`;
    comment.style.display = 'block';
    comment.style.borderColor = color;
    result.style.color = color;
}

// Modal functionality for validation messages
function showModal(message) {
    const modal = document.getElementById("myModal");
    const modalText = document.getElementById("modalText");
    
    modalText.innerText = message;
    modal.classList.add("modal-wrong"); // red border for the error
    modal.style.display = "block";

    const closeModal = document.querySelector(".close");
    closeModal.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}
