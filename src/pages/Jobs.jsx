import { useState } from "react";
import JobCard from "../components/JobCard";

function Jobs() {

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const jobs = [
    {
      icon: "💻",
      title: "Frontend Developer Intern",
      company: "DG Tech Solutions",
      location: "Remote",
      type: "Internship",
      category: "Development",
      description:
        "Work with React and modern web technologies to build responsive and user-friendly applications."
    },

    {
      icon: "⚙️",
      title: "Backend Developer Intern",
      company: "Innovate Labs",
      location: "Chennai",
      type: "Internship",
      category: "Development",
      description:
        "Learn backend development, REST APIs, databases and server-side application development."
    },

    {
      icon: "🎨",
      title: "UI/UX Design Intern",
      company: "Creative Studio",
      location: "Remote",
      type: "Internship",
      category: "Design",
      description:
        "Design intuitive interfaces and create engaging digital experiences for real-world products."
    },

    {
      icon: "🐍",
      title: "Python Developer Intern",
      company: "TechWorks",
      location: "Bangalore",
      type: "Internship",
      category: "Development",
      description:
        "Build Python applications and work with APIs, automation and database technologies."
    },

    {
      icon: "📊",
      title: "Data Analyst Intern",
      company: "Data Insights",
      location: "Chennai",
      type: "Internship",
      category: "Data",
      description:
        "Analyze datasets, discover useful insights and create reports using modern data tools."
    },

    {
      icon: "📱",
      title: "Digital Marketing Intern",
      company: "Growth Hub",
      location: "Remote",
      type: "Internship",
      category: "Marketing",
      description:
        "Learn SEO, social media marketing and digital campaign strategies from industry projects."
    }
  ];


  const filteredJobs = jobs.filter((job) => {

    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      job.category === category;

    return matchesSearch && matchesCategory;
  });


  return (

    <div className="jobs-page">

      {/* PAGE HEADER */}

      <section className="jobs-hero">

        <p className="page-label">
          CAREER OPPORTUNITIES
        </p>

        <h1>
          Explore Jobs & Internships
        </h1>

        <p>
          Find opportunities that match your skills,
          interests and career goals.
        </p>

      </section>


      {/* SEARCH + FILTER */}

      <section className="jobs-section">

        <div className="jobs-controls">

          <div className="search-box">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search internships..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="category-buttons">

            <button
              className={
                category === "All"
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() => setCategory("All")}
            >
              All
            </button>

            <button
              className={
                category === "Development"
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() =>
                setCategory("Development")
              }
            >
              Development
            </button>

            <button
              className={
                category === "Design"
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() =>
                setCategory("Design")
              }
            >
              Design
            </button>

            <button
              className={
                category === "Data"
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() =>
                setCategory("Data")
              }
            >
              Data
            </button>

            <button
              className={
                category === "Marketing"
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() =>
                setCategory("Marketing")
              }
            >
              Marketing
            </button>

          </div>

        </div>


        {/* JOB COUNT */}

        <div className="job-count">

          Showing <strong>{filteredJobs.length}</strong>{" "}
          opportunities

        </div>


        {/* JOB CARDS */}

        <div className="jobs-grid">

          {filteredJobs.length > 0 ? (

            filteredJobs.map((job, index) => (

              <JobCard
                key={index}
                icon={job.icon}
                title={job.title}
                company={job.company}
                location={job.location}
                type={job.type}
                category={job.category}
                description={job.description}
              />

            ))

          ) : (

            <div className="no-jobs">

              <div>🔍</div>

              <h3>No opportunities found</h3>

              <p>
                Try another search or category.
              </p>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default Jobs;