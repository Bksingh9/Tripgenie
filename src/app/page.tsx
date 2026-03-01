export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">&#9992;</span>
          <span className="text-xl font-bold tracking-tight">Tripgenie</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
            Features
          </a>
          <a href="#how" className="text-sm text-gray-600 hover:text-gray-900">
            How it works
          </a>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700 mb-6">
          <span>&#9733;</span> AI-Powered Travel Platform
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
          Plan, Book & Journal
          <br />
          <span className="text-blue-600">Your Perfect Trip</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-xl">
          Tell Tripgenie where you want to go. Our AI builds your itinerary,
          finds the best deals on flights and hotels, and helps you capture
          every moment.
        </p>
        <div className="mt-10 flex gap-4">
          <button className="rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Start Planning — It&apos;s Free
          </button>
          <button className="rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition">
            See Demo
          </button>
        </div>

        {/* AI Chat Preview */}
        <div className="mt-16 w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 bg-gray-50">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-gray-400">Tripgenie AI</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm text-white max-w-sm">
                Plan me a 5-day trip to Tokyo for 2 people, budget $3000
              </div>
            </div>
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5 text-sm text-gray-800 max-w-sm">
                <p className="font-medium mb-1">Here&apos;s your Tokyo itinerary!</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Day 1: Shibuya & Harajuku<br />
                  Day 2: Asakusa & Akihabara<br />
                  Day 3: Day trip to Mt. Fuji<br />
                  Day 4: Tsukiji Market & Ginza<br />
                  Day 5: Shinjuku & departure<br />
                  <br />
                  Est. budget: $2,850 for 2
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
              <span className="text-gray-400 text-sm">Ask Tripgenie anything about your trip...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything you need for travel
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-lg mx-auto">
            From the first spark of inspiration to sharing memories after you return.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "&#129302;",
                title: "AI Assistant",
                desc: "Chat with AI to get personalized trip plans, restaurant picks, and hidden gems.",
              },
              {
                icon: "&#128197;",
                title: "Trip Planner",
                desc: "Drag-and-drop itinerary builder with maps, budgets, and weather forecasts.",
              },
              {
                icon: "&#9992;",
                title: "Book Everything",
                desc: "Flights, hotels, activities, and car rentals — compare prices and book in-app.",
              },
              {
                icon: "&#128214;",
                title: "Travel Journal",
                desc: "Document your trips with photos and stories. Share with friends or keep private.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-white border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div
                  className="text-3xl mb-4"
                  dangerouslySetInnerHTML={{ __html: f.icon }}
                />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Tell us where you want to go",
                desc: "Type a destination, a vibe, or a budget — our AI understands natural language.",
              },
              {
                step: "2",
                title: "Get a personalized itinerary",
                desc: "Tripgenie generates a day-by-day plan with activities, restaurants, and transport.",
              },
              {
                step: "3",
                title: "Book flights, hotels & activities",
                desc: "Compare prices across providers and book everything without leaving the app.",
              },
              {
                step: "4",
                title: "Travel & capture memories",
                desc: "Use the journal to document your trip, then share your story with the world.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-gray-500 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to plan your next adventure?
        </h2>
        <p className="text-blue-100 mb-8 max-w-md mx-auto">
          Join Tripgenie and let AI handle the planning while you focus on the experience.
        </p>
        <button className="rounded-lg bg-white text-blue-600 px-8 py-3 text-base font-semibold hover:bg-blue-50 transition">
          Get Started for Free
        </button>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 text-center text-sm text-gray-400">
        &copy; 2026 Tripgenie. Built with Next.js, Tailwind CSS, and AI.
      </footer>
    </main>
  );
}
