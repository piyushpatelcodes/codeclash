import Spline from '@splinetool/react-spline';
import TextPressure from '../components/ui/PressureText';
import ShinyText from '../components/ui/ShinyText';

export default function HomePage() {
  return (
    <div className=" bg-gray-100 dark:bg-[#18181b]">
        <div className="w-full h-screen relative">
        <Spline
          scene="https://prod.spline.design/HkYkx3gbNtzTCibt/scene.splinecode"
          className="absolute inset-0"
        />

        <div className="absolute bottom-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg text-lg font-semibold hover:text-green-400 transition-all duration-300">
          MANAGE.Co
        </div>
      </div>
     <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">

          
<div  style={{position: 'relative', height: '400px'}}>
  <TextPressure
    text="Hello!"
    flex={true}
    alpha={false}
    stroke={false}
    width={true}
    weight={true}
    italic={true}
    textColor="#ffffff"
    strokeColor="#ff0000"
    minFontSize={36}
  />
</div>
          <p className="text-lg md:text-xl mb-8">
            Award-winning project management built for modern teams.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/login" className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">
              Get Started
            </a>
            <a href='/sales/dashboard' className="hover:bg-blue-800 border-white/40 border cursor-pointer bg-blue-700 text-white px-6 py-3 rounded-md font-medium">
              
            <ShinyText text="Sales Dashboard" disabled={false} speed={3} />
            </a>

            <a href='/labtester/dashboard' className="border cursor-pointer border-white/40 hover:bg-indigo-700 hover:text-gray-900 px-6 py-3 rounded-md font-medium">
              <ShinyText text="Lab Personell Dashboard" disabled={false} speed={3} />
            </a>
            <a href='/admin/dashboard' className="border cursor-pointer border-white/40 hover:bg-indigo-700 hover:text-gray-900 px-6 py-3 rounded-md font-medium">
              <ShinyText text="Admin Dashboard" disabled={false} speed={3} />
            </a>
            <a href='/finance/dashboard' className="border cursor-pointer border-white/40 hover:bg-indigo-700 hover:text-gray-900 px-6 py-3 rounded-md font-medium">
              <ShinyText text="Finance Dashboard" disabled={false} speed={3} />
            </a>
          
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
       
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['Kanban Boards', 'Organize your work visually with powerful drag-and-drop boards.'],
              ['Team Collaboration', 'Real-time updates keep your team aligned and productive.'],
              ['Advanced Reporting', 'Visual insights with integrated charting and analytics.'],
            ].map(([title, desc], i) => (
              <div key={i} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">What Our Users Say</h2>
          <blockquote className="italic text-gray-700 text-lg">
            “This tool transformed how our team manages projects. Clean, efficient, and actually enjoyable to use.”
          </blockquote>
          <p className="mt-4 font-semibold text-gray-900">— Alex M., Product Lead</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control?</h2>
          <p className="mb-8 text-lg">Join thousands of teams boosting productivity with our SaaS.</p>
          <a href="/register" className="bg-white cursor-pointer text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
            Create Your Account
          </a>
        </div>
      </section>
    </main>
    </div>
  );
}
