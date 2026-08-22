import { Coupon } from "./entityTypes";

export type GetAllCouponsResponse = { coupons: Coupon[] };

export type CreateCouponRequest = Omit<Coupon, "createdAt" | "status">;
