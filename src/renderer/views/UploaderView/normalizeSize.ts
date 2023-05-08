import {
  bytesAsString,
} from '../../../common/utils/unit-conversion.functions'
export const normalizeSize = (videoInfo, thumbnailInfo) => {
  const size = videoInfo.size + thumbnailInfo.size;
  return bytesAsString(size);
};
