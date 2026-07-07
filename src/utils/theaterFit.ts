import type { Room, ProjectorModel } from '../types/theater';

/**
 * Single source of truth for "does this projector optically fit in this room".
 * Previously this calculation was copy-pasted (with slightly different margins)
 * in Controls.tsx, TheaterCanvas.tsx, and ProjectorSelectorModal.tsx, which could
 * produce contradictory OK/NG results for the exact same configuration.
 */

const BACK_CLEARANCE_MM = 50; // space kept behind the lens/body and the back wall

export interface InstallationFitResult {
  minThrowDist: number;
  maxThrowDist: number;
  /** distance actually used for this calculation (given z, or minThrowDist if none supplied) */
  evaluatedZ: number;
  isThrowDistValid: boolean;
  isWithinRoomDepth: boolean;
  isInstallationValid: boolean;
  requiredDepth: number;
  depthMargin: number;
}

/**
 * @param projectorZ  Current throw distance (mm). If omitted (e.g. when browsing
 *                     projector candidates that haven't been positioned yet), the
 *                     projector's own minimum throw distance is used as a best case.
 */
export function getInstallationFit(
  room: Pick<Room, 'depth'>,
  projector: ProjectorModel,
  screenWidthMm: number,
  projectorZ?: number
): InstallationFitResult {
  const offset = projector.throwDistanceOffset || 0;
  const minThrowDist = projector.throwRatio.min * screenWidthMm + offset;
  const maxThrowDist = projector.throwRatio.max * screenWidthMm + offset;
  const isFixedThrow = projector.throwRatio.min === projector.throwRatio.max;
  const throwDistMargin = isFixedThrow ? 100 : 50;

  const z = projectorZ ?? minThrowDist;
  const bodyDepth = projector.size?.d || 0;

  const requiredDepth =
    projector.type === 'UST'
      ? minThrowDist + bodyDepth / 2 + BACK_CLEARANCE_MM
      : z + bodyDepth / 2 + BACK_CLEARANCE_MM;

  const isWithinRoomDepth = requiredDepth <= room.depth;
  const isThrowDistValid =
    z >= minThrowDist - throwDistMargin && z <= maxThrowDist + throwDistMargin;

  return {
    minThrowDist,
    maxThrowDist,
    evaluatedZ: z,
    isThrowDistValid,
    isWithinRoomDepth,
    isInstallationValid: isThrowDistValid && isWithinRoomDepth,
    requiredDepth,
    depthMargin: room.depth - requiredDepth,
  };
}
