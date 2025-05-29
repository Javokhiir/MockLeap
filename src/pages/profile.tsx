// Create the missing profile.tsx file
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Avatar, 
  Tabs, 
  Tab, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Spinner,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../services/supabase';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, updateProfile } = useAuth();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [formData, setFormData] = React.useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || ''
  });
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [selectedTab, setSelectedTab] = React.useState('personal');
  
  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    setIsUpdating(true);
    
    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);
      
      if (data) {
        // Update form data
        setFormData(prev => ({
          ...prev,
          avatar_url: data.publicUrl
        }));
        
        // Update profile
        await updateProfile({ avatar_url: data.publicUrl });
        
        addToast({
          title: t('success'),
          description: t('profile.avatarUpdated'),
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addToast({
        title: t('error'),
        description: t('errors.generic'),
        severity: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Save profile
  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.username) {
      newErrors.username = t('profile.usernameRequired');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Update profile in Supabase
      await updateProfile({
        username: formData.username,
        full_name: formData.full_name
      });
      
      addToast({
        title: t('success'),
        description: t('profile.profileUpdated'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({
        title: t('error'),
        description: t('errors.generic'),
        severity: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Change password
  const handleChangePassword = async () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = t('profile.currentPasswordRequired');
    }
    
    if (!newPassword) {
      newErrors.newPassword = t('profile.newPasswordRequired');
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('auth.invalidPassword');
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDontMatch');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      addToast({
        title: t('success'),
        description: t('profile.passwordChanged'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      addToast({
        title: t('error'),
        description: t('errors.generic'),
        severity: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Delete user from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      // Sign out
      await supabase.auth.signOut();
      
      onClose();
      
      addToast({
        title: t('success'),
        description: t('profile.accountDeleted'),
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      addToast({
        title: t('error'),
        description: t('errors.generic'),
        severity: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardBody className="p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Avatar
                  src={formData.avatar_url || undefined}
                  name={profile?.username || user?.email?.charAt(0) || "U"}
                  className="w-32 h-32 text-4xl"
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
                >
                  <Icon icon="lucide:camera" />
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUpdating}
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-semibold">
                {profile?.full_name || profile?.username}
              </h2>
              <p className="text-default-500">{user?.email}</p>
              
              <div className="mt-6 pt-6 border-t border-divider">
                <div className="flex justify-between mb-2">
                  <span className="text-default-600">{t('dashboard.testsCompleted')}</span>
                  <span className="font-medium">{profile?.tests_completed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-600">{t('dashboard.points')}</span>
                  <span className="font-medium">{profile?.total_points || 0}</span>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="mt-6">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('profile.dangerZone')}</h3>
              
              <Button
                color="danger"
                variant="flat"
                fullWidth
                onPress={onOpen}
                startContent={<Icon icon="lucide:trash-2" />}
              >
                {t('profile.deleteAccount')}
              </Button>
            </CardBody>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardBody className="p-6">
              <Tabs 
                aria-label="Profile tabs" 
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab as any}
              >
                <Tab key="personal" title={t('profile.personalInfo')}>
                  <div className="py-4 space-y-4">
                    <Input
                      label={t('auth.username')}
                      value={formData.username}
                      onValueChange={(value) => handleInputChange('username', value)}
                      isInvalid={!!errors.username}
                      errorMessage={errors.username}
                      isRequired
                    />
                    
                    <Input
                      label={t('auth.fullName')}
                      value={formData.full_name}
                      onValueChange={(value) => handleInputChange('full_name', value)}
                    />
                    
                    <Input
                      label={t('auth.email')}
                      value={user?.email || ''}
                      isReadOnly
                      isDisabled
                    />
                    
                    <div className="flex justify-end">
                      <Button
                        color="primary"
                        onPress={handleSaveProfile}
                        isLoading={isUpdating}
                      >
                        {t('common.save')}
                      </Button>
                    </div>
                  </div>
                </Tab>
                
                <Tab key="password" title={t('profile.changePassword')}>
                  <div className="py-4 space-y-4">
                    <Input
                      type="password"
                      label={t('profile.currentPassword')}
                      value={currentPassword}
                      onValueChange={setCurrentPassword}
                      isInvalid={!!errors.currentPassword}
                      errorMessage={errors.currentPassword}
                    />
                    
                    <Input
                      type="password"
                      label={t('profile.newPassword')}
                      value={newPassword}
                      onValueChange={setNewPassword}
                      isInvalid={!!errors.newPassword}
                      errorMessage={errors.newPassword}
                    />
                    
                    <Input
                      type="password"
                      label={t('auth.confirmPassword')}
                      value={confirmPassword}
                      onValueChange={setConfirmPassword}
                      isInvalid={!!errors.confirmPassword}
                      errorMessage={errors.confirmPassword}
                    />
                    
                    <div className="flex justify-end">
                      <Button
                        color="primary"
                        onPress={handleChangePassword}
                        isLoading={isUpdating}
                      >
                        {t('common.save')}
                      </Button>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>
      
      {/* Delete Account Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-danger">{t('profile.deleteAccount')}</ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <div className="py-8 flex flex-col items-center">
                    <Spinner size="lg" color="danger" className="mb-4" />
                    <p className="text-center text-default-600">
                      {t('profile.deletingAccount')}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mb-4">{t('profile.confirmDelete')}</p>
                    <p className="text-default-500 text-sm">
                      {t('profile.deleteWarning')}
                    </p>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={onClose}
                  isDisabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  color="danger" 
                  onPress={handleDeleteAccount}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  {t('profile.deleteAccount')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Profile;