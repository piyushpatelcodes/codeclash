import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import AuthorizedDomain from "@/models/AuthorizedDomain";
import generateTempId from "@/lib/generateTempId";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, Password and Role are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const emailDomain = email.split('@')[1];
    // Check if domain exists in AuthorizedDomains collection
    const existingDomain = await AuthorizedDomain.findOne({ domain: emailDomain });



    let accountStatus = 'pending';

    if (role === 'superadmin') {
      const existingSuperAdmins = await User.countDocuments({ role: 'superadmin' });
      // If no superadmins, this user can become superadmin
      if (existingSuperAdmins === 0) {
        accountStatus = 'active'; 
      }
    } else if (role === 'admin' || role === "finance") {
      // Admin account needs approval from existing superadmin or admin in the domain
      accountStatus = 'pending';
    } else if (role === 'sales' || role === 'labtester') {
      // No approval needed for sales and labtester
      accountStatus = 'active';
    }

    let authorityId = generateTempId();
    let domainOwner = false;

    // If domain exists, assign authority to the domain admin
    if (existingDomain) {
      const adminUser = await User.findById(existingDomain.adminId);
      authorityId = adminUser._id;
    } else {
      // If domain does not exist, 
      // mark this user as the domain owner (admin) if he requested for admin role
      // but accountstaus will be pending for superadmin approval
      if (role !== "admin") {
        return NextResponse.json(
          { error: `Your domain has no admin registered. Please contact support or ask an admin to register first with domain @${emailDomain}.` },
          { status: 400 }
        );
      }
      domainOwner = true; 
      accountStatus = "active"; // change it to pending if superadmin wants to charge for the service

      // Create a new entry in AuthorizedDomains collection
      const newDomain = new AuthorizedDomain({
        domain: emailDomain,
        adminId: null, // This will be updated once the user is registered
      });
      await newDomain.save();
    }



    const newUser = new User({
      email,
      password,
      authority: authorityId,
      domainOwner,
      domain: emailDomain,
      accountStatus,
      role,
    });

    const savedUser = await newUser.save();

    if (domainOwner) {
      savedUser.authority = savedUser._id;
      await savedUser.save();
      await AuthorizedDomain.updateOne(
        { domain: emailDomain },
        { adminId: savedUser._id } 
      );
    }

    return NextResponse.json(
      { message: `User registered successfully as ${role.toUpperCase()}. You account status is ${accountStatus.toUpperCase()}` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}

