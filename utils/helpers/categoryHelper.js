const categoryModel = require("../../models/categoryModel");

module.exports = {
  activeCategoryName: async () => {
    return await categoryModel.find({ verified: true }, { name: 1 });
  },
};
