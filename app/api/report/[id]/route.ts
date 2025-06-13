import mongoose, { ObjectId } from "mongoose";
import Report from "../../../../models/Report"; 
import { connectToDatabase } from "@/lib/db";
import { validatePatchFields } from "@/middlewares/validatePatchFields";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import User from "@/models/User";
import { Types } from "mongoose";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});


// currently i can either delete similar report id or i can add/update data in report  because i am returing after deleteing similar report id 
export async function PATCH(req: NextRequest) {
  const validation = await validatePatchFields(req);
  if ("error" in validation) return validation.error;

  const { body } = validation;
  const id = req.nextUrl.pathname.split("/").pop()!;
  console.log("🚀 ~ PATCH report ~ id:", id,body,validation)

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return NextResponse.json({ message: "Invalid report ID" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const { similarReportIdsForDelete } = body; 

    if (similarReportIdsForDelete && Array.isArray(similarReportIdsForDelete)) {
      const invalidIds = similarReportIdsForDelete.filter(
        (id: string) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { message: "Invalid similar report IDs" },
          { status: 400 }
        );
      }

      const updatedReport = await Report.findByIdAndUpdate(
        id,
        { $pullAll: { similarTo: similarReportIdsForDelete.map((reportId: string) => new Types.ObjectId(reportId)) } },
        { new: true }
      ) .populate("uploadedBy", "email role domain") // Optional: populate uploader
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

      if (!updatedReport) {
        return NextResponse.json({ error: "Failed to delete similar report" }, { status: 500 });
      }

      return NextResponse.json(updatedReport, { status: 200 });
    }

    const updated = await Report.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update report", err },
      { status: 500 }
    );
  }
}


type Params = {
  params: {
    id: string;
  };
};
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop()!;
  
  const currentUser = await getCurrentUser();

  const userId = currentUser.id;  
  const userRole = currentUser.role;  

  try {
    const report = await Report.findById(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const uploader = await User.findById(report.uploadedBy);

    if (!uploader) {
      return NextResponse.json({ error: 'Uploader of file not found' }, { status: 404 });
    }

    // If the user is not the uploader, deny access
    if (report.uploadedBy.toString() !== userId && userRole !== uploader.role && report.status !== "pending") {
      return NextResponse.json(
        { error: 'You are not authorized to delete this report' },
        { status: 403 }
      );
    }

     // If the report has an ImageKit file ID, delete it from ImageKit
     if (report.imageKitFileId) {
      const deleteResponse = await imagekit.deleteFile(report.imageKitFileId);
      console.log("🚀 ~ DELETE ~ reportdeleteResponse:", deleteResponse)
      if (deleteResponse) {
        console.log(`File ${report.imageKitFileId} deleted from ImageKit`);
      } else {
        return NextResponse.json(
          { error: 'Failed to delete file from ImageKit' },
          { status: 500 }
        );
      }
    }

    // Delete associated test results from ImageKit if any
    if (report.testResults && report.testResults.length > 0) {
      for (const testResult of report.testResults) {
        if (testResult.imageKitFileId) {
          const deleteResponse = await imagekit.deleteFile(testResult.imageKitFileId);
          if (deleteResponse) {
            console.log(`File ${testResult.imageKitFileId} deleted from ImageKit`);
          }
        }
      }
    }


    await Report.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Report deleted successfully' });

  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}


export async function GET(
  req: NextRequest 
) {
   try {
    await connectToDatabase();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

  const url = new URL(req.url);
  const pathnameParts = url.pathname.split('/');
  const id = pathnameParts[pathnameParts.length - 1];

    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing reportId" }, { status: 400 });
    }

    const report = await Report.findById(id)
      .populate("uploadedBy", "email role domain")  
      .populate("sharedWith", "email role")        
      .populate("testResults.uploadedBy", "email role") 
      .populate({
        path: "similarTo",
        select: "_id title description tags status fileUrl fileType fileSize createdAt uploadedBy",
        populate: {
          path: "uploadedBy",
          select: "email role",
        },
      })
      .lean();  

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("Error fetching report by id:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to fetch report by id" }, { status: 500 });
  }
}