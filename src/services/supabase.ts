import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Import mock backend
import { mockBackend } from './mock-backend';

// Create a mock Supabase client for development when environment variables aren't available
const createMockClient = () => {
  console.warn('Using mock Supabase client. Data will not persist between sessions.');
  
  // In-memory storage for mock data
  const mockData = {
    profiles: [],
    test_results: [],
    test_sessions: []
  };
  
  // Mock implementation of Supabase client
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
      signUp: ({ email, password, options }) => {
        const userId = `user-${Date.now()}`;
        const user = { id: userId, email, user_metadata: options?.data || {} };
        return Promise.resolve({ data: { user }, error: null });
      },
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ error: null }),
      admin: {
        deleteUser: () => Promise.resolve({ error: null })
      }
    },
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: () => {
            const items = mockData[table].filter(item => item[column] === value);
            return Promise.resolve({ 
              data: items.length > 0 ? items[0] : null, 
              error: null 
            });
          },
          order: () => ({
            limit: () => Promise.resolve({ 
              data: mockData[table].filter(item => item[column] === value),
              error: null 
            })
          }),
          limit: () => Promise.resolve({ 
            data: mockData[table].filter(item => item[column] === value),
            error: null 
          })
        }),
        order: () => ({
          limit: (limit) => Promise.resolve({ 
            data: mockData[table].slice(0, limit), 
            error: null 
          })
        }),
        limit: (limit) => Promise.resolve({ 
          data: mockData[table].slice(0, limit), 
          error: null 
        })
      }),
      insert: (data) => {
        const newItem = Array.isArray(data) ? data[0] : data;
        newItem.id = `${table}-${Date.now()}`;
        mockData[table].push(newItem);
        return Promise.resolve({ data: [newItem], error: null });
      },
      update: (data) => ({
        eq: (column, value) => {
          const index = mockData[table].findIndex(item => item[column] === value);
          if (index !== -1) {
            mockData[table][index] = { ...mockData[table][index], ...data };
          }
          return Promise.resolve({ data: null, error: null });
        }
      })
    }),
    storage: {
      from: (bucket) => ({
        upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://mock-storage/${bucket}/${path}` } })
      })
    },
    rpc: (func, params) => {
      if (func === 'increment_user_stats') {
        const { user_id, points_to_add, tests_to_add } = params;
        const userIndex = mockData.profiles.findIndex(profile => profile.id === user_id);
        
        if (userIndex !== -1) {
          mockData.profiles[userIndex].total_points += points_to_add;
          mockData.profiles[userIndex].tests_completed += tests_to_add;
        }
      }
      return Promise.resolve({ data: null, error: null });
    }
  };
};

// Use mock backend instead of Supabase client
export const supabase = mockBackend;

export type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  language_preference: 'en' | 'ru' | 'uz';
  created_at: string;
  updated_at?: string;
  total_points: number;
  tests_completed: number;
};

export type TestResult = {
  id: string;
  user_id: string;
  test_type: 'listening' | 'reading' | 'writing' | 'speaking';
  score: number;
  max_score: number;
  duration: number; // in seconds
  completed_at: string;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
};

export type TestSession = {
  id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  listening_score?: number;
  reading_score?: number;
  writing_score?: number;
  speaking_score?: number;
  overall_score?: number;
  certificate_url?: string;
};