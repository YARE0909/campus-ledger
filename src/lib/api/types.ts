export interface ApiResponse<T> {
  status: number;
  error?: boolean;
  message?: string;
  errorMessage?: string | null;
  data?: T;
}

export type Endpoint<Request, Response> = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: (params: Request) => string;
  type: "OPEN" | "CLOSE";
  disableCache?: boolean;
};

//   Define request and response types for api endpoints below

// User Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    sub: string;
    role: string;
    email: string;
    name: string;
  };
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface EnrollmentStatus {
  name: string;
  value: number;
  color: string;
}

export interface InstitutionsByTier {
  tier: string;
  count: number;
}

export interface SuperAdminDashboardResponse {
  totalInstitutions: number;
  totalActiveStudents: number;
  activeSubscriptionTiers: number;
  totalRevenue: number;
  monthlyRevenueData: MonthlyRevenue[];
  enrollmentStatusData: EnrollmentStatus[];
  institutionsByTierData: InstitutionsByTier[];
  overdueInstitutions: number;
  totalCourses: number;
}

export interface SubscriptionTierResponse {
  id: string;
  name: string;
}

export interface Summary {
  totalInstitutions: number;
  totalActiveStudents: number;
  activeSubscriptionTiers: number;
  totalRevenue: number;
  monthlyRevenueData: MonthlyRevenue[];
  overdueInstitutions: number;
  totalCourses: number;
}

export interface Institution {
  id: string;
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  subscription_tier: string;
  subscription_tier_id: string;
  status: string;
  active_students: number;
  total_courses: number;
  monthly_revenue: number;
  created_at: string;
  last_payment: string | null;
  payment_status: string;
}

export interface InstitutionAnalyticsResponse {
  summary: Summary;
  institutions: Institution[];
}

export interface CreateInstitutionRequest {
  name: string;
  contact_email: string;
  phone?: string;
  address?: string;
  subscription_tier_id: string;
}

export interface CreateInstitutionResponse {
  id: string;
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  subscription_tier_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionTierAnalytics {
  id: string;
  name: string;
  student_count_min: number;
  student_count_max: number;
  price_per_student: number;
  billing_cycle: string;
  created_at: Date;
  updated_at: Date;
  active_institutions: number;
  total_revenue: number;
}

export interface GetSubscriptionTiersAnalyticsResponse {
  subscriptionTiers: SubscriptionTierAnalytics[];
}

export interface CreateSubscriptionTierRequest {
  name: string;
  student_count_min: number;
  student_count_max: number;
  price_per_student: number;
  billing_cycle: string;
}

// Response data interface (what Prisma returns after creating)
export interface CreateSubscriptionTierResponse {
  id: string;
  name: string;
  student_count_min: number;
  student_count_max: number;
  price_per_student: number;
  billing_cycle: string;
  created_at: Date;
  updated_at: Date;
}

// Full API response type