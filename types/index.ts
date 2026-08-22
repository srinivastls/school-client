export * from "./screenTypes";
export * from "./entityTypes";
export * from "./authApiTypes";
export * from "./commonApiTypes";
export * from "./classApiTypes";
export * from "./couponApiTypes";
export * from "./studentApiTypes";
export * from "./txnApiTypes";
export * from "./reportApiTypes";

export type ArrayElement<T> = T extends (infer E)[] ? E : unknown;
