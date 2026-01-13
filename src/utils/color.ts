const colors = [
  '#1890ff', // blue
  '#722ed1', // purple
  '#52c41a', // green
  '#f5222d', // red
  '#faad14', // gold
  '#13c2c2', // cyan
  '#eb2f96', // pink
  '#fa8c16', // orange
  '#a0d911', // yellow-green
];

export const getRandomColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const getAvatarStyles = (seed: string) => {
  const baseColor = getRandomColor(seed);
  return {
    backgroundColor: `${baseColor}15`, // Light background (opacity)
    color: baseColor, // Strong text color
  };
};
