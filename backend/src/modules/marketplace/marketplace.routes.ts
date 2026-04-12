import { NextFunction, Response, Router } from 'express';
import { ProductModel } from './product.model';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';
import { UserRole } from '../users/user.roles';

const marketplaceRouter = Router();

// GET /api/marketplace - list all active products
marketplaceRouter.get('/', async (req, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    const filter: any = { isActive: true };
    if (category) {
      filter.category = category;
    }

    const products = await ProductModel.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/marketplace/:id - get product details
marketplaceRouter.get('/:id', async (req, res: Response, next: NextFunction) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// ADMIN: CRUD
marketplaceRouter.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(CreateProductDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateProductDto;
      const product = await ProductModel.create(dto);
      return res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }
);

marketplaceRouter.patch(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  validateBody(UpdateProductDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await ProductModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }
);

marketplaceRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await ProductModel.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false } },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, message: 'Product deactivated' });
    } catch (err) {
      next(err);
    }
  }
);

export { marketplaceRouter };
