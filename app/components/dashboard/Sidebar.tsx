import { getCurrentUser } from "@/lib/getCurrentUser";
import React from "react";
import ClientSessionSetter from "../ClientSetter";


export default async function Sidebar() {
  const currentUser = await getCurrentUser();
  // const menuItems = [
  //   { name: "All Projects", active: true, badge: 1 },
  //   { name: "Pending Tasks", badge: 15 },
  //   { name: `${currentUser.role} Approved Project`, badge: 1 },
  //   { name: `${currentUser.role} Rejected Project` , badge: 10},
    
  // ];
  const menuItems = [
    { name: "All Projects Lists", active: true, url:`/${currentUser.role}/dashboard` },
    { name: "Kanban Board",url:`/${currentUser.role}/dashboard/kanban` },
    { name: "Timeline", url:`/${currentUser.role}/dashboard/timeline`},
    { name: "Case Study", url:`/${currentUser.role}/dashboard/case-study`},
    
  ];
  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-[#18181b] border-r border-gray-200 dark:border-gray-800 flex flex-col p-4">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">
          {currentUser.email.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <div className="font-semibold text-gray-900 dark:text-gray-100">ManageCo.</div>
          <div className="text-xs text-gray-400">{currentUser.email}</div>
        </div>
      </div>
      <nav className="flex-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <a
                href={item.url}
                className={`flex items-center p-2 rounded-lg ${item.active ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
              >
                {item.name}
                {/* {item.badge !== 0 && (
                  <span className="ml-2 bg-indigo-200 dark:bg-indigo-800 text-xs px-2 rounded-full text-indigo-700 dark:text-indigo-200">{item.badge}</span>
                )} */}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          Add an extra security to your account.
        </div>
        <button className="w-full bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700">Enable 2-step verification</button>
      </div>
      {/* <ClientSessionSetter currentUser={currentUser} /> */}
    </aside>
  );
}
