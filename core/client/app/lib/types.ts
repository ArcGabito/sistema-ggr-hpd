import type { FacadeVariant } from "./site-data";

export type GuideStatus = "Draft" | "Issued" | "InTransit" | "Delivered" | "Cancelled";
export type DispatchStatus = "Scheduled" | "Loading" | "InTransit" | "Completed" | "Cancelled";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "Admin" | "Supervisor" | "Operator";
  siteName: string | null;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface Client {
  id: number;
  displayName: string;
  legalName: string | null;
  taxId: string | null;
  contactName: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  district: string | null;
  province: string | null;
}

export interface Site {
  id: number;
  code: string;
  name: string;
  type: string;
  address: string;
  district: string;
  province: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: "Glass" | "Aluminum" | "Decorative";
  unitOfMeasure: string;
}

export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  capacityKg: number;
  isActive: boolean;
}

export interface Driver {
  id: number;
  fullName: string;
  documentNumber: string;
  licenseNumber: string;
  phoneNumber: string | null;
  isActive: boolean;
}

export interface GuideSummary {
  id: number;
  number: string;
  issueDate: string;
  transferDate: string;
  status: GuideStatus;
  transferReason: string;
  clientName: string;
  clientTaxId: string | null;
  originSite: string;
  deliveryAddress: string;
  totalWeightKg: number;
  dispatchCode: string | null;
}

export interface GuideDetail {
  id: number;
  number: string;
  issueDate: string;
  transferDate: string;
  status: GuideStatus;
  transferReason: string;
  client: Client;
  originSite: Site;
  deliveryAddress: string;
  totalWeightKg: number;
  notes: string | null;
  dispatchCode: string | null;
  vehiclePlate: string | null;
  driverName: string | null;
  createdBy: string;
  items: {
    id: number;
    productId: number;
    productCode: string;
    description: string;
    quantity: number;
    unitOfMeasure: string;
    weightKg: number;
  }[];
}

export interface Dispatch {
  id: number;
  code: string;
  status: DispatchStatus;
  site: string;
  vehiclePlate: string;
  driverName: string;
  scheduledAt: string;
  departedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  totalWeightKg: number;
  vehicleCapacityKg: number;
  guides: GuideSummary[];
}

export interface DashboardSummary {
  guidesToday: number;
  guidesDraft: number;
  guidesIssuedPending: number;
  guidesInTransit: number;
  guidesDeliveredMonth: number;
  dispatchesScheduled: number;
  dispatchesInProgress: number;
  clientsCount: number;
  recentGuides: GuideSummary[];
  upcomingDispatches: Dispatch[];
}

export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: string;
  coverArt: FacadeVariant;
  externalUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string | null;
  authorName: string | null;
}

export interface ContactRequest {
  id: number;
  fullName: string;
  company: string | null;
  email: string;
  phoneNumber: string;
  message: string;
  createdAt: string;
  isAttended: boolean;
}

export interface GuideEmail {
  id: number;
  to: string;
  cc: string | null;
  subject: string;
  invoiceFileName: string | null;
  succeeded: boolean;
  error: string | null;
  sentBy: string;
  sentAt: string;
}
