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
  /** User role: 'user', 'moderator', or 'admin' */
  role: 'user' | 'moderator' | 'admin';
  /** When the profile was created */
  created_at: string;
  /** When the profile was last updated */
  updated_at: string;
}

/**
 * A user's pet turtle stored in the public.user_turtles table.
 * Users can add, edit, and remove turtles from their profile.
 */
export interface UserTurtle {
  /** UUID primary key */
  id: string;
  /** UUID of the owner (references auth.users) */
  user_id: string;
  /** The turtle's given name */
  name: string;
  /** Optional FK to turtle_species for linked species */
  species_id: number | null;
  /** Species common name (denormalized for display) */
  species_common_name: string | null;
  /** Species scientific name (denormalized for display) */
  species_scientific_name: string | null;
  /** Notes/description about this turtle */
  bio: string | null;
  /** URL to turtle photo in Supabase Storage */
  photo_url: string | null;
  /** Sex of the turtle */
  sex: "male" | "female" | "unknown" | null;
  /** Date the turtle was acquired (YYYY-MM-DD) */
  date_acquired: string | null;
  /** When the record was created */
  created_at: string;
  /** When the record was last updated */
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
 * A comment on a community post.
 * Supports threading via parent_comment_id and soft deletes via is_deleted.
 */
export interface Comment {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  author_id: string;
  body: string;
  score: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * A saved/bookmarked post by a user.
 */
export interface SavedPost {
  user_id: string;
  post_id: number;
  saved_at: string;
}

/**
 * A report filed against a post or comment.
 */
export interface Report {
  id: number;
  reporter_id: string;
  content_type: 'post' | 'comment';
  content_id: number;
  reason: 'spam' | 'harassment' | 'misinformation' | 'off_topic' | 'inappropriate' | 'self_harm' | 'other';
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
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
      user_turtles: {
        Row: UserTurtle;
        Insert: {
          user_id: string;
          name: string;
          species_id?: number | null;
          species_common_name?: string | null;
          species_scientific_name?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          sex?: "male" | "female" | "unknown" | null;
          date_acquired?: string | null;
        };
        Update: {
          name?: string;
          species_id?: number | null;
          species_common_name?: string | null;
          species_scientific_name?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          sex?: "male" | "female" | "unknown" | null;
          date_acquired?: string | null;
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
