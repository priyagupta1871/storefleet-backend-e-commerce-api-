// Please don't change the pre-written code
// Import the necessary modules here
import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
} from "../model/product.repository.js";
import ProductModel from "../model/product.schema.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id,
    });

    if (product) {
      return res.status(201).json({ success: true, product });
    }
    return next(new ErrorHandler(400, "some error occured!"));
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { page, keyword, price, category, rating } = req.query;

    // Pagination
    const pageNumber = parseInt(page, 10) || 1;
    const limit = 10;
    const skip = (pageNumber - 1) * limit;

    // Build the query object
    const query = {};

    // Search by keyword (case-insensitive)
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price
    if (price) {
      // supports format price[gte]=X&price[lte]=Y
      query.price = {
        ...(price.gte ? { $gte: Number(price.gte) } : {}),
        ...(price.lte ? { $lte: Number(price.lte) } : {}),
      };
    }

    // Filter by rating
    if (rating) {
      query.rating = {
        ...(rating.gte ? { $gte: Number(rating.gte) } : {}),
        ...(rating.lte ? { $lte: Number(rating.lte) } : {}),
      };
    }

    const products = await getAllProductsRepo(query, skip, limit);
    const totalProducts = await getTotalCountsOfProduct(query);

    return res.status(200).json({
      success: true,
      products,
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      return res.status(200).json({ success: true, updatedProduct });
    }
    return next(new ErrorHandler(400, "Product not found!"));
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      return res.status(200).json({ success: true, deletedProduct });
    }
    return next(new ErrorHandler(400, "Product not found!"));
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      return res.status(200).json({ success: true, productDetails });
    }
    return next(new ErrorHandler(400, "Product not found!"));
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;

    if (!rating) {
      return next(new ErrorHandler(400, "rating can't be empty"));
    }

    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }

    const review = {
      user,
      name,
      rating: Number(rating),
      comment,
    };

    const existingIndex = product.reviews.findIndex(
      (rev) => rev.user.toString() === user.toString()
    );

    if (existingIndex >= 0) {
      product.reviews.splice(existingIndex, 1, review);
    } else {
      product.reviews.push(review);
    }

    // Recompute average rating
    const sum = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    product.rating =
      product.reviews.length > 0 ? sum / product.reviews.length : 0;

    await product.save({ validateBeforeSave: false });

    return res
      .status(201)
      .json({ success: true, msg: "thx for rating the product", product });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    return res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

export const deleteReview = async (req, res, next) => {
  // Insert the essential code into this controller wherever necessary to resolve issues related to removing reviews and updating product ratings.
  try {
    const userId = req.user._id;
    const { productId, reviewId } = req.query;

    if (!productId || !reviewId) {
      return next(
        new ErrorHandler(400, "pls provide productId and reviewId as query params")
      );
    }

    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }

    const reviews = product.reviews;
    const index = reviews.findIndex(
      (rev) => rev._id.toString() === reviewId.toString()
    );

    if (index < 0) {
      return next(new ErrorHandler(400, "review doesn't exist"));
    }

    const reviewToDelete = reviews[index];

    // Ensure only the author can delete their review
    if (reviewToDelete.user.toString() !== userId.toString()) {
      return next(new ErrorHandler(400, "access denied"));
    }

    // Remove and recompute rating
    reviews.splice(index, 1);
    const sum = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    product.rating =
      product.reviews.length > 0 ? sum / product.reviews.length : 0;

    await product.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      msg: "review deleted successfully",
      deletedReview: reviewToDelete,
      product,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || error));
  }
};