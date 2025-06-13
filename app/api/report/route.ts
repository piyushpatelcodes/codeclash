import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Report, { IReport } from "@/models/Report";
import { getCurrentUser } from "@/lib/getCurrentUser";
import User from "@/models/User";

export async function GET() {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await connectToDatabase();

    // const userId = session.user.id;
    // const currentUser = await User.findById(userId).lean() as IUser | null;
    const currentUser = await getCurrentUser();

    console.log("currentUser: ", currentUser);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let filter = {};

    switch (currentUser.role) {
      case "superadmin":
        // Superadmin sees all reports
        filter = {};
        break;

      case "admin":
      case "finance":
        // Admin sees reports uploaded by users under their authority (same domain + authority = their ID)
        const subUsers = await User.find({
          authority: currentUser.authority,
          domain: currentUser.domain,
        })
          .select("_id")
          .lean();

        const subUserIds = subUsers.map((u) => u._id);
        filter = { uploadedBy: { $in: subUserIds } };
        break;

      case "labtester":
        // Labtester sees only reports shared with them
        filter = { sharedWith: currentUser.id };
        break;

      case "sales":
        // Sales sees reports they uploaded or were shared with them
        filter = {
          $or: [{ uploadedBy: currentUser.id }, { sharedWith: currentUser.id }],
        };
        break;

      default:
        return NextResponse.json(
          { error: "Role not recognized" },
          { status: 403 }
        );
    }

    const reports = await Report.find(filter)
      .populate("uploadedBy", "email role domain") // Optional: populate uploader
      .populate("sharedWith", "email role") // Optional: populate shared users
      .populate("testResults.uploadedBy", "email role")
      .populate({
        path: "similarTo",
        select:
          "_id title description tags status fileUrl fileType fileSize createdAt uploadedBy",
        populate: {
          path: "uploadedBy",
          select: "email role",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log("🚀 ~ GET ~ reports:", reports, filter);
    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body: IReport = await request.json();
    console.log("🚀 ~ POST ~ body:", body);

    // Validate required fields
    if (!body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const reportData = {
      ...body,
      uploadedBy: currentUser.id, // Ensure the uploadedBy field is from session or valid
      isPrivate: body.isPrivate ?? false, // Default to public if not specified
    };

    const newReport = await Report.create(reportData);
    console.log("🚀 ~ POST ~ tets reportData:", reportData)

    // Return the created report
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Error creating Doc:", error);
    return NextResponse.json(
      { error: "Failed to create Doc" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("unauth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the videoId from the request body
    const { videoId } = await request.json();

    // Validate the input
    if (!videoId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Delete the video
    await Report.findByIdAndDelete(videoId);
    return NextResponse.json(
      { message: "Report deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
