import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import logo from "./assets/dg-logo.png";

import "./App.css";


// =========================================================
// HOME PAGE
// =========================================================

function Home() {
  return (
    <>
      {/* HERO SECTION */}

<section className="hero">

  <img
    src={logo}
    alt="DG Interns Hub Logo"
    className="hero-logo"
  />

  <div className="hero-content">

          <div className="hero-badge">
            🚀 START YOUR CAREER JOURNEY
          </div>

          <h1>
            Find Your Next
            <span> Internship Opportunity</span>
          </h1>

          <p>
            Discover internships, gain real-world experience,
            and take the next step toward your dream career.
          </p>

          <div className="hero-buttons">

            <Link
              to="/jobs"
              className="primary-button"
            >
              Explore Opportunities →
            </Link>

            <a
              href="#why-us"
              className="secondary-button"
            >
              Learn More
            </a>

          </div>

        </div>

      </section>


      {/* WHY SECTION */}

      <section
        id="why-us"
        className="why-section"
      >

        <div className="section-heading">

          <p>
            WHY DG INTERNS HUB
          </p>

          <h2>
            Everything you need to
            <span> start your career</span>
          </h2>

        </div>


        <div className="feature-grid">


          {/* FEATURE 1 */}

          <div className="feature-card">

            <div className="feature-icon">
              💼
            </div>

            <h3>
              Real Opportunities
            </h3>

            <p>
              Explore internship opportunities designed
              to provide practical industry experience.
            </p>

          </div>


          {/* FEATURE 2 */}

          <div className="feature-card">

            <div className="feature-icon">
              🚀
            </div>

            <h3>
              Career Growth
            </h3>

            <p>
              Build your technical and professional skills
              through meaningful projects.
            </p>

          </div>


          {/* FEATURE 3 */}

          <div className="feature-card">

            <div className="feature-icon">
              🌐
            </div>

            <h3>
              Multiple Domains
            </h3>

            <p>
              Discover opportunities across development,
              design, data, marketing and more.
            </p>

          </div>

        </div>

      </section>


      {/* STATS SECTION */}

      <section className="stats-section">

        <div>
          <strong>
            100+
          </strong>

          <span>
            Opportunities
          </span>
        </div>

        <div>
          <strong>
            50+
          </strong>

          <span>
            Companies
          </span>
        </div>

        <div>
          <strong>
            1000+
          </strong>

          <span>
            Students
          </span>
        </div>

        <div>
          <strong>
            10+
          </strong>

          <span>
            Domains
          </span>
        </div>

      </section>

    </>
  );
}



// =========================================================
// JOB CARD
// =========================================================

function JobCard({
  icon,
  title,
  company,
  location,
  type,
  category,
  description
}) {

  const handleApply = () => {

    alert(
      `Application started for ${title}`
    );

  };


  return (

    <div className="job-card">


      {/* JOB TOP */}

      <div className="job-top">

        <div className="job-icon">
          {icon}
        </div>

        <span className="job-type">
          {type}
        </span>

      </div>


      {/* JOB TITLE */}

      <h3>
        {title}
      </h3>


      {/* COMPANY */}

      <p className="job-company">
        {company}
      </p>


      {/* DETAILS */}

      <div className="job-details">

        <span>
          📍 {location}
        </span>

        <span>
          💼 {category}
        </span>

      </div>


      {/* DESCRIPTION */}

      <p className="job-description">
        {description}
      </p>


      {/* APPLY BUTTON */}

      <button
        className="apply-button"
        onClick={handleApply}
      >
        Apply Now →
      </button>

    </div>
  );
}



// =========================================================
// JOBS PAGE
// =========================================================

function Jobs() {

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");


  // JOB DATA

  const jobs = [

    {
      icon: "💻",

      title:
        "Frontend Developer Intern",

      company:
        "DG Tech Solutions",

      location:
        "Remote",

      type:
        "Internship",

      category:
        "Development",

      description:
        "Work with React and modern web technologies to build responsive and user-friendly applications."
    },


    {
      icon: "⚙️",

      title:
        "Backend Developer Intern",

      company:
        "Innovate Labs",

      location:
        "Chennai",

      type:
        "Internship",

      category:
        "Development",

      description:
        "Learn backend development, REST APIs, databases and server-side application development."
    },


    {
      icon: "🎨",

      title:
        "UI/UX Design Intern",

      company:
        "Creative Studio",

      location:
        "Remote",

      type:
        "Internship",

      category:
        "Design",

      description:
        "Design intuitive interfaces and create engaging digital experiences for real-world products."
    },


    {
      icon: "🐍",

      title:
        "Python Developer Intern",

      company:
        "TechWorks",

      location:
        "Bangalore",

      type:
        "Internship",

      category:
        "Development",

      description:
        "Build Python applications and work with APIs, automation and database technologies."
    },


    {
      icon: "📊",

      title:
        "Data Analyst Intern",

      company:
        "Data Insights",

      location:
        "Chennai",

      type:
        "Internship",

      category:
        "Data",

      description:
        "Analyze datasets, discover useful insights and create reports using modern data tools."
    },


    {
      icon: "📱",

      title:
        "Digital Marketing Intern",

      company:
        "Growth Hub",

      location:
        "Remote",

      type:
        "Internship",

      category:
        "Marketing",

      description:
        "Learn SEO, social media marketing and digital campaign strategies from industry projects."
    }

  ];


  // =======================================================
  // SEARCH + CATEGORY FILTER
  // =======================================================

  const filteredJobs =
    jobs.filter((job) => {

      const searchText =
        search.toLowerCase();


      const matchesSearch =

        job.title
          .toLowerCase()
          .includes(searchText)

        ||

        job.company
          .toLowerCase()
          .includes(searchText)

        ||

        job.category
          .toLowerCase()
          .includes(searchText)

        ||

        job.location
          .toLowerCase()
          .includes(searchText);


      const matchesCategory =

        category === "All"

        ||

        job.category === category;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  return (

    <div className="jobs-page">


      {/* JOB HERO */}

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



      {/* JOB SECTION */}

      <section className="jobs-section">


        {/* SEARCH + FILTER */}

        <div className="jobs-controls">


          {/* SEARCH BOX */}

          <div className="search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search internships..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>



          {/* CATEGORY BUTTONS */}

          <div className="category-buttons">


            {/* ALL */}

            <button
              className={
                category === "All"
                  ? "category-btn active"
                  : "category-btn"
              }

              onClick={() =>
                setCategory("All")
              }
            >
              All
            </button>


            {/* DEVELOPMENT */}

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


            {/* DESIGN */}

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


            {/* DATA */}

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


            {/* MARKETING */}

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

          Showing{" "}

          <strong>
            {filteredJobs.length}
          </strong>

          {" "}opportunities

        </div>



        {/* JOB CARDS */}

        <div className="jobs-grid">

          {filteredJobs.length > 0 ? (

            filteredJobs.map(
              (job, index) => (

                <JobCard
                  key={index}

                  icon={job.icon}

                  title={job.title}

                  company={job.company}

                  location={job.location}

                  type={job.type}

                  category={job.category}

                  description={
                    job.description
                  }
                />

              )
            )

          ) : (

            <div className="no-jobs">

              <div>
                🔍
              </div>

              <h3>
                No opportunities found
              </h3>

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



// =========================================================
// CONTACT PAGE
// =========================================================

function Contact() {


  const handleSubmit = (e) => {

    e.preventDefault();

    alert(
      "Thank you! Your message has been submitted."
    );

  };


  return (

    <section className="contact-page">

      <div className="contact-container">


        {/* CONTACT HEADER */}

        <div className="contact-header">

          <p className="page-label">
            GET IN TOUCH
          </p>

          <h1>
            Contact DG Interns Hub
          </h1>

          <p>
            Have questions about internships or career
            opportunities? We'd love to hear from you.
          </p>

        </div>



        <div className="contact-content">


          {/* CONTACT INFORMATION */}

          <div className="contact-info">

            <h2>
              Let's connect
            </h2>

            <p>
              Reach out to us and our team will get back
              to you as soon as possible.
            </p>



            {/* EMAIL */}

            <div className="contact-item">

              <div className="contact-icon">
                📧
              </div>

              <div>

                <h3>
                  Email
                </h3>

                <p>
                  support@dginternshub.com
                </p>

              </div>

            </div>



            {/* LOCATION */}

            <div className="contact-item">

              <div className="contact-icon">
                📍
              </div>

              <div>

                <h3>
                  Location
                </h3>

                <p>
                  India
                </p>

              </div>

            </div>



            {/* CAREER SUPPORT */}

            <div className="contact-item">

              <div className="contact-icon">
                💼
              </div>

              <div>

                <h3>
                  Career Support
                </h3>

                <p>
                  Internship and career opportunities
                </p>

              </div>

            </div>

          </div>



          {/* CONTACT FORM */}

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >


            {/* NAME */}

            <div className="form-group">

              <label>
                Your Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                required
              />

            </div>



            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                required
              />

            </div>



            {/* SUBJECT */}

            <div className="form-group">

              <label>
                Subject
              </label>

              <input
                type="text"
                placeholder="Enter subject"
                required
              />

            </div>



            {/* MESSAGE */}

            <div className="form-group">

              <label>
                Message
              </label>

              <textarea
                rows="5"
                placeholder="Write your message..."
                required
              ></textarea>

            </div>



            {/* SUBMIT */}

            <button
              type="submit"
              className="primary-button contact-button"
            >
              Send Message →
            </button>

          </form>

        </div>

      </div>

    </section>
  );
}



// =========================================================
// MAIN APP
// =========================================================

function App() {

  return (

    <BrowserRouter>

      <Navbar />


      <main>

        <Routes>


          {/* HOME */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* JOBS */}

          <Route
            path="/jobs"
            element={<Jobs />}
          />


          {/* CONTACT */}

          <Route
            path="/contact"
            element={<Contact />}
          />


        </Routes>

      </main>


      <Footer />

    </BrowserRouter>

  );
}


export default App;