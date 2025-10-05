const formatTimeFull = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hrs > 0) parts.push(hrs.toString());
  parts.push(mins.toString().padStart(2, "0"));
  parts.push(secs.toString().padStart(2, "0"));

  return parts.join(":");
};

export default formatTimeFull;
