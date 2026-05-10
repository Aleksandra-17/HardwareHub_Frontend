import { describe, it, expect } from "vitest";
import {
  deviceTypes,
  locations,
  people,
  devices,
  statusLabels,
  categoryLabels,
} from "./mock-data";

describe("mock-data", () => {
  describe("statusLabels", () => {
    it("has labels for all device statuses", () => {
      const statuses = ["in_use", "repair", "scrapped", "archived"];
      statuses.forEach((status) => {
        expect(statusLabels[status]).toBeDefined();
        expect(typeof statusLabels[status]).toBe("string");
      });
    });
  });

  describe("categoryLabels", () => {
    it("has labels for all categories", () => {
      const categories = ["computing", "office", "network", "other"];
      categories.forEach((cat) => {
        expect(categoryLabels[cat]).toBeDefined();
        expect(typeof categoryLabels[cat]).toBe("string");
      });
    });
  });

  describe("deviceTypes", () => {
    it("has required fields", () => {
      deviceTypes.forEach((dt) => {
        expect(dt.id).toBeDefined();
        expect(dt.name).toBeDefined();
        expect(dt.code).toBeDefined();
        expect(dt.category).toBeDefined();
        expect(dt.deviceCount).toBeGreaterThanOrEqual(0);
      });
    });

    it("has unique ids", () => {
      const ids = deviceTypes.map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("devices", () => {
    it("has valid status values", () => {
      const validStatuses = ["in_use", "repair", "scrapped", "archived"];
      devices.forEach((d) => {
        expect(validStatuses).toContain(d.status);
      });
    });

    it("has inventory numbers", () => {
      devices.forEach((d) => {
        expect(d.inventoryNumber).toBeDefined();
        expect(d.inventoryNumber.length).toBeGreaterThan(0);
      });
    });
  });

  describe("locations", () => {
    it("has unique ids", () => {
      const ids = locations.map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("people", () => {
    it("has email format", () => {
      people.forEach((p) => {
        expect(p.email).toMatch(/@/);
      });
    });
  });
});
