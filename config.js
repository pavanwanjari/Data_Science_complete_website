window.DL10X_CONFIG = {
  SHEET_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbwtv9WdkPdWcWUGshKHoEGoYmR76032bTW_6BkZ7MNBkh6luNl9EXrePESYdAtx4zI/exec",
  WHATSAPP_NUMBER: "919403030512",
  WHATSAPP_TEXT: "Hi DataLearn10X, I want details about courses",
  AD_IMAGES_BASE_URL: "ads",
  AD_IMAGES: [
    "ad1.jpg",
    "ad4.jpg"
  ],
  JOB_BOARDS: [
    {
      name: "LinkedIn Jobs",
      url: "https://www.linkedin.com/jobs/",
      focus: "Best for professional networking + direct recruiter outreach.",
      tip: "Optimize headline, About section, and featured projects before applying.",
      bestFor: "Best for internships, analyst roles, and professional referrals."
    },
    {
      name: "Indeed",
      url: "https://www.indeed.com/",
      focus: "High volume job board with filters by location, salary, and experience.",
      tip: "Create multiple alerts for role keywords like Data Analyst, BI Analyst, Python Developer.",
      bestFor: "Best for daily job alerts and high-volume applications."
    },
    {
      name: "Naukri",
      url: "https://www.naukri.com/",
      focus: "Popular job platform for India with fresher and experienced roles.",
      tip: "Update profile completion, resume freshness, and key skills weekly.",
      bestFor: "Best for students and freshers targeting India-based companies."
    },
    {
      name: "Wellfound",
      url: "https://wellfound.com/jobs",
      focus: "Startup-focused jobs with transparent role details and salary ranges.",
      tip: "Use this for product, data, software, and startup internship roles.",
      bestFor: "Best for startup jobs and early-career tech roles."
    },
    {
      name: "Internshala",
      url: "https://internshala.com/jobs/",
      focus: "Internships and entry-level roles with student-friendly application flows.",
      tip: "Use it to build experience quickly if you are still in college.",
      bestFor: "Best for internships, traineeships, and first-job applications."
    },
    {
      name: "Glassdoor",
      url: "https://www.glassdoor.com/Job/index.htm",
      focus: "Job listings plus company reviews and salary insights.",
      tip: "Check interview reviews before applying to tailor your preparation.",
      bestFor: "Best for research before interviews and salary benchmarking."
    }
  ],
  ATS_API_OPTIONS: [
    {
      name: "Affinda Resume Parser",
      url: "https://docs.affinda.com/resumes",
      type: "Resume parsing API (free trial available)",
      summary: "Good when you want structured extraction of sections, skills, work history, and education from uploaded resumes.",
      integration: "Recommended production setup: send uploaded files from your backend to Affinda, then use the parsed JSON to auto-fill your resume builder and ATS insights.",
      studentUse: "Use it to reduce manual typing and improve resume section detection before scoring."
    },
    {
      name: "Eden AI Resume Parser",
      url: "https://www.edenai.co/feature/ocr-resume-parser-apis",
      type: "Unified resume parsing API (freemium / provider aggregator)",
      summary: "Useful if you want one integration that can switch across multiple document AI providers.",
      integration: "Best for a future backend layer where you compare provider quality and cost without rebuilding your frontend.",
      studentUse: "Use parsed output to highlight missing contact, skills, project, and education sections."
    },
    {
      name: "Adzuna API",
      url: "https://developer.adzuna.com/overview",
      type: "Job search API (registration required)",
      summary: "Provides searchable job ads, salary trends, categories, and company data through a REST API.",
      integration: "Best for powering dynamic job recommendations beside the ATS report after you add a secure backend proxy.",
      studentUse: "Show matching jobs by role, city, or skill gaps after resume analysis."
    }
  ]
};
