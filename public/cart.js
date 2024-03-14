function addToCart(proId) {
  let productId = JSON.parse(proId);
  let quantity = document.getElementById("numOfProduct").value;
  fetch(`/cart/add-to-cart?productId=${productId}&quantity=${quantity}`).then(
    async (result) => {
      result = await result.json();

      document.getElementById("cartMessage").style.display = "block";
      document.getElementById("cartMessage").innerHTML = result.message;
    }
  );
  setTimeout(() => {
    hideCartMessage();
  }, 3000);
}

function hideCartMessage() {
  document.getElementById("cartMessage").style.display = "none";
}
