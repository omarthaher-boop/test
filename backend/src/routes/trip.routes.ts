import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  startTripSchema, stopTripSchema, appendRouteSchema, updateTripSchema, tripListQuerySchema,
} from '../schemas/trip.schema';
import {
  startTrip, stopTrip, appendRoute, listTrips, getTrip, updateTrip, deleteTrip,
} from '../controllers/trip.controller';

const router = Router();

router.use(authenticate);
router.post('/start', validate(startTripSchema), startTrip);
router.patch('/:id/stop', validate(stopTripSchema), stopTrip);
router.patch('/:id/route', validate(appendRouteSchema), appendRoute);
router.get('/', validate(tripListQuerySchema, 'query'), listTrips);
router.get('/:id', getTrip);
router.patch('/:id', validate(updateTripSchema), updateTrip);
router.delete('/:id', deleteTrip);

export default router;
