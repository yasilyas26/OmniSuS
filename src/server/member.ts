export type MemberRole = "OWNER" | "EMPLOYEE";

/** Konteks tenant dari sesi. `businessId` tidak pernah berasal dari input klien. */
export type Member = {
  userId: string;
  businessId: string;
  role: MemberRole;
};
