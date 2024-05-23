//finding docs
exports.get_one_document = async (Model, query, projection) => {
  projection = projection || {};

  const doc = await Model.findOne(query, projection);

  return doc ? doc : null;
};

exports.get_documents = async (Model, query, projection, limit) => {
  projection = projection || {};
  limit = limit || 0;
  return await Model.find(query, projection).limit(limit);
};

//updating docs
exports.update_one_document = async (Model, query, change) => {
  return await Model.updateOne(query, change);
};
