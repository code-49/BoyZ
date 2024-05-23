let toastTimer;
function toasting(boxID, message, success) {
  const container = document.getElementById(boxID);
  if (success) {
    container.classList.add("green-text");
    container.classList.remove("red-text");
  } else {
    container.classList.add("red-text");
    container.classList.remove("green-text");
  }
  container.innerHTML = message;
  container.style.display = "block";
  clearInterval(toastTimer);
  toastTimer = setTimeout(() => {
    container.style.display = "none";
    clearInterval(toastTimer);
  }, 5000);
}
