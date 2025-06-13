import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Report from "../models/Report";

const rolePermissions: Record<string, string[]> = {
  sales: ["fileUrl", "fileSize", "fileType", "imageKitFileId", "sharedWith", "title", "description", "isPrivate", "tags", "similarTo", "similarReportIdsForDelete"],
  finance: ["fileUrl", "fileSize", "fileType", "imageKitFileId", "sharedWith", "title", "description", "isPrivate", "tags", "status",  "testResults", "tags", "similarTo", "similarReportIdsForDelete"],
  labtester: ["status", "sharedWith", "testResults", "tags", "similarTo", "similarReportIdsForDelete"],
  admin: ["status", "sharedWith", "testResults", "tags", "similarTo", "similarReportIdsForDelete"],
  superadmin: ["status", "tags", "similarTo", "similarReportIdsForDelete"],
};

function getAllowedFieldsForRole(role: string): string[] {
  return rolePermissions[role] || [];
}

export async function validatePatchFields(req: NextRequest): Promise<
{ error: NextResponse } | { body: Record<string, unknown> } // Pass this back to your route
> {
  const currentUser = await getCurrentUser();

  const userRole = currentUser.role;

  if (!userRole) {
    return {
      error: NextResponse.json({ error: "Missing user role" }, { status: 401 }),
    };
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const allowedFields = getAllowedFieldsForRole(userRole);
  const invalidFields = Object.keys(body).filter((key) => !allowedFields.includes(key));

  if (invalidFields.length > 0) {
    return {
      error: NextResponse.json(
        { error: `Unauthorized fields: ${invalidFields.join(", ")}` },
        { status: 403 }
      ),
    };
  }

  // 🔐 Extra check for sales users
  if (userRole === "sales") {
    const id = req.nextUrl.pathname.split("/").pop()!;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        error: NextResponse.json({ error: "Invalid report ID" }, { status: 400 }),
      };
    }

    await connectToDatabase();
    const report = await Report.findById(id);
    if (!report) {
      return {
        error: NextResponse.json({ error: "Report not found" }, { status: 404 }),
      };
    }

    if (report.status !== "pending") {
      return {
        error: NextResponse.json(
          { error: "Sales cannot update report after status is no longer pending" },
          { status: 403 }
        ),
      };
    }
  }

  return { body };
}
