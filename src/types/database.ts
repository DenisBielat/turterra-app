/**
 * TypeScript types for Supabase database tables.
 *
 * These types help catch errors at compile time instead of runtime.
 * When you query the profiles table, TypeScript knows exactly what
 * fields are available and their types.
 *
 * USAGE:
 * ```ts
 * import { Profile } from '@/types/database'
 *
 * const profile: Profile = await supabase
 *   .from('profiles')
 *   .select('*')
 *   .single()
 * ```
 *
 * NOTE: Supabase can auto-generate these types from your database schema.
 * Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
 * For now, we're maintaining them manually since the schema is simple.
 */

/**
 * User profile stored in the public.profiles table.
 * Linked to auth.users via the `id` field.
 */
export interface Profile {
  /** UUID matching the user's auth.users.id */
  id: string;
  /** Unique username (3-30 chars, lowercase, starts with letter) */
  username: string;
  /** Display name shown on profile (optional) */
  display_name: string | null;
  /** User's bio/description (optional) */
  bio: string | null;
  /** User's location (optional) */
  location: string | null;
  /** URL to avatar image (optional) */
  avatar_url: string | null;
  /** Whether user is verified (staff, notable members, etc.) */
  is_verified: boolean;
  /** When the profile was created */
  created_at: string;
  /** When the profile was last updated */
  updated_at: string;
}

/**
 * Reserved username entry.
 * Usernames in this table cannot be registered by users.
 */
export interface ReservedUsername {
  /** The reserved username */
  username: string;
  /** Why it's reserved (system, brand, route, feature, etc.) */
  reason: string | null;
}

/**
 * Full database type definition for Supabase client.
 *
 * This type can be passed to createClient<Database>() for full type safety.
 * Currently optional since we're using the basic client, but useful for
 * teams or larger projects.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        /** What you get back from SELECT */
        Row: Profile;
        /** What you provide for INSERT (some fields have defaults) */
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          location?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        /** What you can provide for UPDATE (all fields optional except id) */
        Update: {
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          location?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      reserved_usernames: {
        Row: ReservedUsername;
        Insert: {
          username: string;
          reason?: string | null;
        };
        Update: {
          username?: string;
          reason?: string | null;
        };
      };
    };
    Functions: {
      /** Validates username format (returns true if valid) */
      is_valid_username: {
        Args: { username: string };
        Returns: boolean;
      };
      /** Checks if username is available (returns true if available) */
      is_username_available: {
        Args: { desired_username: string };
        Returns: boolean;
      };
    };
  };
}
