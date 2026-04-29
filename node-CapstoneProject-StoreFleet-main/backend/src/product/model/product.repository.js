import ProductModel from "./product.schema.js";

// Create
export const addNewProductRepo = async (product) => {
  return await new ProductModel(product).save();
};

// Read (with pagination)
export const getAllProductsRepo = async (query, skip, limit) => {
  return await ProductModel.find(query).skip(skip).limit(limit);
};

// Update
export const updateProductRepo = async (_id, updatedData) => {
  return await ProductModel.findByIdAndUpdate(_id, updatedData, {
    new: true,
    runValidators: true,
    // useFindAndModify is deprecated in Mongoose; omitting it avoids warnings.
  });
};

// Delete (kept the original export name to avoid breaking controllers)
export const deleProductRepo = async (_id) => {
  return await ProductModel.findByIdAndDelete(_id);
};

// Read by id
export const getProductDetailsRepo = async (_id) => {
  return await ProductModel.findById(_id);
};

// Counts (accepts optional filter to match listing queries)
export const getTotalCountsOfProduct = async (query = {}) => {
  return await ProductModel.countDocuments(query);
};

// Utility
export const findProductRepo = async (productId) => {
  return await ProductModel.findById(productId);
};