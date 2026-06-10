import mongoose from "mongoose";
import { NextFunction, Response, Router } from "express";

import { ReviewModel } from "./review.model";
import { MuseumModel } from "../museums/museum.model";
import { CreateReviewDto, UpdateReviewDto } from "./review.dto";
import {
  authenticate,
  authorizeRoles,
  AuthenticatedRequest,
} from "../../common/middleware/auth";
import { validateBody } from "../../common/middleware/validationMiddleware";
import { UserRole } from "../users/user.roles";

const reviewsRouter = Router();

const normalizeReviewImages = (review: any) => {
  const object = typeof review.toObject === "function" ? review.toObject() : review;
  const rawImages = [
    ...(Array.isArray(object.images) ? object.images : []),
    object.image,
    object.imageUrl,
    object.photo,
    object.photoUrl,
  ];

  return {
    ...object,
    images: rawImages
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.secure_url || item?.url || item?.uri;
      })
      .filter((uri) => typeof uri === "string" && uri.trim())
      .map((uri) => uri.trim()),
  };
};

// GET /api/reviews - list reviews (public, optional ?museumId= filter)
reviewsRouter.get("/", async (req, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    const museumId = req.query.museumId as string | undefined;
    const limit = Number(req.query.limit) || 50;
    const skip = Number(req.query.skip) || 0;

    if (museumId) {
      if (!mongoose.isValidObjectId(museumId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid museum id" });
      }

      filter.museum = new mongoose.Types.ObjectId(museumId);
    }

    const reviews = await ReviewModel.find(filter)
      .populate("user", "name email avatar role")
      .populate("museum", "name city imageUrl")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await ReviewModel.countDocuments(filter);

    // Calculate average rating for filtered reviews
    const avgRatingResult = await ReviewModel.aggregate([
      { $match: filter },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    const avgRating =
      avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    return res.json({
      success: true,
      data: reviews.map(normalizeReviewImages),
      pagination: { limit, skip, total },
      averageRating: avgRating ? Number(avgRating.toFixed(2)) : 0,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/admin/list - list all reviews with more details (Admin only)
reviewsRouter.get(
  "/admin/list",
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 100;
      const skip = Number(req.query.skip) || 0;

      const reviews = await ReviewModel.find()
        .populate("user", "name email avatar")
        .populate("museum", "name city")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await ReviewModel.countDocuments();

      return res.json({
        success: true,
        data: reviews.map(normalizeReviewImages),
        pagination: { limit, skip, total },
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/reviews/:id - get one review (public)
reviewsRouter.get("/:id", async (req, res: Response, next: NextFunction) => {
  try {
    const review = await ReviewModel.findById(req.params.id)
      .populate("user", "name email avatar role")
      .populate("museum", "name description city location imageUrl");

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    return res.json({ success: true, data: normalizeReviewImages(review) });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews - create review (authenticated users)
reviewsRouter.post(
  "/",
  authenticate,
  validateBody(CreateReviewDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateReviewDto;
      const userId = req.user!.id;

      if (!mongoose.isValidObjectId(dto.museum)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid museum id" });
      }

      const museumObjectId = new mongoose.Types.ObjectId(dto.museum);

      // Verify museum exists
      const museum = await MuseumModel.findById(museumObjectId);
      if (!museum) {
        return res
          .status(400)
          .json({ success: false, message: "Museum not found" });
      }

      // Check if user already reviewed this museum
      const existingReview = await ReviewModel.findOne({
        user: userId,
        museum: museumObjectId,
      });

      if (existingReview) {
        const mergedImages =
          Array.isArray(dto.images) && dto.images.length > 0
            ? [...new Set([...(existingReview.images || []), ...dto.images])]
            : existingReview.images || [];

        const updated = await ReviewModel.findByIdAndUpdate(
          existingReview._id,
          {
            $set: {
              rating: dto.rating,
              title: dto.title,
              comment: dto.comment,
              recommend: dto.recommend,
              easeRating: dto.easeRating,
              facilitiesRating: dto.facilitiesRating,
              images: mergedImages,
            },
          },
          { new: true },
        ).populate([
          { path: "user", select: "name email avatar role" },
          { path: "museum", select: "name city imageUrl" },
        ]);

        return res.json({
          success: true,
          data: updated ? normalizeReviewImages(updated) : updated,
          updated: true,
        });
      }

      const review = await ReviewModel.create({
        user: userId,
        museum: museumObjectId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        recommend: dto.recommend,
        easeRating: dto.easeRating,
        facilitiesRating: dto.facilitiesRating,
        images: dto.images,
      });

      const populated = await review.populate([
        { path: "user", select: "name email avatar role" },
        { path: "museum", select: "name city imageUrl" },
      ]);

      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/reviews/:id - update review (owner only)
reviewsRouter.patch(
  "/:id",
  authenticate,
  validateBody(UpdateReviewDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as UpdateReviewDto;
      const review = await ReviewModel.findById(req.params.id);

      if (!review) {
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });
      }

      // Only owner can update
      if (review.user.toString() !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only update your own reviews",
        });
      }

      const updated = await ReviewModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(dto.rating != null && { rating: dto.rating }),
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.comment !== undefined && { comment: dto.comment }),
            ...(dto.recommend !== undefined && { recommend: dto.recommend }),
            ...(dto.easeRating !== undefined && { easeRating: dto.easeRating }),
            ...(dto.facilitiesRating !== undefined && { facilitiesRating: dto.facilitiesRating }),
            ...(dto.images !== undefined && { images: dto.images }),
          },
        },
        { new: true },
      ).populate([
        { path: "user", select: "name email avatar role" },
        { path: "museum", select: "name city imageUrl" },
      ]);

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/reviews/:id - delete review (owner or Admin)
reviewsRouter.delete(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const review = await ReviewModel.findById(req.params.id);

      if (!review) {
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });
      }

      const isOwner = review.user.toString() === req.user!.id;
      const isAdmin = req.user!.role === UserRole.Admin;

      // Only owner or Admin can delete
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You can only delete your own reviews or be an admin",
        });
      }

      await ReviewModel.findByIdAndDelete(req.params.id);

      return res.json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
);

export { reviewsRouter };
