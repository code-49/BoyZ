exports.setFilterData = (req, res, next) => {
  req.filterPage = req.query.page || 1;
  req.query.cat = req.query.cat || "shirts";
  req.query.min = req.query.min || 0;
  req.query.max = req.query.max || 5000;
  req.query.size = req.query.size || null;
  const productsQuery = {
    price: {
      $gte: req.query.min,
      $lte: req.query.max,
    },
    active: true,
  };
  if (req.query.size) {
    productsQuery.size = req.query.size;
  }
  if (req.query.cat) {
    productsQuery.category = {
      $in: [req.query.cat],
    };
  }
  if (req.query.stock) {
    productsQuery.stock = {
      $gt: 0,
    };
  }
  req.productFilterData = productsQuery;
  let sorting;
  switch (req.query.sort) {
    case "na":
      sorting = {
        createdAt: -1,
      };
      break;
    case "lh":
      sorting = {
        price: 1,
      };
      break;
    case "hl":
      sorting = {
        price: -1,
      };
      break;
    case "az":
      sorting = {
        name: 1,
      };
      break;
    case "za":
      sorting = {
        name: -1,
      };
      break;
    case "ra":
      sorting = {
        rating: -1,
      };
      break;
    default:
      sorting = {
        createdAt: -1,
      };
      break;
  }
  req.sorting = sorting;
  next();
};
