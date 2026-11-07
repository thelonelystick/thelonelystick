update public.portfolio_content
set content = (content - 'heroTitle' - 'heroLead') || jsonb_build_object(
  'siteCopy',
  $site_copy$
  {
    "brandShort": "thelonelystick",
    "brandLong": "Bhawishya Kumar Sooryavanshi",
    "entryOwner": "BHAWISHYA KUMAR SOORYAVANSHI",
    "heroEyebrow": "STUDENT DEVELOPER · ALWAYS LEARNING",
    "heroTitle": "Building my skills.<br>Bringing ideas <span class=\"gold-text\">to life.</span>",
    "heroLead": "I'm Bhawishya, a student developer exploring web technologies, AI-powered tools, and digital products. I learn by building — one idea, one experiment, and one project at a time.",
    "heroPrimaryAction": "Explore projects",
    "heroSecondaryAction": "A little about me",
    "heroCaptionFirst": "CURIOUS BY NATURE",
    "heroCaptionSecond": "BUILDING IN PUBLIC, ONE STEP AT A TIME",
    "monogramLabel": "LEARN / BUILD / REPEAT",
    "heroNote": "Ideas into interfaces",
    "learningNoteLabel": "Currently learning",
    "cornerIndex": "PORTFOLIO — 2026",
    "scrollLabel": "SCROLL TO EXPLORE",
    "aboutKicker": "01 / ABOUT ME",
    "aboutTitle": "I'm here to <span class=\"dim\">understand how things work — then build something useful with them.</span>",
    "aboutParagraphFirst": "As a student developer, I'm growing my foundation in programming while exploring how design and technology come together in useful digital experiences.",
    "aboutParagraphSecond": "My projects are a mix of practical builds, early-stage concepts, and experiments. Each one helps me learn a new skill and think more clearly about solving problems.",
    "principles": ["Learn by doing", "Keep it practical", "Improve continuously"],
    "projectsKicker": "02 / PROJECTS & IDEAS",
    "projectsTitle": "What I'm working on<span class=\"gold\">.</span>",
    "projectsDescription": "A snapshot of my interests across web development, AI, and digital products.",
    "projectsNote": "Project descriptions distinguish existing work from concepts that are still being explored or developed.",
    "learningKicker": "03 / CURRENT TOOLKIT",
    "learningTitle": "Learning.<br><span class=\"gold-text\">Building.</span><br>Repeating.",
    "learningIntro": "A growing toolkit, strengthened through coursework, experimentation, and personal projects.",
    "toolGroups": [
      {"title": "WEB FOUNDATIONS", "items": ["HTML", "CSS", "JavaScript", "Responsive Design"]},
      {"title": "EXPLORING IN PROJECTS", "items": ["React", "TypeScript", "Firebase", "UI / UX"]},
      {"title": "AREAS OF INTEREST", "items": ["AI Assistants", "Automation", "Cybersecurity", "Digital Products"]}
    ],
    "learningNote": "I value honest progress over pretending to know everything. This list reflects my learning journey, not a claim of expert-level proficiency.",
    "contactKicker": "04 / LET'S CONNECT",
    "contactTitle": "Good ideas start<br>with a <span class=\"gold-text\">conversation.</span>",
    "contactAction": "Get in touch",
    "footerNote": "Student developer. Always learning.",
    "backToTop": "BACK TO TOP ↑",
    "footerOwner": "Bhawishya Sooryavanshi",
    "footerMadeWith": "MADE WITH CURIOSITY"
  }
  $site_copy$::jsonb
  || COALESCE(content->'siteCopy', '{}'::jsonb)
  || jsonb_build_object(
    'heroTitle', COALESCE(content->'heroTitle', '"Building my skills.<br>Bringing ideas <span class=\"gold-text\">to life.</span>"'::jsonb),
    'heroLead', COALESCE(content->'heroLead', '"I''m Bhawishya, a student developer exploring web technologies, AI-powered tools, and digital products."'::jsonb)
  )
)
where id = 'published';
