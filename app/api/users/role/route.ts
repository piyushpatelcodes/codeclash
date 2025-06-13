import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
import { getCurrentUser } from "@/lib/getCurrentUser";

export  async function GET() {
  const currentUser = await getCurrentUser();

  console.log("currentUser: ", currentUser);
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if the role is valid
  const role = currentUser.role;
  if (
    !role ||
    !["superadmin", "admin", "labtester", "sales", "finance"].includes(
      role as string
    )
  ) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  let allowedRoles = [];  

  if (role === 'sales') {
    allowedRoles = ['labtester',"sales"];  // Sales can only view lab users
  } else if (role === 'labtester') {
    allowedRoles = ["sales","labtester","admin","finance"];  // Lab can only view admin users
  } else if (role === 'admin') {
    allowedRoles = ['labtester',"sales","admin","finance"];  // Admin can view LLL users (or any other role as needed)
  } else if (role === 'finance') {
    allowedRoles = ['labtester',"sales","admin"];  // Admin can view LLL users (or any other role as needed)
  } else {
    return NextResponse.json({ message: 'Access denied: Unknown role' },{status:403});
  }

  // Check if the requested role is within the allowed roles
  // if (!allowedRoles.includes(role)) {
  //   return NextResponse.json({ message: 'Access denied: You cannot view this role' },{status:403});
  // }
  

  try {
    await connectToDatabase();

    // Fetch users based on role
    const users = await UserModel.find({
      role: { $in: allowedRoles },
      _id: { $ne: currentUser.id }, // optional: exclude self
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return NextResponse.json({ message: "Internal Server Error" }, {status:500});
  }
}
