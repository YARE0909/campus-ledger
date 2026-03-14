import SuperAdminDashboard from "@/app/super-admin/page";
import {
  BranchResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  CreateInstitutionRequest,
  CreateInstitutionResponse,
  CreateStaffRequest,
  CreateStudentRequest,
  CreateSubscriptionTierRequest,
  CreateSubscriptionTierResponse,
  DeleteBranchRequest,
  Endpoint,
  GetBranchByTenantRequest,
  GetBranchByTenantResponse,
  GetStaffResponse,
  GetStudentsResponse,
  GetSubscriptionTiersAnalyticsResponse,
  GetUserInfoRequest,
  GetUserInfoResponse,
  InstitutionAnalyticsResponse,
  LoginRequest,
  LoginResponse,
  SubscriptionTierResponse,
  SuperAdminDashboardResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  UpdateInstitutionRequest,
  UpdateInstitutionResponse,
  UpdateStaffRequest,
  UpdateStudentRequest,
} from "./types";
import { create } from "domain";
import path from "path";

export const endpoints = {
  loginUser: {
    method: "POST",
    path: () => "/api/auth/login",
    type: "OPEN",
  } as Endpoint<LoginRequest, LoginResponse>,

  getUserInfo: {
    method: "GET",
    path: ({ userId }) => `/api/common/getUserInfo/${userId}`,
    type: "CLOSE",
  } as Endpoint<GetUserInfoRequest, GetUserInfoResponse>,

  getSuperAdminDashboardData: {
    method: "GET",
    path: () => "/api/super-admin/dashboard",
    type: "CLOSE",
  } as Endpoint<null, SuperAdminDashboardResponse>,

  getSubscriptionTiers: {
    method: "GET",
    path: () => "/api/super-admin/subscription-tiers",
    type: "CLOSE",
  } as Endpoint<null, SubscriptionTierResponse[]>,

  getInstitutionsAnalytics: {
    method: "GET",
    path: () => "/api/super-admin/institutionsAnalytics",
    type: "CLOSE",
  } as Endpoint<null, InstitutionAnalyticsResponse>,

  createInstitution: {
    method: "POST",
    path: () => "/api/super-admin/institutions",
    type: "CLOSE",
  } as Endpoint<CreateInstitutionRequest, CreateInstitutionResponse>,

  updateInstitution: {
    method: "PUT",
    path: () => "/api/super-admin/institutions",
    type: "CLOSE",
  } as Endpoint<
    UpdateInstitutionRequest,
    UpdateInstitutionResponse
  >,

  deleteInstitution: {
    method: "DELETE",
    path: ({ id }) => `/api/super-admin/institutions?id=${id}`,
    type: "CLOSE",
  } as Endpoint<{ id: string }, null>,

  getSubscriptionTiersAnalytics: {
    method: "GET",
    path: () => "/api/super-admin/subscriptionsAnalytics",
    type: "CLOSE",
  } as Endpoint<null, GetSubscriptionTiersAnalyticsResponse>,

  createSubscriptionTier: {
    method: "POST",
    path: () => "/api/super-admin/subscription-tiers",
    type: "CLOSE",
  } as Endpoint<CreateSubscriptionTierRequest, CreateSubscriptionTierResponse>,

  getBranchByTenant: {
    method: "GET",
    path: ({ tenant_id }) => `/api/common/branches?tenant_id=${tenant_id}`,
    type: "CLOSE",
  } as Endpoint<GetBranchByTenantRequest, GetBranchByTenantResponse[]>,

  createBranch: {
    method: "POST",
    path: () => "/api/common/branches",
    type: "CLOSE",
  } as Endpoint<CreateBranchRequest, CreateBranchResponse>,

  updateBranch: {
    method: "PUT",
    path: () => "/api/common/branches",
    type: "CLOSE",
  } as Endpoint<UpdateBranchRequest, UpdateBranchResponse>,

  deleteBranch: {
    method: "DELETE",
    path: () => "/api/common/branches",
    type: "CLOSE",
  } as Endpoint<DeleteBranchRequest, null>,

    getStudents: {
    method: "GET",
    path: () => "/api/common/students",
    type: "CLOSE",
  } as Endpoint<null, GetStudentsResponse[]>,

  createStudent: {
    method: "POST",
    path: () => "/api/common/students",
    type: "CLOSE",
  } as Endpoint<CreateStudentRequest, GetStudentsResponse>,

  updateStudent: {
    method: "PUT",
    path: ({ id }) => `/api/common/students/${id}`,
    type: "CLOSE",
  } as Endpoint<UpdateStudentRequest, GetStudentsResponse>,

  deleteStudent: {
    method: "DELETE",
    path: ({ id }) => `/api/common/students/${id}`,
    type: "CLOSE",
  } as Endpoint<{ id: number }, null>,
    getBranches: {
    method: "GET",
    path: () => "/api/common/branches",
    type: "CLOSE",
  } as Endpoint<null, BranchResponse[]>,

  getStaffs: {
    method: "GET",
    path: () => "/api/common/staff",
    type: "CLOSE",
  } as Endpoint<null, GetStaffResponse[]>,

  createStaff: {
    method: "POST",
    path: () => "/api/common/staff",
    type: "CLOSE",
  } as Endpoint<CreateStaffRequest, GetStaffResponse>,

  updateStaff: {
    method: "PUT",
    path: ({ id }) => `/api/common/staff/${id}`,
    type: "CLOSE",
  } as Endpoint<UpdateStaffRequest, GetStaffResponse>,

  deleteStaff: {
    method: "DELETE",
    path: ({ id }) => `/api/common/staff/${id}`,
    type: "CLOSE",
  } as Endpoint<{ id: number }, null>,
};
