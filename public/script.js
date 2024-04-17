// login modal script------------------------

const loginModal = document.getElementById("loginModal");
const signup = document.getElementById("signContainer");
const login = document.getElementById("loginContainer");

loginModal.style.display = "none";

function openSignupModal() {
  signup.style.display = "block";
  login.style.display = "none";
  loginModal.style.display = "grid";
}

function openLoginModal() {
  signup.style.display = "none";
  login.style.display = "block";
  loginModal.style.display = "grid";
}

function closeModal(event) {
  let target = event.target;
  if (target == loginModal) {
    loginModal.style.display = "none";
  }
}

// banner scripts---------------
let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  clearInterval(slideInterval);
  showSlides((slideIndex += n));
  slideInterval = setInterval(() => {
    plusSlides(1);
  }, 7000);
}

// Thumbnail image controls
function currentSlide(n) {
  clearInterval(slideInterval);
  showSlides((slideIndex = n));
  slideInterval = setInterval(() => {
    plusSlides(1);
  }, 7000);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}

let slideInterval = setInterval(() => {
  plusSlides(1);
}, 7000);

// product details

function numIncrement(num, id, request, index) {
  let items = document.getElementById(id);
  let value = parseInt(items.value);
  num = parseInt(num);
  if (num < 0 && value > 1) {
    value += num;
  } else if (num > 0 && value < 10) {
    value += num;
  }
  request = request || false;
  if (request) {
    let pid = document.getElementById(`productID-${index}`);
    fetch(
      `/cart/change-quantity?quantity=${value}&productId=${pid.value}`
    ).then(async (result) => {
      const data = await result.text();
      if (data == "/cart") {
        items.value = value;
        window.location.href = data;
        document.getElementById("stock").innerText = "";
      } else {
        document.getElementById("stock").innerText = data;
      }
    });
  }
}

// form submit

const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

signupMessage.style.display = "none";

const signupURL = "http://localhost:3000/account/signup";

signupForm.addEventListener("submit", async (evnt) => {
  evnt.preventDefault();

  const formData = new FormData(signupForm);
  const reqData = new URLSearchParams(formData);

  const response = await fetch(signupURL, {
    method: "POST",
    body: reqData,
  });
  let data = await response.json();
  if (data.redirect) {
    window.location.href = data.redirect;
  } else {
    signupMessage.innerHTML = data.message;
    signupMessage.style.display = "block";
  }
  signupForm.reset();
});
