import { describe, it, expect } from "vitest";
import { canTransition, getStatusStepNumber } from "../lib/state-machine";

describe("State Machine & Transitions (lib/state-machine.ts)", () => {
  it("should allow valid user transition from DRAFT to SIGNED", () => {
    const res = canTransition("DRAFT", "SIGNED", "USER");
    expect(res.allowed).toBe(true);
  });

  it("should prevent regular USER from approving an application", () => {
    const res = canTransition("UNDER_REVIEW", "APPROVED", "USER");
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("not authorized");
  });

  it("should allow REVIEWER or ADMIN to approve an application under review", () => {
    const reviewerRes = canTransition("UNDER_REVIEW", "APPROVED", "REVIEWER");
    expect(reviewerRes.allowed).toBe(true);

    const adminRes = canTransition("UNDER_REVIEW", "APPROVED", "ADMIN");
    expect(adminRes.allowed).toBe(true);
  });

  it("should allow REVIEWER or ADMIN to approve an application directly from SUBMITTED", () => {
    const reviewerRes = canTransition("SUBMITTED", "APPROVED", "REVIEWER");
    expect(reviewerRes.allowed).toBe(true);

    const adminRes = canTransition("SUBMITTED", "APPROVED", "ADMIN");
    expect(adminRes.allowed).toBe(true);
  });

  it("should allow REVIEWER or ADMIN to reject or request info from SUBMITTED", () => {
    expect(canTransition("SUBMITTED", "REJECTED", "REVIEWER").allowed).toBe(true);
    expect(canTransition("SUBMITTED", "ADDITIONAL_INFO_REQUIRED", "REVIEWER").allowed).toBe(true);
  });

  it("should reject illegal state leaps (e.g. DRAFT straight to LICENSE_ISSUED)", () => {
    const res = canTransition("DRAFT", "LICENSE_ISSUED", "ADMIN");
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("Illegal state transition");
  });

  it("should return correct progression step numbers", () => {
    expect(getStatusStepNumber("DRAFT")).toBe(1);
    expect(getStatusStepNumber("SIGNED")).toBe(3);
    expect(getStatusStepNumber("SUBMITTED")).toBe(4);
    expect(getStatusStepNumber("APPROVED")).toBe(6);
    expect(getStatusStepNumber("LICENSE_ISSUED")).toBe(7);
    expect(getStatusStepNumber("REJECTED")).toBe(0);
  });
});
