// Create a new admin dashboard page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardBody, 
  Button, 
  Tabs, 
  Tab, 
  Spinner,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/auth-context';
import { adminAPI } from '../../services/mock-backend';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('overview');
  
  // Stats
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalTests: 0,
    activeUsers: 0,
    averageScore: 0,
  });
  
  // Check if user is admin
  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        const isUserAdmin = adminAPI.isAdmin(user.id);
        
        if (!isUserAdmin) {
          addToast({
            title: 'Access Denied',
            description: 'You do not have permission to access the admin panel.',
            severity: 'danger',
          });
          navigate('/dashboard');
          return;
        }
        
        setIsAdmin(true);
        await loadStats();
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, [user, navigate]);
  
  // Load stats
  const loadStats = async () => {
    try {
      const profiles = adminAPI.getAllProfiles();
      const testResults = adminAPI.getAllTestResults();
      
      // Calculate stats
      const totalUsers = profiles.length;
      const totalTests = testResults.length;
      
      // Active users (with at least one test)
      const userIdsWithTests = new Set(testResults.map(t => t.user_id));
      const activeUsers = userIdsWithTests.size;
      
      // Average score
      const totalScore = testResults.reduce((sum, test) => sum + test.score, 0);
      const averageScore = totalTests > 0 ? Math.round((totalScore / totalTests) * 10) / 10 : 0;
      
      setStats({
        totalUsers,
        totalTests,
        activeUsers,
        averageScore,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  // Generate test data
  const handleGenerateTestData = async () => {
    try {
      const result = adminAPI.generateTestData(10);
      
      addToast({
        title: 'Test Data Generated',
        description: `Created ${result.usersCreated} users and ${result.profilesCreated} profiles.`,
        severity: 'success',
      });
      
      await loadStats();
    } catch (error) {
      console.error('Error generating test data:', error);
      addToast({
        title: 'Error',
        description: 'Failed to generate test data.',
        severity: 'danger',
      });
    }
  };
  
  // Reset database
  const handleResetDatabase = async () => {
    if (window.confirm('Are you sure you want to reset the database? This will delete all data except the admin user.')) {
      try {
        adminAPI.resetDatabase();
        
        addToast({
          title: 'Database Reset',
          description: 'The database has been reset successfully.',
          severity: 'success',
        });
        
        await loadStats();
      } catch (error) {
        console.error('Error resetting database:', error);
        addToast({
          title: 'Error',
          description: 'Failed to reset database.',
          severity: 'danger',
        });
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            onPress={handleGenerateTestData}
            startContent={<Icon icon="lucide:database" />}
          >
            Generate Test Data
          </Button>
          <Button
            color="danger"
            variant="flat"
            onPress={handleResetDatabase}
            startContent={<Icon icon="lucide:trash-2" />}
          >
            Reset Database
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Icon icon="lucide:users" className="text-primary-600 text-xl" />
            </div>
            <div>
              <p className="text-default-500 text-sm">Total Users</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-secondary-100 rounded-full">
              <Icon icon="lucide:file-text" className="text-secondary-600 text-xl" />
            </div>
            <div>
              <p className="text-default-500 text-sm">Total Tests</p>
              <p className="text-2xl font-semibold">{stats.totalTests}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-success-100 rounded-full">
              <Icon icon="lucide:user-check" className="text-success-600 text-xl" />
            </div>
            <div>
              <p className="text-default-500 text-sm">Active Users</p>
              <p className="text-2xl font-semibold">{stats.activeUsers}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-warning-100 rounded-full">
              <Icon icon="lucide:bar-chart-2" className="text-warning-600 text-xl" />
            </div>
            <div>
              <p className="text-default-500 text-sm">Average Score</p>
              <p className="text-2xl font-semibold">{stats.averageScore}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Main Content */}
      <Card>
        <CardBody className="p-0">
          <Tabs 
            aria-label="Admin sections" 
            selectedKey={activeTab}
            onSelectionChange={setActiveTab as any}
            className="w-full"
          >
            <Tab key="overview" title="Overview">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">System Overview</h2>
                <p className="text-default-600 mb-4">
                  Welcome to the RealMockTest AI Assistant admin panel. Here you can manage users, view test results, and monitor system performance.
                </p>
                
                <div className="bg-default-50 p-4 rounded-medium mb-4">
                  <h3 className="font-medium mb-2">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Button
                      as="a"
                      href="#/admin/users"
                      color="primary"
                      variant="flat"
                      startContent={<Icon icon="lucide:users" />}
                      className="justify-start"
                    >
                      Manage Users
                    </Button>
                    <Button
                      as="a"
                      href="#/admin/tests"
                      color="primary"
                      variant="flat"
                      startContent={<Icon icon="lucide:file-text" />}
                      className="justify-start"
                    >
                      View Test Results
                    </Button>
                    <Button
                      as="a"
                      href="#/admin/settings"
                      color="primary"
                      variant="flat"
                      startContent={<Icon icon="lucide:settings" />}
                      className="justify-start"
                    >
                      System Settings
                    </Button>
                  </div>
                </div>
                
                <div className="bg-primary-50 p-4 rounded-medium">
                  <h3 className="font-medium mb-2">About Mock Backend</h3>
                  <p className="text-sm text-default-600 mb-2">
                    This admin panel is using a mock backend that stores data in the browser's localStorage. 
                    All data will be lost if you clear your browser data or switch browsers.
                  </p>
                  <p className="text-sm text-default-600">
                    Use the "Generate Test Data" button to create sample users and test results. 
                    Use "Reset Database" to clear all data except the admin user.
                  </p>
                </div>
              </div>
            </Tab>
            
            <Tab key="users" title="Users">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <UserManagement onUpdate={loadStats} />
              </div>
            </Tab>
            
            <Tab key="tests" title="Test Results">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                <TestResultsManagement />
              </div>
            </Tab>
            
            <Tab key="settings" title="Settings">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">System Settings</h2>
                <p className="text-default-600 mb-4">
                  Configure system settings and preferences.
                </p>
                
                <div className="bg-default-50 p-4 rounded-medium">
                  <h3 className="font-medium mb-4">Mock Backend Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Button
                        color="primary"
                        onPress={handleGenerateTestData}
                        startContent={<Icon icon="lucide:database" />}
                      >
                        Generate Test Data
                      </Button>
                      <p className="text-sm text-default-500 mt-2">
                        Creates 10 sample users with random test results.
                      </p>
                    </div>
                    
                    <div>
                      <Button
                        color="danger"
                        onPress={handleResetDatabase}
                        startContent={<Icon icon="lucide:trash-2" />}
                      >
                        Reset Database
                      </Button>
                      <p className="text-sm text-default-500 mt-2">
                        Deletes all users and data except the admin user.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

// User Management Component
const UserManagement: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [profiles, setProfiles] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAddUserModal, setShowAddUserModal] = React.useState(false);
  
  // Load users
  React.useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = () => {
    try {
      setIsLoading(true);
      const allUsers = adminAPI.getAllUsers();
      const allProfiles = adminAPI.getAllProfiles();
      
      // Combine user and profile data
      const usersWithProfiles = allUsers.map(user => {
        const profile = allProfiles.find(p => p.id === user.id) || {};
        return { ...user, ...profile };
      });
      
      setUsers(usersWithProfiles);
      setProfiles(allProfiles);
    } catch (error) {
      console.error('Error loading users:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load users.',
        severity: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete user
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        adminAPI.deleteUser(userId);
        
        addToast({
          title: 'User Deleted',
          description: 'The user has been deleted successfully.',
          severity: 'success',
        });
        
        loadUsers();
        onUpdate();
      } catch (error) {
        console.error('Error deleting user:', error);
        addToast({
          title: 'Error',
          description: 'Failed to delete user.',
          severity: 'danger',
        });
      }
    }
  };
  
  // Add user
  const handleAddUser = (email: string, password: string, isAdmin: boolean) => {
    try {
      adminAPI.createUser(email, password, isAdmin);
      
      addToast({
        title: 'User Created',
        description: 'The user has been created successfully.',
        severity: 'success',
      });
      
      setShowAddUserModal(false);
      loadUsers();
      onUpdate();
    } catch (error) {
      console.error('Error creating user:', error);
      addToast({
        title: 'Error',
        description: 'Failed to create user.',
        severity: 'danger',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-default-600">Total users: {users.length}</p>
        <Button
          color="primary"
          onPress={() => setShowAddUserModal(true)}
          startContent={<Icon icon="lucide:user-plus" />}
        >
          Add User
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-default-100">
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Tests</th>
              <th className="p-3 text-left">Points</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-default-50">
                <td className="p-3">{user.username || '-'}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  {user.user_metadata?.isAdmin ? (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-default-100 text-default-700 rounded-full text-xs font-medium">
                      User
                    </span>
                  )}
                </td>
                <td className="p-3">{user.tests_completed || 0}</td>
                <td className="p-3">{user.total_points || 0}</td>
                <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      isIconOnly
                      aria-label="Edit user"
                    >
                      <Icon icon="lucide:edit" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      aria-label="Delete user"
                      onPress={() => handleDeleteUser(user.id)}
                      isDisabled={user.user_metadata?.isAdmin} // Prevent deleting admin
                    >
                      <Icon icon="lucide:trash-2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUser}
        />
      )}
    </div>
  );
};

// Add User Modal
const AddUserModal: React.FC<{
  onClose: () => void;
  onSubmit: (email: string, password: string, isAdmin: boolean) => void;
}> = ({ onClose, onSubmit }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isAdmin, setIsAdmin] = React.useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, isAdmin);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add User</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2 border border-default-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-2 border border-default-300 rounded-md"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={e => setIsAdmin(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isAdmin">Admin User</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="flat"
              onPress={onClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
            >
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Test Results Management Component
const TestResultsManagement: React.FC = () => {
  const [testResults, setTestResults] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Load test results
  React.useEffect(() => {
    try {
      setIsLoading(true);
      const results = adminAPI.getAllTestResults();
      const profiles = adminAPI.getAllProfiles();
      
      // Add username to test results
      const resultsWithUsername = results.map(result => {
        const profile = profiles.find(p => p.id === result.user_id);
        return {
          ...result,
          username: profile?.username || 'Unknown',
        };
      });
      
      setTestResults(resultsWithUsername);
    } catch (error) {
      console.error('Error loading test results:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load test results.',
        severity: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }
  
  return (
    <div>
      <p className="text-default-600 mb-4">Total test results: {testResults.length}</p>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-default-100">
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Test Type</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Completed</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {testResults.map(result => (
              <tr key={result.id} className="hover:bg-default-50">
                <td className="p-3">{result.username}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.test_type === 'listening' ? 'bg-primary-100 text-primary-700' :
                    result.test_type === 'reading' ? 'bg-secondary-100 text-secondary-700' :
                    result.test_type === 'writing' ? 'bg-success-100 text-success-700' :
                    'bg-warning-100 text-warning-700'
                  }`}>
                    {result.test_type.charAt(0).toUpperCase() + result.test_type.slice(1)}
                  </span>
                </td>
                <td className="p-3">{result.score}/{result.max_score}</td>
                <td className="p-3">
                  {Math.floor(result.duration / 60)}m {result.duration % 60}s
                </td>
                <td className="p-3">{new Date(result.completed_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      isIconOnly
                      aria-label="View details"
                    >
                      <Icon icon="lucide:eye" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;