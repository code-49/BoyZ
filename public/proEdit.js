// product edit
let modal = document.getElementById("productModal");
modal.style.display = "none";

function openModalPro(proJson) {
  let product = JSON.parse(proJson);
  modal.style.display = "block";
  let productName = document.getElementById("productName");
  let desc = document.getElementById("desc");
  let size = document.getElementById("size");
  let id = document.getElementById("id");
  let price = document.getElementById("price");
  let category = document.getElementById("category");
  let disc = document.getElementById("disc");
  let stock = document.getElementById("stock");
  let color = document.getElementById("colorPicker");
  let img1 = document.getElementById("img1");
  let img2 = document.getElementById("img2");
  let img3 = document.getElementById("img3");
  let img4 = document.getElementById("img4");
  let deleteImg1 = document.getElementById("delete1");
  let deleteImg2 = document.getElementById("delete2");
  let deleteImg3 = document.getElementById("delete3");
  let deleteImg4 = document.getElementById("delete4");
  let mess1 = document.getElementById("del1mess");
  let mess2 = document.getElementById("del2mess");
  let mess3 = document.getElementById("del3mess");
  let mess4 = document.getElementById("del4mess");

  productName.value = product.name;
  desc.value = product.description;
  id.value = product._id;
  size.value = product.size;
  price.value = product.price;
  category.value = product.category[0];
  disc.value = product.discount;
  stock.value = product.stock;
  color.value = product.color[0];
  img1.src = `/productImages/${product.images[0]}`;
  img2.src = `/productImages/${product.images[1]}`;
  img3.src = `/productImages/${product.images[2]}`;
  img4.src = `/productImages/${product.images[3]}`;
  deleteImg1.addEventListener("click", async () => {
    const res = await fetch(
      `/admin/deleteImage?id=${product._id}&image=${product.images[0]}`
    );
    let delete_response = await res.json();
    mess1.innerHTML = delete_response.message;
    console.log(delete_response, res);
  });
  deleteImg2.addEventListener("click", async () => {
    const res = await fetch(
      `/admin/deleteImage?id=${product._id}&image=${product.images[1]}`
    );
    let delete_response = await res.json();
    mess2.innerHTML = delete_response.message;
    console.log(delete_response, res);
  });
  deleteImg3.addEventListener("click", async () => {
    const response = await fetch(
      `/admin/deleteImage?id=${product._id}&image=${product.images[2]}`
    );

    const delete_response = await response.json();
    mess3.innerHTML = delete_response.message;
    console.log(delete_response, res);
  });
  deleteImg4.addEventListener("click", async () => {
    const res = await fetch(
      `/admin/deleteImage?id=${product._id}&image=${product.images[3]}`
    );
    let delete_response = await res.json();
    console.log(delete_response, res);
    mess4.innerHTML = delete_response.message;
  });

  modal.style.display = "block";
}

function closeModalPro(event) {
  let target = event.target;
  if (target == modal) {
    modal.style.display = "none";
  }
}
