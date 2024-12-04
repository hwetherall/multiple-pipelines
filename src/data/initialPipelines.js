export const sampleUsers = {
  admin123: {
    id: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  user123: {
    id: 'user123',
    name: 'Regular User',
    role: 'user'
  }
};

export const initialPipelines = {
  mainPipeline: {
    id: 'mainPipeline',
    name: 'Main Pipeline',
    ownerUserId: 'admin123',
    isPublic: true,
    permissions: [
      { userId: 'admin123', accessLevel: 'full' },
      { userId: 'user123', accessLevel: 'read' }
    ],
    companies: {
      'company-1': { id: 'company-1', name: 'Startup A', description: 'AI/ML Platform' },
      'company-2': { id: 'company-2', name: 'Startup B', description: 'FinTech Solution' },
      'company-3': { id: 'company-3', name: 'Startup C', description: 'SaaS Platform' },
    },
    columns: {
      'inbox': {
        id: 'inbox',
        title: 'Inbox',
        companyIds: ['company-1', 'company-2'],
      },
      'due-diligence': {
        id: 'due-diligence',
        title: 'Due Diligence',
        companyIds: ['company-3'],
      },
      'interviewed': {
        id: 'interviewed',
        title: 'Interviewed Founder',
        companyIds: [],
      },
      'investment-committee': {
        id: 'investment-committee',
        title: 'Investment Committee',
        companyIds: [],
      },
      'completed': {
        id: 'completed',
        title: 'Completed',
        companyIds: [],
      },
    },
    columnOrder: ['inbox', 'due-diligence', 'interviewed', 'investment-committee', 'completed'],
  },
  secondaryPipeline: {
    id: 'secondaryPipeline',
    name: 'Secondary Pipeline',
    ownerUserId: 'user123',
    isPublic: false,
    permissions: [
      { userId: 'admin123', accessLevel: 'full' },
      { userId: 'user123', accessLevel: 'full' }
    ],
    companies: {
      'company-4': { id: 'company-4', name: 'Startup D', description: 'E-commerce Platform' },
      'company-5': { id: 'company-5', name: 'Startup E', description: 'Healthcare Tech' },
    },
    columns: {
      'screening': {
        id: 'screening',
        title: 'Initial Screening',
        companyIds: ['company-4'],
      },
      'research': {
        id: 'research',
        title: 'Market Research',
        companyIds: ['company-5'],
      },
      'team-review': {
        id: 'team-review',
        title: 'Team Review',
        companyIds: [],
      },
      'technical-assessment': {
        id: 'technical-assessment',
        title: 'Technical Assessment',
        companyIds: [],
      },
      'financial-review': {
        id: 'financial-review',
        title: 'Financial Review',
        companyIds: [],
      },
      'final-decision': {
        id: 'final-decision',
        title: 'Final Decision',
        companyIds: [],
      },
      'post-investment': {
        id: 'post-investment',
        title: 'Post-Investment',
        companyIds: [],
      },
    },
    columnOrder: [
      'screening',
      'research',
      'team-review',
      'technical-assessment',
      'financial-review',
      'final-decision',
      'post-investment'
    ],
  },
}; 