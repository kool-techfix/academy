import type { Locale } from "@/lib/locale";

/*
 * Landing page copy in English and Hausa. English is the source of truth;
 * the `LandingMessages` type makes TypeScript flag any key missing from a
 * translation.
 *
 * Product and brand names (Kool TechFix I.T Academy, KoolTech, IT) are left
 * untranslated. Course titles/descriptions come from the database and are
 * shown as stored.
 */
export type HeroStateCopy = {
  label: string;
  /** Exactly two lines; each must fit the hero panel (see globals.css). */
  heading: readonly [string, string];
  body: string;
};

export type LandingMessages = {
  nav: {
    label: string;
    courses: string;
    about: string;
    logIn: string;
    getStarted: string;
  };
  hero: {
    eyebrow: string;
    /** Learn → Apply → Innovate, in that order. */
    states: readonly [HeroStateCopy, HeroStateCopy, HeroStateCopy];
    pause: string;
    resume: string;
    getStarted: string;
    exploreCourses: string;
  };
  note: {
    eyebrow: string;
    title: string;
    body: string;
  };
  courses: {
    eyebrow: string;
    title: string;
    fullCurriculum: string;
    loading: string;
    error: string;
    empty: string;
  };
  courseCard: CourseCardLabels;
  about: {
    eyebrow: string;
    title: string;
    paragraphs: readonly [string, string];
    highlights: readonly [string, string, string];
  };
  footer: {
    logIn: string;
    getStarted: string;
  };
};

export type CourseCardLabels = {
  available: string;
  modules: (count: number) => string;
  learners: (count: number) => string;
  viewCourse: string;
  open: (title: string) => string;
};

export const landingMessages: Record<Locale, LandingMessages> = {
  en: {
    nav: {
      label: "Public navigation",
      courses: "Courses",
      about: "About KoolTech",
      logIn: "Log in",
      getStarted: "Get Started",
    },
    hero: {
      eyebrow: "Practical IT learning, built for the real world",
      states: [
        {
          label: "Learn",
          heading: ["Learn the work", "behind the work."],
          body: "Build practical IT knowledge with focused courses, experienced instructors, and clear progress that moves you closer to real-world confidence.",
        },
        {
          label: "Apply",
          heading: ["Apply your skills", "to real work."],
          body: "Put your knowledge into practice, strengthen your technical skills, and develop the confidence to solve real IT challenges.",
        },
        {
          label: "Innovate",
          heading: ["Innovate with skills", "that move you."],
          body: "Go beyond the basics, explore new possibilities, and apply your skills to create smarter solutions for a world that never stops evolving.",
        },
      ],
      pause: "Pause rotation",
      resume: "Resume rotation",
      getStarted: "Get Started",
      exploreCourses: "Explore courses",
    },
    note: {
      eyebrow: "The KoolTech approach",
      title: "Learn a little. Practise a lot. Keep the proof.",
      body: "Lessons that help you make the next useful decision, not just remember another definition.",
    },
    courses: {
      eyebrow: "Start with something useful",
      title: "Featured courses",
      fullCurriculum: "See the full curriculum",
      loading: "Loading courses...",
      error: "Unable to load courses right now.",
      empty: "No courses are currently available.",
    },
    courseCard: {
      available: "Available",
      modules: (n) => `${n} ${n === 1 ? "module" : "modules"}`,
      learners: (n) => `${n} ${n === 1 ? "learner" : "learners"}`,
      viewCourse: "View course",
      open: (title) => `Open ${title}`,
    },
    about: {
      eyebrow: "A better way to learn IT",
      title: "Skills that hold up when the room is busy.",
      paragraphs: [
        "KoolTech Fix IT Academy is a focused place to build the habits, vocabulary, and practical judgement that technicians use every day.",
        "Move at your own pace, return to the lessons that matter, and leave each course with a clearer sense of what you can do next.",
      ],
      highlights: [
        "Learn at your own pace",
        "Real instructors, practical lessons",
        "Certificates on completion",
      ],
    },
    footer: {
      logIn: "Log in",
      getStarted: "Get Started",
    },
  },

  ha: {
    nav: {
      label: "Babban kewayawa",
      courses: "Kwasa-kwasai",
      about: "Game da KoolTech",
      logIn: "Shiga",
      getStarted: "Fara Yanzu",
    },
    hero: {
      eyebrow: "Koyon IT a aikace, don ainihin duniyar aiki",
      states: [
        {
          label: "Koyo",
          heading: ["Koyi ilimin da ke", "bayan kowane aiki."],
          body: "Gina ilimin IT na aikace ta hanyar kwasa-kwasai masu mayar da hankali, ƙwararrun malamai, da ci gaba a fili wanda zai ƙara maka ƙwarin gwiwa a aikin gaske.",
        },
        {
          label: "Aiwatarwa",
          heading: ["Sanya ƙwarewarka", "cikin aikin gaske."],
          body: "Mayar da iliminka zuwa aiki, ƙarfafa ƙwarewarka ta fasaha, kuma ka sami ƙwarin gwiwar warware ainihin matsalolin IT.",
        },
        {
          label: "Ƙirƙira",
          heading: ["Ƙirƙira da ƙwarewa", "mai kai ka gaba."],
          body: "Wuce matakin farko, gano sababbin damammaki, kuma ka yi amfani da ƙwarewarka wajen samar da mafita mafi wayo ga duniyar da ba ta daina canzawa ba.",
        },
      ],
      pause: "Dakatar da juyawa",
      resume: "Ci gaba da juyawa",
      getStarted: "Fara Yanzu",
      exploreCourses: "Duba kwasa-kwasai",
    },
    note: {
      eyebrow: "Hanyar KoolTech",
      title: "Koyi kaɗan. Yi atisaye da yawa. Riƙe shaidar.",
      body: "Darussan da ke taimaka maka ka yanke shawara mai amfani ta gaba, ba wai kawai ka haddace wata ma'ana ba.",
    },
    courses: {
      eyebrow: "Fara da abu mai amfani",
      title: "Fitattun kwasa-kwasai",
      fullCurriculum: "Duba cikakken tsarin karatu",
      loading: "Ana loda kwasa-kwasai...",
      error: "Ba a iya loda kwasa-kwasai a yanzu ba.",
      empty: "Babu kwas da ake da shi a yanzu.",
    },
    courseCard: {
      available: "Akwai",
      modules: (n) => `${n} ${n === 1 ? "sashe" : "sassa"}`,
      learners: (n) => `${n} ${n === 1 ? "ɗalibi" : "ɗalibai"}`,
      viewCourse: "Duba kwas",
      open: (title) => `Buɗe ${title}`,
    },
    about: {
      eyebrow: "Hanya mafi kyau ta koyon IT",
      title: "Ƙwarewar da ke tsayawa ko da aiki ya yi yawa.",
      paragraphs: [
        "KoolTech Fix IT Academy wuri ne na musamman don gina ɗabi'u, kalmomi, da hikimar aiki da masu gyaran na'urori ke amfani da su kullum.",
        "Ka tafi yadda kake so, ka koma kan darussan da suka fi muhimmanci, kuma ka kammala kowane kwas da cikakkiyar fahimtar abin da za ka iya yi na gaba.",
      ],
      highlights: [
        "Koyi yadda kake so",
        "Malamai na gaske, darussa na aikace",
        "Takardar shaida idan an kammala",
      ],
    },
    footer: {
      logIn: "Shiga",
      getStarted: "Fara Yanzu",
    },
  },
};
