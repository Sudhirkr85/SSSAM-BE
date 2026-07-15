// Mock Data for Blogs, Hirings, and Placements
// Used as fallback when database is empty or for local testing.

const mockBlogs = [
  {
    _id: "mock_blog_1",
    title: "Introduction to Artificial Intelligence & Machine Learning in 2026",
    slug: "introduction-to-ai-ml-2026",
    summary: "Explore the core concepts of AI and Machine Learning and understand why they are shaping the future of global industries.",
    content: `
      <h2>Why AI & ML Matter Now More Than Ever</h2>
      <p>Artificial Intelligence (AI) and Machine Learning (ML) have transitioned from futuristic concepts to everyday realities. In 2026, every industry, from healthcare to finance, is adopting AI-driven solutions to automate processes, optimize decision making, and personalize experiences.</p>
      <h3>Key Trends in 2026</h3>
      <ul>
        <li><strong>Generative AI:</strong> LLMs and image/code generators are becoming highly specialized for corporate use cases.</li>
        <li><strong>AI at the Edge:</strong> Processing data locally on devices rather than solely in the cloud.</li>
        <li><strong>Autonomous Agents:</strong> AI agents capable of carrying out complex workflows without constant human supervision.</li>
      </ul>
      <p>At SSSAM Academy, we prepare students with the practical skills needed to design, train, and deploy advanced AI models in production environments.</p>
    `,
    imageUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/mock-blog-ai.jpg",
    type: "Blog",
    status: "Published",
    active: true,
    tags: ["AI", "Machine Learning", "2026", "Technology"],
    createdAt: new Date("2026-06-10T10:00:00Z"),
    updatedAt: new Date("2026-06-10T10:00:00Z")
  },
  {
    _id: "mock_blog_2",
    title: "Why Python Remains the King of Data Science",
    slug: "why-python-remains-king-of-data-science",
    summary: "An in-depth look at why Python is the preferred programming language for data scientists, developers, and ML researchers.",
    content: `
      <h2>The Undisputed King of Data Programming</h2>
      <p>Python continues to dominate the data science ecosystem, thanks to its simplicity, readability, and a massive community of developers. From startups to tech giants like Google and Meta, Python is the foundation for data analysis and model building.</p>
      <h3>Major Libraries & Frameworks</h3>
      <p>Python's strength lies in its libraries:</p>
      <ul>
        <li><strong>Pandas & NumPy:</strong> Essential for data manipulation and math.</li>
        <li><strong>Scikit-Learn:</strong> The standard library for traditional machine learning algorithms.</li>
        <li><strong>PyTorch & TensorFlow:</strong> Powering deep learning and neural network training.</li>
      </ul>
      <p>If you're looking to start a career in data science, mastering Python is the first and most critical step.</p>
    `,
    imageUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/mock-blog-python.jpg",
    type: "Blog",
    status: "Published",
    active: true,
    tags: ["Python", "Data Science", "Coding", "Programming"],
    createdAt: new Date("2026-07-02T14:30:00Z"),
    updatedAt: new Date("2026-07-02T14:30:00Z")
  },
  {
    _id: "mock_hiring_1",
    title: "Full Stack Developer (MERN Stack) Job Alert",
    slug: "hiring-mern-developer-complistack",
    summary: "CompliStack Technologies is hiring a Full Stack Developer specializing in React, Node.js, Express, and MongoDB. Apply now!",
    content: `
      <h2>Join CompliStack Technologies as a MERN Developer</h2>
      <p>We are looking for a passionate Full Stack Developer to help build and scale our web applications. You will work closely with product designers, managers, and system administrators to design and deploy modern interfaces.</p>
      <h3>Job Requirements</h3>
      <ul>
        <li>Strong understanding of React.js, HTML5, CSS3, and modern frontend frameworks.</li>
        <li>Solid experience building RESTful APIs using Node.js and Express.</li>
        <li>Familiarity with MongoDB or relational databases (SQL).</li>
        <li>Basic understanding of AWS or Cloudflare deployments is a plus.</li>
      </ul>
      <p>Apply today via the direct link below!</p>
    `,
    imageUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/mock-hiring-mern.jpg",
    type: "Hiring",
    status: "Published",
    active: true,
    tags: ["MERN", "Full Stack", "Hiring", "Job Alert"],
    hiringDetails: {
      company: "CompliStack Technologies",
      role: "Full Stack Developer (MERN)",
      applyLink: "https://complistack.com/careers",
      location: "Gurugram / Hybrid"
    },
    createdAt: new Date("2026-07-12T09:00:00Z"),
    updatedAt: new Date("2026-07-12T09:00:00Z")
  },
  {
    _id: "mock_hiring_2",
    title: "Junior Data Analyst Internship",
    slug: "hiring-junior-data-analyst-sssam",
    summary: "SSSAM Academy is looking for a Junior Data Analyst Intern to join our internal analytics team in Sector 14, Gurugram.",
    content: `
      <h2>Data Analyst Internship at SSSAM Academy</h2>
      <p>We are offering an internship opportunity for students and freshers looking to build real-world experience in Data Analytics and Business Intelligence. You will work with business dashboards, clean datasets, and generate actionable insights.</p>
      <h3>Required Skills</h3>
      <ul>
        <li>Proficiency in Microsoft Excel and basic SQL.</li>
        <li>Hands-on experience or training in Power BI or Tableau.</li>
        <li>Analytical mindset with attention to detail.</li>
      </ul>
      <p>Selected candidates will receive structured mentorship and a stipend.</p>
    `,
    imageUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/mock-hiring-analyst.jpg",
    type: "Hiring",
    status: "Published",
    active: true,
    tags: ["Data Analyst", "Internship", "Power BI", "Excel"],
    hiringDetails: {
      company: "SSSAM Academy",
      role: "Junior Data Analyst Intern",
      applyLink: "https://sssamacademy.com/careers",
      location: "Gurugram Old DLF"
    },
    createdAt: new Date("2026-07-15T08:15:00Z"),
    updatedAt: new Date("2026-07-15T08:15:00Z")
  }
];

const mockPlacements = [
  {
    _id: "mock_placement_1",
    studentName: "Laxmi Kumari",
    companyName: "CompliStack Technologies",
    packageLPA: 5.5,
    designation: "Full Stack Developer",
    placedYear: 2026,
    photoUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/student_laxmi.jpg",
    companyLogoUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/complistack_logo.png",
    active: true,
    createdAt: new Date("2026-05-20T11:00:00Z")
  },
  {
    _id: "mock_placement_2",
    studentName: "Himanshi Yadav",
    companyName: "TechCorp Global",
    packageLPA: 6.2,
    designation: "Associate Data Scientist",
    placedYear: 2026,
    photoUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/student_himanshi.jpg",
    companyLogoUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/techcorp_logo.png",
    active: true,
    createdAt: new Date("2026-06-15T12:00:00Z")
  },
  {
    _id: "mock_placement_3",
    studentName: "Aryan Sharma",
    companyName: "AI Solutions Ltd",
    packageLPA: 7.5,
    designation: "Machine Learning Engineer",
    placedYear: 2025,
    photoUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/student_aryan.jpg",
    companyLogoUrl: "https://pub-4be7eebfa4c74e57885efd8680e4d52e.r2.dev/aisolutions_logo.png",
    active: true,
    createdAt: new Date("2025-11-10T10:00:00Z")
  }
];

module.exports = {
  mockBlogs,
  mockPlacements
};
