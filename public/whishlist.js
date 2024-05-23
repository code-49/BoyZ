function addToWhishlist(proId) {
  let productId = proId;
  fetch(`/wishlist/add/${productId}`).then(async (result) => {
    result = await result.json();
    if (result.added) {
      document.getElementById("whishResponse").style.display = "block";
      document.getElementById("whishResponse").innerHTML = "added to wishlist";
    } else {
      document.getElementById("whishResponse").style.display = "block";
      document.getElementById("whishResponse").innerHTML =
        "unable to add wishlist";
    }
  });

  setTimeout(() => {
    hideWishlistMessage();
  }, 3000);
}

function hideWishlistMessage() {
  document.getElementById("whishResponse").style.display = "none";
}
