import JobCard from "../components/JobCard";

function Jobs() {

  const jobs = [
    {
      title: "Frontend Developer Intern",
      company: "DG Tech Solutions",
      location: "Remote",
      type: "Internship",
      description:
        "Work with React and modern web technologies to build responsive applications."
    },
    {
      title: "Backend Developer Intern",
      company: "Innovate Labs",
      location: "Chennai",
      type: "Internship",
      description:
        "Learn backend development, APIs and database integration through practical projects."
    },
    {
      title: "UI/UX Design Intern",
      company: "Creative Studio",
      location: "Remote",
      type: "Internship",
      description:
        "Design user-friendly interfaces and create engaging digital experiences."
    },
    {
      title: "Python Developer Intern",
      company: "TechWorks",
      location: "Bangalore",
      type: "Internship",
      description:
        "Develop Python applications and work with APIs, databases and automation."
    },
    {
      title: "Digital Marketing Intern",
      company: "Growth Hub",
      location: "Remote",
      type: "Internship",
      description:
        "Learn social media marketing, SEO and digital campaign management."
    },
    {
      title: "Data Analyst Intern",
      company: "Data Insights",
      location: "Chennai",
      type: "Internship",
      description:
        "Work with datasets and create meaningful insights using data analysis tools."
    }
  ];

  return (
    <div className="jobs-page">

      <section className="page-header">
        <p>CAREER OPPORTUNITIES</p>

        <h1>Explore Jobs & Internships</h1>

        <span>
          Find the right opportunity to start your career.
        </span>
      </section>


      <section className="jobs-container">

        <div className="jobs-grid">

          {jobs.map((job, index) => (
            <JobCard
              key={index}
              title={job.title}
              company={job.company}
              location={job.location}
              type={job.type}
              description={job.description}
            />
          ))}

        </div>

      </section>

    </div>
  );
}

export default Jobs;