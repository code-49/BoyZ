//category edit

let modal1 = document.getElementById("categoryModal");
modal1.style.display = "none";

function openModal(catJson) {
  let categorys = JSON.parse(catJson);
  modal1.style.display = "block";
  let name = document.getElementById("name");
  let desc = document.getElementById("desc");
  let verified = document.getElementById("verified");
  let id = document.getElementById("id");

  name.value = categorys.name;
  desc.value = categorys.description;
  verified.checked = categorys.verified;
  id.value = categorys._id;

  modal1.style.display = "block";
}

function closeModal(event) {
  let target = event.target;
  if (target == modal1) {
    modal1.style.display = "none";
  }
}
