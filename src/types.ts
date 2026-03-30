export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'dev' | 'writer' | 'recruiter' | 'admin';
  pseudo?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  status?: string;
  experienceYears?: number;
  githubUrl?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  lastLoginAt?: any;
  createdAt?: any;
  followers?: string[];
  following?: string[];
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: string;
  details: string;
  timestamp: any;
}
