export const AVATAR_PLACEHOLDER = '/avatar-placeholder.svg';

export function getProfilePhotoSrc(profile, preferBlurred = false) {
  if (!profile) return AVATAR_PLACEHOLDER;

  if (typeof profile.photo === 'string' && profile.photo.trim()) {
    return profile.photo;
  }

  const photos = Array.isArray(profile.photos) ? profile.photos : [];
  const mainPhoto = photos.find((photo) => photo?.isMain) || photos[0];
  const source = preferBlurred
    ? mainPhoto?.blurredUrl || mainPhoto?.url
    : mainPhoto?.url || mainPhoto?.blurredUrl;

  return source || AVATAR_PLACEHOLDER;
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SP';
}

export function formatPlan(user) {
  if (user?.subscription?.isActive) {
    return user.subscription.plan || 'premium';
  }

  return 'free';
}

