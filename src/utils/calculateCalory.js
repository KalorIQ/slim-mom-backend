export const calculateCalory = ({
  currentWeight,
  height,
  age,
  desireWeight,
}) => {
  return Math.floor(
    10 * currentWeight +
      6.25 * height -
      5 * age -
      161 -
      10 * (currentWeight - desireWeight),
  );
};
