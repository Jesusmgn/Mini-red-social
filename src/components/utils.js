export const defaultAvatar = (seed) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=ddd&color=333`;

export const timeAgo = (date) => {
  if (!(date instanceof Date)) date = new Date(date);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};
