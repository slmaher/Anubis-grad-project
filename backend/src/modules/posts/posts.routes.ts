import { NextFunction, Response, Router } from 'express';
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
      const posts = await PostModel.find()
        .populate('user', 'name email avatar')
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
        { path: 'user', select: 'name email avatar' }
      ]);

      return res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

export { postsRouter };
