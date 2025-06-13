import { connectToDatabase } from "@/lib/db";
import Report from "@/models/Report"; 
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

type TestResultInput = {
  uploadedBy: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  imageKitFileId?: string;
  score?: Array<{
    name: string;
    relatedTo: string;
    value?: number | string;
    unit?: string;
    range?: [number, number];
    expectedRange?: [number, number];
    remarks?: string;
    verdict: boolean;
  }>;
};



export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🚀 ~ PATCH ~ body:", body)
    const { id, fileUrl, fileType, fileSize, imageKitFileId, score } = body;

    const hasFileInfo = fileUrl || fileType || fileSize || imageKitFileId;
    const hasScore = Array.isArray(score) && score.length > 0;

    const session = await getCurrentUser();

    // Only labtester ,"finance" and admin can upload test results
    if (!session || !["labtester", "admin","finance"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const report = await Report.findById(id);
    console.log("🚀 ~ PATCH ~ id on find:", id)
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const testResult:TestResultInput = {
      // fileUrl,
      // fileType,
      // fileSize,
      // imageKitFileId,
      uploadedBy: session.id,
    };

    if (fileUrl) testResult.fileUrl = fileUrl;
    if (fileType) testResult.fileType = fileType;
    if (fileSize) testResult.fileSize = fileSize;
    if (imageKitFileId) testResult.imageKitFileId = imageKitFileId;
    if (hasScore) testResult.score = score;
    
    report.testResults.push(testResult);
        console.log("🚀 ~ PATCH ~ testResult:", testResult)

    await report.save();

    return NextResponse.json({
      message: "Test result uploaded successfully",
      testResult,
    });
  } catch (error) {
    console.error("Error in upload-verdict:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}