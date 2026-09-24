import { useProfile } from './queries';

/** Back-compat wrapper: same { profile, isLoading, error } shape, powered by react-query cache. */
export const useUserProfile = () => {
  const { data, isLoading, error } = useProfile();
  const profile = data
    ? { ...data, user_id: data.user_id ?? '' }
    : null;
  return {
    profile,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch profile') : null,
  };
};
