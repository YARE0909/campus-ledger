import SuperAdminDashboard from "@/app/super-admin/page";
import {
  CreateInstitutionRequest,
  CreateInstitutionResponse,
  CreateSubscriptionTierRequest,
  CreateSubscriptionTierResponse,
  Endpoint,
  GetSubscriptionTiersAnalyticsResponse,
  InstitutionAnalyticsResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  SubscriptionTierResponse,
  SuperAdminDashboardResponse,
} from "./types";
import path from "path";

export const endpoints = {
  loginUser: {
    method: "POST",
    path: () => "/api/auth/login",
    type: "OPEN",
  } as Endpoint<LoginRequest, LoginResponse>,

  logoutUser: {
    method: "POST",
    path: () => "/api/auth/logout",
    type: "CLOSE",
  } as Endpoint<LogoutRequest, null>,

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
};
