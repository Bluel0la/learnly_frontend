
import { Code, Palette, Smartphone, Globe } from "lucide-react";

const skills = [
  {
    icon: Code,
    title: "Frontend Development",
    description: "React, TypeScript, Next.js, Tailwind CSS",
  },
  {
    icon: Globe,
    title: "Backend Development",
    description: "Node.js, Python, PostgreSQL, MongoDB",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Figma, Adobe Creative Suite, Prototyping",
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    description: "React Native, Flutter, iOS/Android",
  },
];

export const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Me
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            I'm a passionate developer with 5+ years of experience creating digital solutions
            that combine beautiful design with powerful functionality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">My Story</h3>
            <p className="text-gray-600 mb-4">
              Started my journey in web development with a passion for creating user-centric
              experiences. I believe in the power of clean code, thoughtful design, and
              continuous learning.
            </p>
            <p className="text-gray-600 mb-4">
              When I'm not coding, you can find me exploring new technologies, contributing
              to open-source projects, or enjoying the great outdoors.
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-gray-600">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">5+</div>
                <div className="text-gray-600">Years</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">20+</div>
                <div className="text-gray-600">Clients</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=400&fit=crop"
              alt="Developer workspace"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <skill.icon className="text-blue-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {skill.title}
              </h4>
              <p className="text-gray-600">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
