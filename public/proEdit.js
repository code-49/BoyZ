// product edit
let modal = document.getElementById("productModal");
modal.style.display = "none";

function openModalPro(proJson) {
  let product = JSON.parse(proJson);
  modal.style.display = "block";
  let name = document.getElementById("name");
  let desc = document.getElementById("desc");
  let size = document.getElementById("size");
  let id = document.getElementById("id");
  let price = document.getElementById("price");
  let category = document.getElementById("category");
  let disc = document.getElementById("disc");
  let stock = document.getElementById("stock");
  let color = document.getElementById("colorPicker");

  name.value = product.name;
  desc.value = product.description;
  id.value = product._id;
  size.value = product.size;
  price.value = product.price;
  category.value = product.category[0];
  disc.value = product.discount;
  stock.value = product.stock;
  color.value = product.color[0];

  modal.style.display = "block";
}

function closeModalPro(event) {
  let target = event.target;
  if (target == modal) {
    modal.style.display = "none";
  }
}
