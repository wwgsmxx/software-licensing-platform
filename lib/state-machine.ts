export const APPLICATION_STATUSES = {
  DRAFT: "DRAFT",
  DOCUMENTS_REQUIRED: "DOCUMENTS_REQUIRED",
  SIGNED: "SIGNED",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  ADDITIONAL_INFO_REQUIRED: "ADDITIONAL_INFO_REQUIRED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  LICENSE_ISSUED: "LICENSE_ISSUED",
  CANCELLED: "CANCELLED",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUSES)[keyof typeof APPLICATION_STATUSES];

export interface StatusTransitionRule {
  from: ApplicationStatus;
  to: ApplicationStatus;
  allowedRoles: string[];
  requiresReason?: boolean;
}

export const TRANSITION_RULES: StatusTransitionRule[] = [
  {
    from: "DRAFT",
    to: "DOCUMENTS_REQUIRED",
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    from: "DRAFT",
    to: "SIGNED",
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    from: "DOCUMENTS_REQUIRED",
    to: "SIGNED",
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    from: "SIGNED",
    to: "SUBMITTED",
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    from: "SUBMITTED",
    to: "UNDER_REVIEW",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
  },
  {
    from: "SUBMITTED",
    to: "APPROVED",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
  },
  {
    from: "SUBMITTED",
    to: "REJECTED",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
    requiresReason: true,
  },
  {
    from: "SUBMITTED",
    to: "ADDITIONAL_INFO_REQUIRED",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
    requiresReason: true,
  },
  {
    from: "SUBMITTED",
    to: "LICENSE_ISSUED",
    allowedRoles: ["ADMIN", "LICENSE_MANAGER", "REVIEWER"],
  },
  {
    from: "UNDER_REVIEW",
    to: "ADDITIONAL_INFO_REQUIRED",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
    requiresReason: true,
  },
  {
    from: "ADDITIONAL_INFO_REQUIRED",
    to: "SIGNED",
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    from: "ADDITIONAL_INFO_REQUIRED",
    to: "SUBMITTED",
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    from: "ADDITIONAL_INFO_REQUIRED",
    to: "APPROVED",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
  },
  {
    from: "ADDITIONAL_INFO_REQUIRED",
    to: "REJECTED",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
    requiresReason: true,
  },
  {
    from: "UNDER_REVIEW",
    to: "APPROVED",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
  },
  {
    from: "UNDER_REVIEW",
    to: "REJECTED",
    allowedRoles: ["ADMIN", "REVIEWER", "LICENSE_MANAGER"],
    requiresReason: true,
  },
  {
    from: "UNDER_REVIEW",
    to: "LICENSE_ISSUED",
    allowedRoles: ["ADMIN", "LICENSE_MANAGER", "REVIEWER"],
  },
  {
    from: "APPROVED",
    to: "LICENSE_ISSUED",
    allowedRoles: ["ADMIN", "LICENSE_MANAGER", "REVIEWER"],
  },
  // Allow cancellation from early draft / submitted stages
  { from: "DRAFT", to: "CANCELLED", allowedRoles: ["USER", "ADMIN"] },
  { from: "DOCUMENTS_REQUIRED", to: "CANCELLED", allowedRoles: ["USER", "ADMIN"] },
  { from: "SIGNED", to: "CANCELLED", allowedRoles: ["USER", "ADMIN"] },
  { from: "SUBMITTED", to: "CANCELLED", allowedRoles: ["USER", "ADMIN"] },
  { from: "UNDER_REVIEW", to: "CANCELLED", allowedRoles: ["USER", "ADMIN"] },
];

export function canTransition(
  currentStatus: ApplicationStatus,
  targetStatus: ApplicationStatus,
  userRole: string
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  const rule = TRANSITION_RULES.find(
    (r) => r.from === currentStatus && r.to === targetStatus
  );

  if (!rule) {
    // If user is ADMIN, allow approving or rejecting from reviewable stages
    if (userRole === "ADMIN") {
      const allowedAdminSources = ["SUBMITTED", "UNDER_REVIEW", "ADDITIONAL_INFO_REQUIRED"];
      const allowedAdminTargets = ["APPROVED", "REJECTED", "ADDITIONAL_INFO_REQUIRED", "LICENSE_ISSUED"];
      if (allowedAdminSources.includes(currentStatus) && allowedAdminTargets.includes(targetStatus)) {
        return { allowed: true };
      }
    }
    return {
      allowed: false,
      reason: `Illegal state transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  if (!rule.allowedRoles.includes(userRole) && userRole !== "ADMIN") {
    return {
      allowed: false,
      reason: `Role '${userRole}' is not authorized to transition state to ${targetStatus}.`,
    };
  }

  return { allowed: true };
}

export function getStatusStepNumber(status: ApplicationStatus): number {
  switch (status) {
    case "DRAFT":
      return 1;
    case "DOCUMENTS_REQUIRED":
      return 2;
    case "SIGNED":
      return 3;
    case "SUBMITTED":
      return 4;
    case "UNDER_REVIEW":
    case "ADDITIONAL_INFO_REQUIRED":
      return 5;
    case "APPROVED":
      return 6;
    case "LICENSE_ISSUED":
      return 7;
    case "REJECTED":
    case "CANCELLED":
      return 0;
    default:
      return 1;
  }
}
