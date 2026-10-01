import { Link } from "react-router-dom";

function Home() {
  return (
    <div>

      <section className="hero">

        <div className="hero-content">

          <p className="hero-tag">
            🚀 Start Your Career Journey
          </p>

          <h1>
            Find Your Next
            <span> Internship Opportunity</span>
          </h1>

          <p>
            Explore internships and job opportunities designed
            to help students and freshers build real-world skills.
          </p>

          <Link to="/jobs" className="hero-btn">
            Explore Jobs
          </Link>

        </div>

      </section>


      <section className="features">

        <h2>Why Choose DG Interns Hub?</h2>

        <div className="feature-grid">

          <div className="feature-card">
            <h3>💼 Real Opportunities</h3>
            <p>
              Discover internship opportunities that help
              you gain practical experience.
            </p>
          </div>

          <div className="feature-card">
            <h3>🚀 Build Your Career</h3>
            <p>
              Improve your technical and professional skills
              through real-world projects.
            </p>
          </div>

          <div className="feature-card">
            <h3>🌐 Explore Roles</h3>
            <p>
              Find opportunities across development, design,
              marketing and more.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;