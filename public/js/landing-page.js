const quotes = [
  "Take care of your body. It's the only place you have to live. – Jim Rohn",
  "Health is not valued until sickness comes. – Thomas Fuller",
  "To keep the body in good health is a duty… otherwise we shall not be able to keep our mind strong and clear. – Buddha",
  "The greatest wealth is health. – Virgil",
  "A healthy outside starts from the inside. – Robert Urich",
  "Your body hears everything your mind says. – Naomi Judd",
  "Health is a state of body. Wellness is a state of being. – J. Stanford",
  "It is health that is real wealth and not pieces of gold and silver. – Mahatma Gandhi",
];

function changequote() {
  const para = document.querySelector(".bottom-quote");
  let RandomQuote = 0;
  para.innerHTML = quotes[RandomQuote];
  setInterval(() => {
    RandomQuote = (RandomQuote + 1) % quotes.length;
    para.innerHTML = quotes[RandomQuote];
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  changequote();
});
