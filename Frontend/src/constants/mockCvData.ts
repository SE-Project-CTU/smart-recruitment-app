import type { RichTextCVDetail } from "@/types/cv";

type TiptapMark = {
  type: string;
  attrs?: Record<string, string>;
};

type TiptapNode = {
  type: string;
  text?: string;
  attrs?: Record<string, string>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
};

const textNode = (text: string, marks?: TiptapMark[]): TiptapNode => ({
  type: "text",
  text,
  ...(marks?.length ? { marks } : {}),
});

const paragraph = (
  text?: string,
  options: { align?: "left" | "center" | "right" | "justify"; marks?: TiptapMark[] } = {},
): TiptapNode => ({
  type: "paragraph",
  ...(options.align ? { attrs: { textAlign: options.align } } : {}),
  ...(text ? { content: [textNode(text, options.marks)] } : {}),
});

const richText = (...blocks: TiptapNode[]) => ({
  type: "doc" as const,
  content: blocks.length ? blocks : [paragraph()],
});

const bulletList = (items: string[]): TiptapNode => ({
  type: "bulletList",
  attrs: { listStyleType: "disc" },
  content: items.map((item) => ({
    type: "listItem",
    content: [paragraph(item)],
  })),
});

const linkedText = (text: string, href: string) =>
  richText(
    {
      type: "paragraph",
      attrs: { textAlign: "center" },
      content: [textNode(text, [{ type: "link", attrs: { href } }])],
    },
  );

/** CV parsed from the LaTeX sample, using the proposed Tiptap JSON structure. */
export const MOCK_CV_DETAIL_TIPTAP = {
  id: "1deb74e0-5228-4704-b680-1c9f4cc56cfd",
  candidateId: "ad2a1f8d-239b-460f-8193-b03fcc2a630d",
  templateId: "6a6c7345-ec6f-4b09-bf05-2a4a4a2e5a80",
  template: {
    id: "6a6c7345-ec6f-4b09-bf05-2a4a4a2e5a80",
    code: "modern_two_column",
    name: "Modern Two Column",
  },
  title: "Fullstack Developer - Phan Quoc Binh",
  content: {
    metadata: {
      version: "6.0",
      templateCode: "modern_two_column",
      language: "en",
      updatedAt: "2026-10-28T00:00:00.000000+00:00",
      defaultStyle: {
        fontFamily: "inter",
        fontScale: 1.0,
        primaryColors: ["#000000", "#466E8C"],
        lineHeight: 1.2,
      },
    },
    profile: {
      fullName: richText(paragraph("PHAN QUOC BINH", { align: "center", marks: [{ type: "bold" }] })),
      title: richText(paragraph("Fullstack Developer", { align: "center" })),
      avatarUrl: "",
      email: linkedText("binh26042005@gmail.com", "mailto:binh26042005@gmail.com"),
      phone: linkedText("0387405218", "tel:0387405218"),
      dob: richText(paragraph("20/04/2005", { align: "center" })),
      address: richText(paragraph("Can Tho", { align: "center" })),
      website: richText(),
      socialLink: linkedText(
        "linkedin.com/in/phan-quoc-binh",
        "https://www.linkedin.com/in/phan-quoc-binh",
      ),
    },
    sections: {
      order: [
        "objective",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "awards",
        "interests",
        "additionalInfo",
      ],
      objective: {
        title: richText(paragraph("Objective", { marks: [{ type: "bold" }] })),
        visible: true,
        content: richText(
          paragraph(
            "Software Engineering student with hands-on experience in frontend development and full-stack projects using JavaScript and TypeScript. Seeking a Full Stack JavaScript Developer position to build useful features and improve real-world applications.",
          ),
        ),
      },
      experience: {
        title: richText(paragraph("Work Experience", { marks: [{ type: "bold" }] })),
        visible: true,
        items: [
          {
            id: "exp_01",
            company: richText(paragraph("FPT Software (Can Tho)", { marks: [{ type: "bold" }] })),
            position: richText(paragraph("Java Intern", { marks: [{ type: "italic" }] })),
            startDate: richText(paragraph("2026-05")),
            endDate: richText(paragraph("2026-08")),
            description: richText(
              bulletList([
                "Developed and refactored application features, resolving issues based on code review feedback.",
                "Collaborated with team members following Agile Scrum and Git Flow practices.",
              ]),
            ),
          },
          {
            id: "exp_02",
            company: richText(paragraph("Giratech AI", { marks: [{ type: "bold" }] })),
            position: richText(paragraph("Frontend Developer (Remote)", { marks: [{ type: "italic" }] })),
            startDate: richText(paragraph("2025-07")),
            endDate: richText(paragraph("2026-02")),
            description: richText(
              bulletList([
                "Developed and maintained production web applications using React/Next.js, TypeScript, and modern frontend libraries, focusing on reusable and responsive UI components.",
                "Integrated REST APIs and application workflows, contributing to feature development, UI improvements, and frontend architecture across multiple production projects.",
                "Projects: VN168 (https://vn168.vn), CMS, GiraTech Landing Page (https://giratech.vn), Loyalty App CMS.",
              ]),
            ),
          },
        ],
      },
      education: {
        title: richText(paragraph("Education", { marks: [{ type: "bold" }] })),
        visible: true,
        items: [
          {
            id: "edu_01",
            school: richText(paragraph("Can Tho University", { marks: [{ type: "bold" }] })),
            title: richText(paragraph("Software Engineering")),
            start: richText(paragraph("2023")),
            end: richText(paragraph("2027")),
            details: richText(
              paragraph("GPA: 3.81/4.0 (Present)."),
              paragraph("Expected graduation: 2027."),
              paragraph("English: TOEIC 675 (01/2026), able to communicate at a basic level."),
            ),
          },
        ],
      },
      skills: {
        title: richText(paragraph("Skills", { marks: [{ type: "bold" }] })),
        visible: true,
        items: [
          { id: "sk_01", name: richText(paragraph("Languages", { marks: [{ type: "bold" }] })), description: richText(paragraph("JavaScript, TypeScript, C#, Java, SQL, HTML, CSS")) },
          { id: "sk_02", name: richText(paragraph("Frontend", { marks: [{ type: "bold" }] })), description: richText(paragraph("React.js, Next.js, Tailwind CSS, Responsive Design, State Management")) },
          { id: "sk_03", name: richText(paragraph("Backend", { marks: [{ type: "bold" }] })), description: richText(paragraph("Node.js, Express.js, ASP.NET Core, EF Core, Spring Boot, Clean Architecture, RESTful API, JWT, CI/CD")) },
          { id: "sk_04", name: richText(paragraph("Database", { marks: [{ type: "bold" }] })), description: richText(paragraph("PostgreSQL, MongoDB")) },
          { id: "sk_05", name: richText(paragraph("Tools & AI", { marks: [{ type: "bold" }] })), description: richText(paragraph("Git & GitHub, Docker, GitHub Actions, Render, Antigravity, Codex, Postman, Figma")) },
          { id: "sk_06", name: richText(paragraph("Fundamentals", { marks: [{ type: "bold" }] })), description: richText(paragraph("OOP, DSA, Design Patterns")) },
        ],
      },
      projects: {
        title: richText(paragraph("Projects", { marks: [{ type: "bold" }] })),
        visible: true,
        items: [
          {
            id: "prj_01",
            projectName: richText(paragraph("Graph Algorithm Visualization Platform", { marks: [{ type: "bold" }] })),
            role: richText(paragraph("Software Developer", { marks: [{ type: "italic" }] })),
            start: richText(paragraph("2026-01")),
            end: richText(paragraph("2026-09")),
            description: richText(
              bulletList([
                "Built an interactive desktop application implementing and visualizing 6 graph algorithms with step-by-step execution and playback controls.",
                "Designed a reusable execution-state model to synchronize algorithm steps, pseudo-code, data structures, and Cytoscape visualization.",
                "Implemented Dijkstra’s shortest-path algorithm with a custom binary min-heap and path reconstruction, alongside Eulerian Cycle validation and traversal.",
                "Designed a modular architecture separating algorithm logic, graph services, state management, and UI, with Command Pattern-based undo/redo for graph editing.",
                "Tech: TypeScript, React.js, Electron.js, Cytoscape.js, Zustand.",
                "GitHub: https://github.com/VN-PhanQuocBinh/eulerian-cycle",
              ]),
            ),
          },
          {
            id: "prj_02",
            projectName: richText(paragraph("SmartHire – Recruitment & CV Management Platform", { marks: [{ type: "bold" }] })),
            role: richText(paragraph("Team Leader - Fullstack Developer (Team of 3)", { marks: [{ type: "italic" }] })),
            start: richText(paragraph("2026-09")),
            end: richText(),
            description: richText(
              bulletList([
                "Led the team through 3 Agile sprints, planned tasks, assigned work, and tracked progress using GitHub Projects.",
                "Designed database schemas and implemented 28 backend APIs, using EF Core transactions and background jobs to support data consistency and reduce response delays.",
                "Developed the CV Builder UI with React and TypeScript, supporting CV creation and editing; worked with the backend to align API responses with frontend requirements.",
                "Configured GitHub Actions CI/CD and deployed the frontend to Vercel and backend to Render, completing 3 successful deployments.",
                "Tech: C#, ASP.NET Core, EF Core, PostgreSQL, React, TypeScript, Docker, GitHub Actions.",
                "Demo: https://smart-recruitment-app.vercel.app (backend may take a moment to start).",
                "GitHub: https://github.com/SE-Project-CTU/smart-recruitment-app",
              ]),
            ),
          },
          {
            id: "prj_03",
            projectName: richText(paragraph("Smart Book Management System", { marks: [{ type: "bold" }] })),
            role: richText(paragraph("Fullstack Developer", { marks: [{ type: "italic" }] })),
            start: richText(paragraph("2025-09")),
            end: richText(paragraph("2025-12")),
            description: richText(
              bulletList([
                "Built semantic book search using multilingual embeddings and MongoDB Atlas Vector Search to find and rank relevant books.",
                "Developed an AI library assistant using semantic search and Gemini to recommend books and save chat history.",
                "Built REST APIs for authentication, book management, and borrowing with JWT role-based access; added automated embedding updates, Vietnamese keyword search, and Docker deployment.",
                "Tech: Vue.js, Express.js (TypeScript), MongoDB, Cloudinary, Hugging Face API, AI Studio, Docker.",
                "Demo: https://my-library-frontend-0-0-1.onrender.com (backend may take a moment to start).",
                "GitHub BE: https://github.com/VN-PhanQuocBinh/my-library.",
                "GitHub FE: https://github.com/VN-PhanQuocBinh/my-library-user-frontend.",
                "GitHub FE (CMS): https://github.com/VN-PhanQuocBinh/my-library-admin-frontend.",
              ]),
            ),
          },
        ],
      },
      certifications: {
        title: richText(paragraph("Certifications", { marks: [{ type: "bold" }] })),
        visible: true,
        items: [
          {
            id: "cert_01",
            name: richText(paragraph("TOEIC 675 – IIG Vietnam", { marks: [{ type: "bold" }] })),
            issueDate: richText(paragraph("2026-01")),
          },
          {
            id: "cert_02",
            name: richText(paragraph("Responsive Web Design – freeCodeCamp")),
            issueDate: richText(paragraph("2025")),
          },
        ],
      },
      awards: {
        title: richText(paragraph("Awards", { marks: [{ type: "bold" }] })),
        visible: true,
        items: [
          {
            id: "award_01",
            awardName: richText(paragraph("First Prize – CTU IT Hackathon", { marks: [{ type: "bold" }] })),
            date: richText(paragraph("2025-12")),
          },
        ],
      },
      interests: {
        title: richText(paragraph("Interests", { marks: [{ type: "bold" }] })),
        visible: true,
        content: richText(
          paragraph("Building side projects and exploring new web technologies."),
        ),
      },
      additionalInfo: {
        title: richText(paragraph("Additional Information", { marks: [{ type: "bold" }] })),
        visible: true,
        content: richText(
          paragraph("Languages: Vietnamese (native), English (TOEIC 675)."),
          paragraph("Availability: Open to full-time opportunities from July 2027."),
        ),
      },
    },
  },
  layout: {
    version: "1.0",
    areas: [
      {
        id: "main",
        sections: ["objective", "experience", "education", "skills", "projects"],
      },
    ],
  },
  language: "en",
  isPublic: false,
  createdAt: "2026-10-28T00:00:00.000000+00:00",
  updatedAt: "2026-10-28T00:00:00.000000+00:00",
  previewFile: null,
} satisfies RichTextCVDetail;
