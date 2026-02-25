import { NextFunction, Response, Router } from 'express';

import { RestoredArtifactModel } from './restoredArtifact.model';
import { ArtifactModel } from '../artifacts/artifact.model';
import { CreateRestoredArtifactDto, UpdateRestoredArtifactDto } from './restoredArtifact.dto';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth';
import { validateBody } from '../../common/middleware/validationMiddleware';

const restoredArtifactsRouter = Router();

/**
 * Mock function to generate a restored image URL
 * In production, this would call an AI microservice
 */
function generateMockRestoredImageUrl(originalUrl: string): string {
  // Mock: Add a prefix/suffix to simulate restoration
  // In production, this would be replaced with actual AI service call
  const urlParts = originalUrl.split('.');
  const extension = urlParts[urlParts.length - 1];
  const baseUrl = originalUrl.replace(`.${extension}`, '');
  return `${baseUrl}_restored.${extension}`;
}

// POST /api/restored-artifacts - restore an artifact image (authenticated users)
restoredArtifactsRouter.post(
  '/',
  authenticate,
  validateBody(CreateRestoredArtifactDto),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateRestoredArtifactDto;

      // Verify artifact exists
      const artifact = await ArtifactModel.findById(dto.artifact);
      if (!artifact) {
        return res.status(400).json({ success: false, message: 'Artifact not found' });
      }

      // Generate mocked restored image URL
      const restoredImageUrl = generateMockRestoredImageUrl(dto.originalImageUrl);

      // Save restoration record
      const restoredArtifact = await RestoredArtifactModel.create({
        user: req.user!.id,
        artifact: dto.artifact,
        originalImageUrl: dto.originalImageUrl,
        restoredImageUrl: restoredImageUrl,
        status: 'completed'
      });

      const populated = await restoredArtifact.populate([
        { path: 'user', select: 'name email' },
        { path: 'artifact', select: 'name description museum' }
      ]);

      return res.status(201).json({
        success: true,
        data: {
          ...populated.toObject(),
          message: 'Image restoration completed (mocked)'
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/restored-artifacts - list restored artifacts (users see their own)
restoredArtifactsRouter.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const restoredArtifacts = await RestoredArtifactModel.find({
        user: req.user!.id
      })
        .populate('user', 'name email')
        .populate('artifact', 'name description museum')
        .sort({ createdAt: -1 });

      return res.json({ success: true, data: restoredArtifacts });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/restored-artifacts/:id - get one restored artifact
restoredArtifactsRouter.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const restoredArtifact = await RestoredArtifactModel.findById(req.params.id)
        .populate('user', 'name email')
        .populate({
          path: 'artifact',
          select: 'name description museum',
          populate: {
            path: 'museum',
            select: 'name city'
          }
        });

      if (!restoredArtifact) {
        return res.status(404).json({ success: false, message: 'Restored artifact not found' });
      }

      // Users can only view their own restored artifacts
      if (restoredArtifact.user._id.toString() !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view your own restored artifacts'
        });
      }

      return res.json({ success: true, data: restoredArtifact });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/restored-artifacts/artifact/:artifactId - get restored artifacts for a specific artifact
restoredArtifactsRouter.get(
  '/artifact/:artifactId',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const restoredArtifacts = await RestoredArtifactModel.find({
        artifact: req.params.artifactId,
        user: req.user!.id
      })
        .populate('user', 'name email')
        .populate('artifact', 'name description')
        .sort({ createdAt: -1 });

      return res.json({ success: true, data: restoredArtifacts });
    } catch (err) {
      next(err);
    }
  }
);

export { restoredArtifactsRouter };
