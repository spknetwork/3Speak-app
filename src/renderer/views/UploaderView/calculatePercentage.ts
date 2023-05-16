export const calculatePercentage = (progress, statusInfo) => {
  return progress.percent / statusInfo.nstages + statusInfo.stage * (100 / statusInfo.nstages);
};