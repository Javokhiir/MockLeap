// Create a new mock backend service to replace Supabase
import { Profile, TestResult, TestSession } from './supabase';

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'realmocktest_users',
  PROFILES: 'realmocktest_profiles',
  TEST_RESULTS: 'realmocktest_test_results',
  TEST_SESSIONS: 'realmocktest_test_sessions',
  CURRENT_USER: 'realmocktest_current_user',
  CURRENT_SESSION: 'realmocktest_current_session',
};

// Types
type User = {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  user_metadata: Record<string, any>;
  created_at: string;
};

type Session = {
  user: User;
  access_token: string;
  expires_at: number;
};

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return defaultValue;
  }
};

const setItem = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error);
  }
};

// Initialize mock data
const initializeMockData = () => {
  // Check if data already exists
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    // Create admin user
    const adminUser: User = {
      id: 'admin-user-id',
      email: 'admin@realmocktest.com',
      password: 'superAdm1n',
      user_metadata: { isAdmin: true },
      created_at: new Date().toISOString(),
    };
    
    const adminProfile: Profile = {
      id: adminUser.id,
      username: 'admin',
      full_name: 'Admin User',
      language_preference: 'en',
      created_at: new Date().toISOString(),
      total_points: 0,
      tests_completed: 0,
    };
    
    // Set initial data
    setItem(STORAGE_KEYS.USERS, [adminUser]);
    setItem(STORAGE_KEYS.PROFILES, [adminProfile]);
    setItem(STORAGE_KEYS.TEST_RESULTS, []);
    setItem(STORAGE_KEYS.TEST_SESSIONS, []);
  }
};

// Initialize on import
initializeMockData();

// Mock backend API
export const mockBackend = {
  auth: {
    // Get current session
    getSession: () => {
      const session = getItem<Session | null>(STORAGE_KEYS.CURRENT_SESSION, null);
      return Promise.resolve({ data: { session } });
    },
    
    // Sign in with email and password
    signInWithPassword: ({ email, password }: { email: string; password: string }) => {
      const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const session: Session = {
          user,
          access_token: `mock-token-${Date.now()}`,
          expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        
        setItem(STORAGE_KEYS.CURRENT_USER, user);
        setItem(STORAGE_KEYS.CURRENT_SESSION, session);
        
        return Promise.resolve({ data: { user, session }, error: null });
      }
      
      return Promise.resolve({ data: {}, error: { message: 'Invalid login credentials' } });
    },
    
    // Sign up with email and password
    signUp: ({ email, password, options }: { email: string; password: string; options?: { data?: any } }) => {
      const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        return Promise.resolve({ data: {}, error: { message: 'User already exists' } });
      }
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        password,
        user_metadata: options?.data || {},
        created_at: new Date().toISOString(),
      };
      
      // Update users list
      users.push(newUser);
      setItem(STORAGE_KEYS.USERS, users);
      
      // Create session
      const session: Session = {
        user: newUser,
        access_token: `mock-token-${Date.now()}`,
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      
      setItem(STORAGE_KEYS.CURRENT_USER, newUser);
      setItem(STORAGE_KEYS.CURRENT_SESSION, session);
      
      return Promise.resolve({ data: { user: newUser, session }, error: null });
    },
    
    // Sign out
    signOut: () => {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      
      return Promise.resolve({ error: null });
    },
    
    // Reset password
    resetPasswordForEmail: (email: string, options?: any) => {
      const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return Promise.resolve({ error: { message: 'User not found' } });
      }
      
      // In a real app, this would send an email
      console.log(`Password reset requested for ${email}`);
      console.log('Reset options:', options);
      
      return Promise.resolve({ error: null });
    },
    
    // Update user
    updateUser: ({ password }: { password?: string }) => {
      const currentUser = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      
      if (!currentUser) {
        return Promise.resolve({ error: { message: 'No user logged in' } });
      }
      
      const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) {
        return Promise.resolve({ error: { message: 'User not found' } });
      }
      
      // Update password
      if (password) {
        users[userIndex].password = password;
      }
      
      setItem(STORAGE_KEYS.USERS, users);
      setItem(STORAGE_KEYS.CURRENT_USER, users[userIndex]);
      
      return Promise.resolve({ data: { user: users[userIndex] }, error: null });
    },
    
    // Listen for auth changes
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      // This is a simplified mock implementation
      // In a real app, this would set up event listeners
      
      const session = getItem<Session | null>(STORAGE_KEYS.CURRENT_SESSION, null);
      setTimeout(() => {
        callback('SIGNED_IN', session);
      }, 0);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
    
    // Admin functions
    admin: {
      deleteUser: (userId: string) => {
        const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
        const updatedUsers = users.filter(u => u.id !== userId);
        
        if (users.length === updatedUsers.length) {
          return Promise.resolve({ error: { message: 'User not found' } });
        }
        
        setItem(STORAGE_KEYS.USERS, updatedUsers);
        
        // Also delete profile
        const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
        const updatedProfiles = profiles.filter(p => p.id !== userId);
        setItem(STORAGE_KEYS.PROFILES, updatedProfiles);
        
        // If current user is being deleted, sign out
        const currentUser = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
        if (currentUser && currentUser.id === userId) {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
        }
        
        return Promise.resolve({ error: null });
      },
    },
  },
  
  // Database operations
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        single: () => {
          const items = getItem<any[]>(`realmocktest_${table}`, []);
          const item = items.find(item => item[column] === value);
          
          return Promise.resolve({
            data: item || null,
            error: item ? null : { message: 'Item not found' },
          });
        },
        order: (orderColumn: string, { ascending = true } = {}) => ({
          limit: (limit: number) => {
            const items = getItem<any[]>(`realmocktest_${table}`, [])
              .filter(item => item[column] === value)
              .sort((a, b) => {
                const valA = a[orderColumn];
                const valB = b[orderColumn];
                return ascending
                  ? valA > valB ? 1 : valA < valB ? -1 : 0
                  : valA < valB ? 1 : valA > valB ? -1 : 0;
              })
              .slice(0, limit);
            
            return Promise.resolve({ data: items, error: null });
          },
        }),
        limit: (limit: number) => {
          const items = getItem<any[]>(`realmocktest_${table}`, [])
            .filter(item => item[column] === value)
            .slice(0, limit);
          
          return Promise.resolve({ data: items, error: null });
        },
      }),
      order: (orderColumn: string, { ascending = true } = {}) => ({
        limit: (limit: number) => {
          const items = getItem<any[]>(`realmocktest_${table}`, [])
            .sort((a, b) => {
              const valA = a[orderColumn];
              const valB = b[orderColumn];
              return ascending
                ? valA > valB ? 1 : valA < valB ? -1 : 0
                : valA < valB ? 1 : valA > valB ? -1 : 0;
            })
            .slice(0, limit);
          
          return Promise.resolve({ data: items, error: null });
        },
      }),
      limit: (limit: number) => {
        const items = getItem<any[]>(`realmocktest_${table}`, []).slice(0, limit);
        return Promise.resolve({ data: items, error: null });
      },
    }),
    insert: (data: any) => {
      const items = getItem<any[]>(`realmocktest_${table}`, []);
      const newItem = Array.isArray(data) ? data[0] : data;
      
      // Add ID if not provided
      if (!newItem.id) {
        newItem.id = `${table}-${Date.now()}`;
      }
      
      items.push(newItem);
      setItem(`realmocktest_${table}`, items);
      
      return Promise.resolve({ data: [newItem], error: null });
    },
    update: (updates: any) => ({
      eq: (column: string, value: any) => {
        const items = getItem<any[]>(`realmocktest_${table}`, []);
        const index = items.findIndex(item => item[column] === value);
        
        if (index !== -1) {
          items[index] = { ...items[index], ...updates };
          setItem(`realmocktest_${table}`, items);
        }
        
        return Promise.resolve({ data: null, error: null });
      },
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        const items = getItem<any[]>(`realmocktest_${table}`, []);
        const updatedItems = items.filter(item => item[column] !== value);
        
        setItem(`realmocktest_${table}`, updatedItems);
        
        return Promise.resolve({ data: null, error: null });
      },
    }),
  }),
  
  // Storage operations
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => {
        // In a real app, this would upload to a server
        // Here we just simulate success
        console.log(`Uploading file to ${bucket}/${path}`);
        
        return Promise.resolve({
          data: { path },
          error: null,
        });
      },
      getPublicUrl: (path: string) => ({
        data: {
          publicUrl: `https://mock-storage.realmocktest.com/${bucket}/${path}`,
        },
      }),
    }),
  },
  
  // RPC calls
  rpc: (func: string, params: any) => {
    if (func === 'increment_user_stats') {
      const { user_id, points_to_add, tests_to_add } = params;
      
      const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
      const profileIndex = profiles.findIndex(p => p.id === user_id);
      
      if (profileIndex !== -1) {
        profiles[profileIndex].total_points = (profiles[profileIndex].total_points || 0) + points_to_add;
        profiles[profileIndex].tests_completed = (profiles[profileIndex].tests_completed || 0) + tests_to_add;
        setItem(STORAGE_KEYS.PROFILES, profiles);
      }
      
      return Promise.resolve({ data: null, error: null });
    }
    
    return Promise.resolve({ error: { message: 'Function not implemented' } });
  },
};

// Admin API for managing users and data
export const adminAPI = {
  // Get all users
  getAllUsers: () => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
    return users.map(({ password, ...user }) => user); // Remove passwords
  },
  
  // Get all profiles
  getAllProfiles: () => {
    return getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
  },
  
  // Get all test results
  getAllTestResults: () => {
    return getItem<TestResult[]>(STORAGE_KEYS.TEST_RESULTS, []);
  },
  
  // Get all test sessions
  getAllTestSessions: () => {
    return getItem<TestSession[]>(STORAGE_KEYS.TEST_SESSIONS, []);
  },
  
  // Create user (admin only)
  createUser: (email: string, password: string, isAdmin: boolean = false) => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      user_metadata: { isAdmin },
      created_at: new Date().toISOString(),
    };
    
    // Update users list
    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);
    
    // Create profile
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
    const newProfile: Profile = {
      id: newUser.id,
      username: email.split('@')[0],
      language_preference: 'en',
      created_at: new Date().toISOString(),
      total_points: 0,
      tests_completed: 0,
    };
    
    profiles.push(newProfile);
    setItem(STORAGE_KEYS.PROFILES, profiles);
    
    return { ...newUser, password: undefined }; // Remove password
  },
  
  // Delete user (admin only)
  deleteUser: (userId: string) => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
    const updatedUsers = users.filter(u => u.id !== userId);
    
    if (users.length === updatedUsers.length) {
      throw new Error('User not found');
    }
    
    setItem(STORAGE_KEYS.USERS, updatedUsers);
    
    // Also delete profile
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
    const updatedProfiles = profiles.filter(p => p.id !== userId);
    setItem(STORAGE_KEYS.PROFILES, updatedProfiles);
    
    // Delete test results
    const testResults = getItem<TestResult[]>(STORAGE_KEYS.TEST_RESULTS, []);
    const updatedTestResults = testResults.filter(t => t.user_id !== userId);
    setItem(STORAGE_KEYS.TEST_RESULTS, updatedTestResults);
    
    // Delete test sessions
    const testSessions = getItem<TestSession[]>(STORAGE_KEYS.TEST_SESSIONS, []);
    const updatedTestSessions = testSessions.filter(t => t.user_id !== userId);
    setItem(STORAGE_KEYS.TEST_SESSIONS, updatedTestSessions);
    
    return true;
  },
  
  // Update user (admin only)
  updateUser: (userId: string, updates: { email?: string; password?: string; isAdmin?: boolean }) => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    if (updates.email) {
      users[userIndex].email = updates.email;
    }
    
    if (updates.password) {
      users[userIndex].password = updates.password;
    }
    
    if (updates.isAdmin !== undefined) {
      users[userIndex].user_metadata = {
        ...users[userIndex].user_metadata,
        isAdmin: updates.isAdmin,
      };
    }
    
    setItem(STORAGE_KEYS.USERS, users);
    
    return { ...users[userIndex], password: undefined }; // Remove password
  },
  
  // Check if user is admin
  isAdmin: (userId: string) => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.id === userId);
    
    return user?.user_metadata?.isAdmin === true;
  },
  
  // Reset database (admin only)
  resetDatabase: () => {
    // Preserve admin user
    const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
    const adminUser = users.find(u => u.user_metadata?.isAdmin === true);
    
    const profiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
    const adminProfile = profiles.find(p => p.id === adminUser?.id);
    
    // Reset data
    setItem(STORAGE_KEYS.USERS, adminUser ? [adminUser] : []);
    setItem(STORAGE_KEYS.PROFILES, adminProfile ? [adminProfile] : []);
    setItem(STORAGE_KEYS.TEST_RESULTS, []);
    setItem(STORAGE_KEYS.TEST_SESSIONS, []);
    
    return true;
  },
  
  // Generate test data (admin only)
  generateTestData: (numUsers: number = 10) => {
    // Generate users
    const existingUsers = getItem<User[]>(STORAGE_KEYS.USERS, []);
    const existingProfiles = getItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
    const newUsers: User[] = [];
    const newProfiles: Profile[] = [];
    
    for (let i = 0; i < numUsers; i++) {
      const userId = `test-user-${Date.now()}-${i}`;
      const email = `testuser${i}@example.com`;
      
      // Create user
      const newUser: User = {
        id: userId,
        email,
        password: 'password123',
        user_metadata: { isTestUser: true },
        created_at: new Date().toISOString(),
      };
      
      newUsers.push(newUser);
      
      // Create profile
      const newProfile: Profile = {
        id: userId,
        username: `testuser${i}`,
        full_name: `Test User ${i}`,
        language_preference: ['en', 'ru', 'uz'][Math.floor(Math.random() * 3)] as 'en' | 'ru' | 'uz',
        created_at: new Date().toISOString(),
        total_points: Math.floor(Math.random() * 1000),
        tests_completed: Math.floor(Math.random() * 20),
      };
      
      newProfiles.push(newProfile);
      
      // Create test results
      const testResults = getItem<TestResult[]>(STORAGE_KEYS.TEST_RESULTS, []);
      const testTypes = ['listening', 'reading', 'writing', 'speaking'];
      
      for (const type of testTypes) {
        if (Math.random() > 0.3) { // 70% chance of having completed this test
          const score = Math.floor(Math.random() * 40) + 50; // Score between 50-90
          
          const testResult: TestResult = {
            id: `test-result-${Date.now()}-${Math.random()}`,
            user_id: userId,
            test_type: type as any,
            score,
            max_score: 90,
            duration: Math.floor(Math.random() * 3600) + 600, // 10-70 minutes
            completed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            strengths: ['Good vocabulary', 'Clear pronunciation', 'Well-structured responses'],
            weaknesses: ['Grammar errors', 'Limited vocabulary in some areas'],
          };
          
          testResults.push(testResult);
        }
      }
      
      setItem(STORAGE_KEYS.TEST_RESULTS, testResults);
    }
    
    // Update storage
    setItem(STORAGE_KEYS.USERS, [...existingUsers, ...newUsers]);
    setItem(STORAGE_KEYS.PROFILES, [...existingProfiles, ...newProfiles]);
    
    return {
      usersCreated: newUsers.length,
      profilesCreated: newProfiles.length,
    };
  },
};