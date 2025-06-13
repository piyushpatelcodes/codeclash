"use client"
import Sidebar from '@/app/components/perplexityui/PerpSideBar';
import Timer from '@/app/components/perplexityui/Timer';
import TasksList from '@/app/components/perplexityui/TaskList';
import MeetingsList from '@/app/components/perplexityui/MeetingList';
import CalendarTimeline from '@/app/components/perplexityui/CalenderTimeline';
import ActivityChart from '@/app/components/perplexityui/ActivityChart';
import ProjectsChart from '@/app/components/perplexityui/ProjectChart';
import Reminders from '@/app/components/perplexityui/Reminder';
import avatar from "../../../../../public/avatar.jpeg"

export default function Dashboard() {
  return (

       
        
        <main className=" grid grid-cols-12 gap-6">
          {/* Timer and Current Task */}
          <div className="col-span-3">
            <Timer project="Color Palette Selection" app="OverK: Gamers App" />
          </div>
          
          {/* Today's Tasks */}
          <div className="col-span-4">
            <TasksList />
          </div>
          
          {/* Today's Meetings */}
          <div className="col-span-5">
            <MeetingsList />
          </div>
          
          {/* Calendar Timeline */}
          <div className="col-span-8">
            <CalendarTimeline />
          </div>
          
          {/* Right Column - Charts and Reminders */}
          <div className="col-span-4 space-y-6">
            <ActivityChart />
            <ProjectsChart />
            <Reminders />
          </div>
        </main>
  );
}
