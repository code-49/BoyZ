exports.setFilterData = (req, res, next) => {
  req.filterPage = req.query.page || 1;
  req.query.cat = req.query.cat || "shirts";
  req.query.min = req.query.min || 0;
  req.query.max = req.query.max || 10000;
  req.query.size = req.query.size || null;
  const productsQuery = {
    price: {
      $gte: req.query.min,
      $lte: req.query.max,
    },
  };
  if (req.query.size) {
    productsQuery.size = req.query.size;
  }
  if (req.query.cat) {
    productsQuery.category = {
      $in: [req.query.cat],
    };
  }
  req.productFilterData = productsQuery;
  next();
};
