import React, { createContext, useContext, useState } from 'react';
import { sampleUsers } from '../data/initialPipelines';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(sampleUsers.user123);

  const login = (userId) => {
    setCurrentUser(sampleUsers[userId]);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const checkPipelineAccess = (pipeline) => {
    if (!currentUser || !pipeline) return 'none';

    // Admin has full access to everything
    if (currentUser.role === 'admin') return 'full';

    // Check if user is owner
    if (pipeline.ownerUserId === currentUser.id) return 'full';

    // Check specific permissions
    const userPermission = pipeline.permissions.find(p => p.userId === currentUser.id);
    if (userPermission) return userPermission.accessLevel;

    // Check public access
    if (pipeline.isPublic) return 'read';

    return 'none';
  };

  const value = {
    currentUser,
    login,
    logout,
    checkPipelineAccess
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};