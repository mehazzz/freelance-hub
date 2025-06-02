import React from "react";
import { useNavigate } from "react-router-dom";

const milestones = [
  { date: "2025", event: "FreelanceHub founded with a vision to transform remote work." },
  { date: "2025 Q2", event: "Beta launch with users." },
  { date: "2025 Q4", event: "encouraging users to finish projects." },
  { date: "2026", event: "Secured funding, launched agency tools, globally." },
  { date: "2026", event: "Mobile app release and international expansion." }
];

const team = [
  { name: "Bhuvana S" },
  { name: "Mehak Naaz P" },
  { name: "Nabila" },
  { name: "Srujana Poornachandra" }
];

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel at any time. There are no yearly lock-ins—just pay monthly as you go."
  },
  {
    question: "What do I get as a freelancer?",
    answer: "Access to exclusive projects, a global network, learning resources, and community support."
  },
  {
    question: "How secure is FreelanceHub?",
    answer: "We prioritize security with robust protection systems and a dedicated support team."
  },
  {
    question: "How do companies pay for projects?",
    answer: "Clients pay a one-time fee of Rs.2999 per project, with no hidden costs."
  }
];

export default function About() {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = React.useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-500 to-blue-400 opacity-80 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center py-20 px-4">
          <img
            // src="https://undraw.co/api/illustrations/remote-team.svg?color=2563eb"
            // alt="Remote Team"
            className="w-40 md:w-52 mb-6 drop-shadow-xl animate-fadeInUp"
            style={{ animationDelay: "0.2s" }}
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-3 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            About FreelanceHub
          </h1>
          <p className="text-blue-100 text-lg md:text-xl text-center max-w-2xl animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            Where top freelancers and visionary clients connect, collaborate, and create the future of work.
          </p>
        </div>
      </div>

      {/* Main Card Section */}
      <main className="relative z-20 max-w-5xl mx-auto -mt-16 mb-10">
        <div className="bg-white rounded-3xl shadow-2xl px-8 md:px-16 py-12 md:py-16">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-blue-800">Our Story</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              FreelanceHub was founded in 2025 by a group of passionate freelancers and entrepreneurs who believed remote work could be more empowering, more human, and more rewarding.
              <br /><br />
              Today, we’re a thriving global community helping thousands of freelancers and clients find meaningful work, build relationships, and achieve more together.
            </p>
          </section>

          {/* Mission & Principles */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-blue-800">Our Mission & Principles</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700 text-lg list-disc list-inside">
              <li>Level the playing field for skilled professionals worldwide.</li>
              <li>Foster trust and transparency in every collaboration.</li>
              <li>Empower freelancers with tools, learning, and support.</li>
              <li>Promote sustainable, remote-first work culture.</li>
              <li>Innovate continuously to serve our global community.</li>
              <li>Prioritize security and privacy for all users.</li>
            </ul>
          </section>

          {/* Milestones Timeline */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-blue-800">Our Journey</h2>
            <ol className="relative border-l-4 border-blue-200 pl-6">
              {milestones.map((m, i) => (
                <li key={i} className="mb-8 last:mb-0">
                  <div className="absolute -left-2.5 w-5 h-5 bg-blue-600 rounded-full border-4 border-white"></div>
                  <span className="text-blue-700 font-semibold">{m.date}</span>
                  <span className="block text-gray-700 ml-1">{m.event}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Meet the Team */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-800">Meet the Team</h2>
            <div className="flex flex-wrap gap-6 justify-center">
              {team.map((member) => (
                <div key={member.name} className="bg-blue-50 rounded-xl shadow p-5 flex flex-col items-center w-56">
                  {/* <img
                    // src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mb-3 border-4 border-blue-200 object-cover"
                  /> */}
                  <div className="font-bold text-blue-800">{member.name}</div>
                  <div className="text-blue-600 text-sm">{member.role}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-blue-800">Simple, Transparent Pricing</h2>
            <div className="flex flex-wrap gap-8 justify-center mt-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-2xl shadow-lg p-8 w-80 flex flex-col items-center">
                <h3 className="text-xl font-bold mb-1">Freelancer</h3>
                <div className="text-3xl font-extrabold mb-2">₹499/mo</div>
                <ul className="text-white/90 mb-4 text-left list-disc list-inside">
                  <li>Unlimited project applications</li>
                  <li>Learning resources</li>
                  <li>Community support</li>
                </ul>
                <button className="bg-white text-blue-700 font-bold px-6 py-2 rounded-lg hover:bg-blue-50 transition">Start Free Trial</button>
              </div>
              <div className="bg-white border-2 border-blue-400 text-blue-800 rounded-2xl shadow-lg p-8 w-80 flex flex-col items-center">
                <h3 className="text-xl font-bold mb-1">Client/Company</h3>
                <div className="text-3xl font-extrabold mb-2">₹2999/project</div>
                <ul className="mb-4 text-left list-disc list-inside">
                  <li>Post unlimited projects</li>
                  <li>Access to top freelancers</li>
                  <li>Project management tools</li>
                </ul>
                <button className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition">Post a Project</button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-blue-800">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={faq.question} className="bg-blue-50 rounded-lg shadow px-4 py-3">
                  <button
                    className="w-full text-left font-semibold text-blue-700 focus:outline-none"
                    onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  >
                    {faq.question}
                  </button>
                  {faqOpen === idx && (
                    <div className="mt-2 text-gray-700">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-2 text-blue-800">Ready to Join the Future of Work?</h2>
            <p className="mb-4 text-gray-700">
              Join thousands of successful freelancers and clients on FreelanceHub.
            </p>
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-lg shadow-lg text-lg font-bold hover:from-blue-700 hover:to-blue-900 transition"
              onClick={() => navigate("/auth")}
            >
              Join FreelanceHub
            </button>
          </section>
        </div>
      </main>

      <footer className="text-center py-6 bg-blue-50 text-gray-500 rounded-b-2xl">
        &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
      </footer>
    </div>
  );
}
