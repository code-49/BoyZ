const profile = document.getElementById("profile");
const orders = document.getElementById("orders");

orders.style.display = "none";

function changeContent(content) {
  if (content == "profile") {
    orders.style.display = "none";
    profile.style.display = "block";
  } else {
    orders.style.display = "block";
    profile.style.display = "none";
  }
}

const nameD = document.getElementById("profileName");
const nameInput = document.getElementById("profileNameInput");

const email = document.getElementById("profileEmail");
const emailInput = document.getElementById("profileEmailInput");

// const gender = document.getElementById("profileGender");
// const genderInput = document.getElementById("profileGenderInput");

nameInput.style.display = "none";
emailInput.style.display = "none";
// genderInput.style.display = "none";

function changeDetails(field) {
  if (field == "name") {
    nameInput.style.display = "inline";
    nameD.style.display = "none";
  } else if (field == "age") {
    emailInput.style.display = "inline";
    email.style.display = "none";
  }
  // } else if (field == "gender") {
  //   genderInput.style.display = "inline";
  //   gender.style.display = "none";
  // }
}

nameInput.addEventListener("change", () => {
  nameInput.style.display = "none";
  nameD.style.display = "block";
});

// ageInput.addEventListener("change", () => {
//   ageInput.style.display = "none";
//   age.style.display = "block";
// });
// genderInput.addEventListener("change", () => {
//   genderInput.style.display = "none";
//   gender.style.display = "block";
// });
const formContainer = document.getElementById("formContainer");
const form = document.getElementById("addressForm");
function openAddress() {
  formContainer.style.display = "grid";
}

function closeAddress(event) {
  // let target = event.target;
  // console.log("this worked", target);
  // if (target == formContainer) {
  formContainer.style.display = "none";
  // }
}
