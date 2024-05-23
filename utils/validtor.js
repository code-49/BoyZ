const productValidation = (product) => {
  if (
    product.name == "" ||
    product.description == "" ||
    product.colors == "" ||
    product.price == "" ||
    product.discount == "" ||
    product.stock == "" ||
    product.category == ""
  ) {
    return "Fill all inputs";
  } else if (
    parseInt(product.price, 10) < 0 ||
    parseInt(product.discount, 10) < 0 ||
    parseInt(product.stock, 10) < 0
  ) {
    return "price,discount or stock cannot be less than 0";
  } else if (parseInt(product.discount, 10) > 100) {
    return "discount cannot be higher than 100";
  } else {
    return 0;
  }
};

module.exports = {
  productValidation,
};
