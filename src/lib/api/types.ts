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
  name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
}

export interface GetUserInfoRequest {
  userId: string;
}

export interface GetUserInfoResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant_id: number;
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
  id: number;
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
  subscription_tier_id?: string;
  status: string;
  active_students: number;
  total_courses: number;
  monthly_revenue: number;
  created_at: string;
  last_payment: string | null;
  payment_status: string;
  gst?: string;
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
  gst?: string;
  tenantsubscriptiontier_id?: number;
}

export interface CreateInstitutionResponse {
  id: string;
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  subscription_tier_id?: number;
  created_at: Date;
  updated_at: Date;
}

// Request type for updating an institution: id is required, other fields optional for partial update
export interface UpdateInstitutionRequest {
  id: string;
  name?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  gst?: string;
  tenantsubscriptiontier_id?: number;
}

// Response type for updated institution object returned by the API
export interface UpdateInstitutionResponse {
  id: string;
  name: string;
  contact_email: string;
  phone: string;
  address: string;
  subscription_tier_id?: number;
  status: string;
  active_students: number;
  total_courses: number;
  monthly_revenue: number;
  created_at: string;
  updated_at: string;
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

export interface GetBranchByTenantRequest {
  tenant_id: number;
}

export interface GetBranchByTenantResponse {
  id: string;
  name: string;
  contact_email?: string | null;
  phone?: string | null;
  address?: string | null;
  gst?: string | null;
  tenant_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBranchRequest {
  tenant_id: number;
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  gst?: string;
}

export interface CreateBranchResponse {
  id: string;
  tenant_id: number;
  name: string;
  contact_email?: string | null;
  phone?: string | null;
  address?: string | null;
  gst?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateBranchRequest {
  id: string;
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  gst?: string;
}

export interface UpdateBranchResponse {
  id: string;
  tenant_id: number;
  name: string;
  contact_email?: string | null;
  phone?: string | null;
  address?: string | null;
  gst?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DeleteBranchRequest {
  id: string;
}

export interface GetStudentsRequest {}

export interface GetStudentsResponse {
  id: number;
  branch_id: number;
  branch_name?: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  parent_guardian_name: string | null;
  parent_guardian_contact: string | null;
  parent_guardian_email?: string | null;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "QUIT";
  enrollment_count?: number;
  created_at: string;
}

export interface CreateStudentRequest {
  branch_id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  parent_guardian_name?: string | null;
  parent_guardian_contact?: string | null;
  parent_guardian_email?: string | null;
  status: string;
}

export interface UpdateStudentRequest extends CreateStudentRequest {
  id: number;
}

export interface BranchResponse {
  id: number;
  name: string;
}

export interface GetStaffResponse {
  id: number;
  branch_id: number;
  branch_name?: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  qualification: string | null;
  experience: string | null;
  specialization: string | null;
  salary: string | null;
  start_date?: string | null;
  end_date?: string | null;
  user_id?: number | null;
  staff_status:
    | "Active"
    | "Inactive"
    | "On_Leave"
    | "Suspended"
    | "Terminated"
    | "Archived"
    | "Quit"
    | null;
  staff_title?: "Mr" | "Mrs" | "Ms" | "Miss" | "Dr" | "Prof" | null;
  created_at: string;
  modified_at?: string | null;
  temporary_password: string;
}

export interface CreateStaffRequest {
  branch_id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  qualification?: string | null;
  experience?: string | null;
  specialization?: string | null;
  salary?: string | number | null;
  start_date?: string | null;
  end_date?: string | null;
  staff_status?:
    | "Active"
    | "Inactive"
    | "On_Leave"
    | "Suspended"
    | "Terminated"
    | "Archived"
    | "Quit"
    | null;
  staff_title?: "Mr" | "Mrs" | "Ms" | "Miss" | "Dr" | "Prof" | null;
}

export interface UpdateStaffRequest extends CreateStaffRequest {
  id: number;
}
