import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import Chatbot from "~~/components/Chatbot";
import { MetaHeader } from "~~/components/MetaHeader";
import Projects from "~~/components/Projects";
import Skills from "~~/components/Skills";
import Timeline from "~~/components/Timeline";
import experiences from "~~/public/assets/data/experiences.json";
import education from "~~/public/assets/data/formation.json";
import projects from "~~/public/assets/data/projects.json";
import tech from "~~/public/assets/data/tech.json";

const Home: NextPage = () => {
  const [isActive, setIsActive] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsActive(entry.isIntersecting);
        });
      },
      { threshold: 0.5 },
    ); // 0.5 indique que 50% de l'élément doit être visible

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [sectionRef]);

  return (
    <>
      <MetaHeader />
      <div className="pt-10 mx-auto w-full overflow-y-auto overflow-x-hidden mt-20">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Meet</span>
            <span className="block text-4xl font-bold text-primary">Alexis Balayre</span>
          </h1>

          {/* About me */}
          <div
            className="mx-auto container grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center"
            ref={sectionRef}
            id="aboutMe"
          >
            <div className="order-2 md:order-1  mx-auto container">
              <div className="md:mt-20"></div>
              <h2
                className={`transition-colors duration-500 text-4xl font-bold mb-3 text-center md:text-left ${
                  isActive ? "" : "text-gray-600"
                }`}
              >
                Who am I? 🤔
              </h2>
              <p className={`transition-colors duration-500 mb-4 mt-10 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Name:</strong> Alexis Balayre
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Birth Date:</strong> Avril 15, 2001
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Nationality:</strong> French
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Location:</strong> London, UK
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Degrees:</strong> ISEP Engineer | Msc in Computational Intelligence for Data Analytics
              </p>
              <p
                className={`transition-colors duration-500 mb-4 text-justify md:ml-10 ${
                  isActive ? "" : "text-gray-600"
                }`}
              >
                <strong>Specialisations:</strong> Data Engineering | Data Intelligence | Blockchain
              </p>
              <div className="divider md:ml-10 "></div>
              <p className={`transition-colors duration-500 text-justify md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                I&#39;m deeply passionate about harnessing the power of transforming raw data into actionable
                information to make informed decisions. I have a solid grounding in both the theoretical and practical
                aspects of computational intelligence for data analytics. Thanks to my dual degree, I&#39;ve acquired a
                unique blend of skills covering project management, data analysis, IT techniques and engineering best
                practice.
              </p>
            </div>
            <div className="flex justify-center order-1 md:order-2 mb-8 md:mb-0">
              <div className="relative">
                <Image
                  src="/assets/img/alexis.png"
                  alt="Alexis Balayre"
                  className="rounded-full"
                  width={180}
                  height={200}
                />
              </div>
            </div>
          </div>

          {/* Education Timeline */}
          <div className="md:py-12 mx-auto container mt-10 md:mt-0" id="education">
            <div className="md:mb-20"></div>
            <h2 className="text-4xl font-bold mb-10 md:mb-20 text-center md:text-left">Education 🎓</h2>
            <Timeline items={education} />
          </div>

          {/* Experiences Timeline */}
          <div className="md:py-12 mx-auto container" id="experiences">
            <div className="md:mb-20"></div>
            <h2 className="text-4xl font-bold mb-10 md:mb-20 text-center md:text-left">Experiences 💼</h2>
            <Timeline items={experiences} />
          </div>

          {/* Skills Dashboard */}
          <div className="md:py-12 mx-auto container" id="skills">
            <div className="md:mb-20"></div>
            <h2 className="text-4xl font-bold mb-10 md:mb-20 text-center md:text-left">Skills 💻</h2>
            <Skills items={tech} />
          </div>

          {/* Projects */}
          <div className="md:py-12 mx-auto container mt-10 md:mt-0" id="projects">
            <div className="md:mb-20"></div>
            <h2 className="text-4xl font-bold mb-10 md:mb-20 text-center md:text-left">Top Projects 🏆</h2>
            <Projects items={projects} />
          </div>
        </div>

        {/* Chatbot */}
        <div className="md:py-12 mx-auto container mb-10 pr-5 pl-5 mt-10 md:mt-0" id="chatbot">
          <div className="md:mb-20"></div>
          <h2 className="text-4xl font-bold mb-10 md:mb-20 text-center md:text-left">Ask Me Anything 🤖</h2>
          <Chatbot />
        </div>
      </div>
    </>
  );
};

export default Home;
