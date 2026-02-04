export const CouponTypeValues = {
  Percentage: 1,
  FlatAmount: 2,
} as const;

export type CouponType = (typeof CouponTypeValues)[keyof typeof CouponTypeValues];

export interface Coupon {
  id: number;
  code: string;
  description: string;
  type: CouponType;
  typeName: string;
  value: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  isActive: boolean;
}

export interface UpdateCouponRequest extends CreateCouponRequest {}
