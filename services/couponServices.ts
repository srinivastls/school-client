import dayjs from "dayjs";
import { Coupon, CreateCouponRequest, GetAllCouponsResponse } from "../types";
import { api } from "./client";

const endpoints = {
  getAll: "/coupon/getAll",
  create: "/coupon/create",
};

const getAllCoupons = async () => {
  const { data } = await api.get<GetAllCouponsResponse>(endpoints.getAll);
  return data;
};

const createCoupon = async (payload: CreateCouponRequest) => {
  const coupon: Omit<Coupon, "status"> = {
    ...payload,
    createdAt: dayjs().format("DD-MM-YYYY"),
  };
  return api.post(endpoints.create, coupon);
};

export const couponServices = { getAllCoupons, createCoupon };
