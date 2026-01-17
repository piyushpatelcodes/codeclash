"use client";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Home, User } from "lucide-react";
import { useNotification } from "./Notification";
import tick from "../../public/tick.png"

export default function Header() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  console.log("role: ", session);

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Signed out successfully", "success");
    } catch {
      showNotification("Failed to sign out", "error");
    }
  };

  return (
    < >
      <div className=" w-28 h-5 bg-indigo-500 fixed  z-0"></div>
    <div className=" navbar backdrop-blur-xl bg-white/10 text-black dark:text-white  dark:bg-base-300/10 sticky top-0 z-40 ">
      <div className="container mx-auto">
        <div className="flex flex-row  px-2 ">
          <Link
            href="/"
            className="btn btn-ghost text-xl gap-2 normal-case font-bold"
            prefetch={true}
            onClick={() =>
              showNotification(`${session?.user.name}!! Welcome to ${session?.user.role} Dashboard`, "info")
            }
          >
            <Home className="w-5 h-5" />
            CodeClash
          </Link>
        </div>
        <div className="flex flex-1 justify-end px-2">
          <div className="flex items-stretch gap-2">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
              >
                <User className="w-5 h-5" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] shadow-lg bg-base-100 rounded-box w-64 mt-4 py-2"
              >
                {session ? (
                  <>
                    <li className="px-4 py-1 flex">
                      <span className="text-sm opacity-70">
                        {session.user?.email?.split("@")[0]}
                      </span>
                      {
                        session.user.role === "superadmin" && (
                          <div className="badge badge-soft badge-info text-white ml-2 flex">
                            Super Admin<Image src={tick} height={25} width={25} alt="tick" />
                          </div>
                        )


                      }
                      {
                        session.user.role === "admin" && (
                          <div className="badge badge-soft badge-success text-white ml-2 flex">
                             Admin<Image src={tick} height={25} width={25} alt="tick" />
                          </div>
                        )
                      }
                      {
                        session.user.role === "sales" && (
                          <div className="badge badge-soft badge-primary text-white ml-2 flex">
                             Sales Person<Image src={tick} height={25} width={25} alt="tick" />
                          </div>
                        )
                      }
                      {
                        session.user.role === "labtester" && (
                          <div className="badge badge-soft badge-primary text-white ml-2 flex">
                             Lab Person<Image src={tick} height={25} width={25} alt="tick" />
                          </div>
                        )
                      }
                      {
                        session.user.role === "finance" && (
                          <div className="badge badge-soft badge-primary text-white ml-2 flex">
                             Finance Dept.<Image src={tick} height={25} width={25} alt="tick" />
                          </div>
                        )
                      }

                      
                    </li>
                    <div className="divider my-1"></div>

                    {session.user.role === "sales" &&  <li>
                      <Link
                        href="/upload"
                        className="px-4 py-2 hover:bg-gray-700 transition-all duration-200 block w-full"
                        onClick={() =>
                          showNotification("Welcome to Upload", "info")
                        }
                      >
                        Report Upload
                      </Link>
                    </li>}

                    <li>
                      <Link
                        href={`/${session?.user.role}/dashboard`}
                        className="px-4 py-2 hover:bg-gray-700 block transition-all duration-200 w-full "
                        onClick={() =>
                          showNotification(`Welcome to ${session?.user.role} Dashboard`, "info")
                        }
                      >
                        {session?.user.role.toUpperCase()} Dashboard
                      </Link>
                    </li>

                   

                    {session.user.role === "superadmin" && (
                       <li>
                       <Link
                         href="/superadmindashboard"
                         className="px-4 py-2 hover:bg-base-200 block transition-all duration-200 w-full"
                         onClick={() =>
                           showNotification("Welcome to  Dashboard", "info")
                         }
                       >
                         Super Admin Dashboard
                       </Link>
                     </li>
                    )}

                    <li>
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-error hover:bg-red-500/40 transition-all duration-200 w-full text-left"
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="overflow-hidden">
                    <Link
                      href="/login"
                      className="px-4 py-2 hover:bg-base-200 block transition-all duration-200 rounded-md w-full"
                      onClick={() =>
                        showNotification("Please sign in to continue", "info")
                      }
                    >
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
        </>

  );
}