import { NextFunction, Response, Router } from 'express';
import mongoose from 'mongoose';
import { PostModel } from './post.model';
import { CreatePostDto } from './post.dto';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';

const postsRouter = Router();

// GET /api/posts - list posts
postsRouter.get(
  '/',
  async (req, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.query;
      const filter = userId ? { user: userId } : {};

      const posts = await PostModel.find(filter)
        .populate('user', 'name email avatar')
        .populate('comments.user', 'name email avatar')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: posts
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/posts - create post
postsRouter.post(
  '/',
  authenticate,
  validateBody(CreatePostDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreatePostDto;
      const userId = req.user!.id;

      const post = await PostModel.create({
        user: userId,
        content: dto.content,
        image: dto.image
      });

      const populated = await post.populate([
        { path: 'user', select: 'name email avatar' },
        { path: 'comments.user', select: 'name email avatar' }
      ]);

      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/posts/:postId/like - toggle post like
postsRouter.post(
  '/:postId/like',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;

      const post = await PostModel.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      if (!Array.isArray(post.likedBy)) {
        post.likedBy = [];
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const existingLikeIndex = post.likedBy.findIndex((id) => id.equals(userObjectId));

      let liked = false;
      if (existingLikeIndex >= 0) {
        post.likedBy.splice(existingLikeIndex, 1);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy.push(userObjectId);
        post.likes += 1;
        liked = true;
      }

      await post.save();

      return res.json({
        success: true,
        data: {
          postId: post.id,
          likes: post.likes,
          liked
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/posts/:postId/comments - add a comment
postsRouter.post(
  '/:postId/comments',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;
      const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

      if (!content) {
        return res.status(400).json({ success: false, message: 'Comment content is required' });
      }

      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: {
              user: new mongoose.Types.ObjectId(userId),
              content,
              createdAt: new Date()
            }
          }
        },
        { new: true }
      )
        .populate('user', 'name email avatar')
        .populate('comments.user', 'name email avatar');

      if (!updatedPost) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      return res.status(201).json({ success: true, data: updatedPost });
    } catch (err) {
      next(err);
    }
  }
);

export { postsRouter };
