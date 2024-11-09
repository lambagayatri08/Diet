const stressEvaluationQuestions = [
  {
    id: 1,
    question: "How often do you feel overwhelmed by tasks or responsibilities?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 2,
    question: "Do you find it difficult to relax after a long day?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 3,
    question: "How frequently do you experience irritability or mood swings?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 4,
    question: "How often do you have trouble sleeping due to stress or anxiety?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 5,
    question: "Do you feel you are losing control over your personal or work life?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 6,
    question: "How often do you struggle with concentration or staying focused?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 7,
    question: "How frequently do you experience physical symptoms like headaches or muscle tension?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 8,
    question: "How often do you feel anxious or nervous without a specific cause?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 9,
    question: "Do you feel isolated or disconnected from others due to stress?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 10,
    question: "How often do you feel fatigued or lack energy during the day?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
];

let count = 0;
let scores = [];
let totalScore = 0;

function updateProgressBar() {
  const progressBar = document.getElementById("progressBar");
  const progressPercentage = ((count ) / stressEvaluationQuestions.length) * 100;
  progressBar.style.width = progressPercentage + "%";

  progressBar.textContent=progressPercentage===0?"": Math.round(progressPercentage) + "% done";

  
}

function nextQuestion(event) {
  event.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  const selectedAnswer = document.querySelector(`input[name="question${stressEvaluationQuestions[count].id}"]:checked`);
  
  if (selectedAnswer) {
    scores[count] = getScore(selectedAnswer.value);
    count++;
    
    if (count < stressEvaluationQuestions.length) {
      document.getElementById("stressForm").innerHTML = "";
      addQuestion();
      updateProgressBar();
    } else {
      submitForm();
    }
  } else {
    alert("Please select an option before proceeding.");
  }
}

function previousQuestion(event) {
  event.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  if (count > 0) {
    count--;
    document.getElementById("stressForm").innerHTML = "";
    addQuestion();
    updateProgressBar();
  }
}

function addQuestion() {
  if (count >= stressEvaluationQuestions.length) return;
  
  let question = stressEvaluationQuestions[count];
  const form = document.getElementById("stressForm");

  const questionDiv = document.createElement("div");
  questionDiv.classList.add("question");

  const questionText = document.createElement("p");
  questionText.textContent = count + 1 + ". " + question.question;

  questionDiv.appendChild(questionText);

  const questionOptions = document.createElement("div");
  questionOptions.classList.add("option-div");
  questionDiv.appendChild(questionOptions);

  question.options.forEach((option) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `question${question.id}`;
    input.value = option;
    
    if (scores[count] === getScore(option)) {
      input.checked = true;
    }

    label.appendChild(input);
    label.append(option);
    questionOptions.appendChild(label);
  });

  form.appendChild(questionDiv);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  let nextBtn = document.createElement("button");
  nextBtn.classList.add('next-btn');
  nextBtn.innerHTML = count == stressEvaluationQuestions.length - 1 ? "Submit" : `NEXT`;
  nextBtn.innerHTML+=`<svg
    id="arrow-horizontal"
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="10"
    viewBox="0 0 46 16"
  >
    <path
      id="Path_10"
      data-name="Path 10"
      d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
      transform="translate(30)"
    ></path>
  </svg>`;
  nextBtn.onclick = count == stressEvaluationQuestions.length - 1 ? submitForm : nextQuestion;
  buttonContainer.appendChild(nextBtn);

  if (count > 0) {
    let prevBtn = document.createElement("button");
    prevBtn.classList.add('prev-btn');
    prevBtn.innerHTML = `<svg
    id="arrow-horizontal"
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="10"
    viewBox="0 0 46 16"
  >
    <path
      id="Path_10"
      data-name="Path 10"
      d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
      transform="translate(30)"
    ></path>
  </svg> PREVIOUS`;
    prevBtn.onclick = previousQuestion;
    buttonContainer.appendChild(prevBtn);
  }

  form.appendChild(buttonContainer);
}


function getScore(answer) {
  switch (answer) {
    case "Never":
      return 1;
    case "Rarely":
      return 2;
    case "Sometimes":
      return 3;
    case "Often":
      return 4;
    case "Always":
      return 5;
    default:
      return 0;
  }
}

function submitForm() {
  event.preventDefault();
  document.getElementById("progressContainer").style.display = "none";
  document.getElementById("stressForm").innerHTML = "";

  totalScore = scores.reduce((sum, score) => sum + score, 0);

  const resultMessage = document.createElement("p");
  resultMessage.textContent = "Your total stress score is: " + totalScore;

  const resultDiv = document.createElement("div");
  resultDiv.appendChild(resultMessage);

  let tips = [];

  if (totalScore <= 20) {
    resultMessage.textContent += "\nYour stress level seems to be low.";
    tips = [
      "Maintain a healthy lifestyle by exercising regularly.",
      "Continue practicing mindfulness and relaxation techniques.",
      "Stay organized and manage your time efficiently.",
      "Keep a positive outlook and focus on things that bring you joy.",
      "Maintain a strong social network to share your thoughts and feelings."
    ];
  } else if (totalScore <= 35) {
    resultMessage.textContent += "\nYou might be experiencing moderate stress.";
    tips = [
      "Identify your stress triggers and work to minimize them.",
      "Take regular breaks during work to relax and recharge.",
      "Practice deep breathing exercises to reduce tension.",
      "Ensure you're getting adequate sleep to combat stress.",
      "Find a hobby or activity you enjoy to unwind after a stressful day."
    ];
  } else {
    resultMessage.textContent += "\nYour stress level seems to be high. It might be a good idea to seek support.";
    tips = [
      "Talk to a counselor or therapist to discuss your stress.",
      "Practice meditation or yoga to help manage anxiety.",
      "Consider making changes to your workload or schedule to reduce pressure.",
      "Stay connected with supportive friends and family.",
      "Ensure you're eating a balanced diet to help maintain your energy levels."
    ];
  }

  const tipsDiv = document.createElement("div");
  tipsDiv.classList.add('tips-div')
  const tipsTitle = document.createElement("h3");
  tipsTitle.textContent = "Here are some tips to help manage your stress:";
  tipsDiv.appendChild(tipsTitle);

  const tipsList = document.createElement("ul");
  tips.forEach((tip) => {
    const listItem = document.createElement("li");
    listItem.textContent = tip;
    tipsList.appendChild(listItem);
  });
  tipsDiv.appendChild(tipsList);

  resultDiv.appendChild(tipsDiv);

  document.getElementById("stressForm").appendChild(resultDiv);

  const refillBtn = document.createElement("button");
  refillBtn.classList.add('refill-btn');
  refillBtn.textContent = "Refill the Form";
  refillBtn.onclick = refillForm;

  document.getElementById("stressForm").appendChild(refillBtn);
}


function refillForm() {
  count = 0;
  scores = [];
  totalScore = 0;
  document.getElementById("stressForm").innerHTML = "";
  document.getElementById("progressContainer").style.display = "block";
  addQuestion();
  updateProgressBar();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hamburger").addEventListener("click", function() {
    document.getElementById("nav-links").classList.toggle("active");
  });
  
  addQuestion();
  updateProgressBar();
});
