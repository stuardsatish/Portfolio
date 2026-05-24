import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Project Associate</h4>
                <h5>Cognizant · Full-time</h5>
              </div>
              <h3>Present</h3>
            </div>
            <p>
              Working on enterprise-level IT operations, incident management, and ServiceNow-based support solutions. Collaborating with cross-functional teams to improve workflow efficiency, automation, and customer support processes across multiple business applications.

            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Senior System Engineer</h4>
                <h5>Infosys · Full-time</h5>
              </div>
              <h3>2022</h3>
            </div>
            <p>
              Handled production support, troubleshooting, and system monitoring for enterprise applications. Worked closely with clients and internal teams to resolve technical issues, optimize performance, and maintain service reliability.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>System Engineer</h4>
                <h5>Infosys · Full-time</h5>
              </div>
              <h3>2020</h3>
            </div>
            <p>
              Supported application maintenance, incident resolution, and operational monitoring. Contributed to system enhancements, documentation, and day-to-day technical support activities within large-scale enterprise environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
