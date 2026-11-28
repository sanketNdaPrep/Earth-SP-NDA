/**
 * Plain-language guide to each entry scheme, written from the official syllabus PDFs and the public UPSC and IAF
 * notices. Birth-date windows, dates, vacancies and fees change every year, so they are never written here:
 * each section tells students to read the notice of the year they apply in.
 */

export interface GuideRow {
  label: string;
  value: string;
}

export interface GuideStep {
  title: string;
  text: string;
}

export interface GuideSection {
  id: string;
  title: string;
  intro?: string;
  rows?: GuideRow[];
  steps?: GuideStep[];
  bullets?: string[];
}

export interface ExamGuide {
  /** The stages in order, shown as a flow at the top. */
  stages: GuideStep[];
  sections: GuideSection[];
  officialSite: { label: string; url: string };
}

const UPSC = { label: "upsc.gov.in", url: "https://upsc.gov.in" };

const SSB_DAYS: GuideStep[] = [
  { title: "Day 1: Screening", text: "An Officer Intelligence Rating test (verbal and non-verbal reasoning) and Picture Perception and Discussion. Only those who pass stay for the next four days." },
  { title: "Day 2: Psychology tests", text: "Thematic Apperception Test (a picture story), Word Association, Situation Reaction and Self Description. They show how you think and what you value." },
  { title: "Days 3 and 4: Group Testing Officer tasks", text: "Group Discussion, Group Planning Exercise, Progressive and Half Group Tasks, Individual Obstacles, Group Obstacle Race, Lecturette, Command Task and Final Group Task." },
  { title: "Personal Interview", text: "A one-to-one talk with the Interviewing Officer about your background, interests, current affairs and why you want to serve. It is held across the days." },
  { title: "Day 5: Conference", text: "All assessors meet with each candidate. The board decides whether you are recommended." },
];

export const EXAM_GUIDE: Record<string, ExamGuide> = {
  nda: {
    officialSite: UPSC,
    stages: [
      { title: "Written exam", text: "900 marks. Mathematics 300 and General Ability Test 600." },
      { title: "SSB", text: "900 marks over five days." },
      { title: "Medical", text: "Done after the SSB for recommended candidates." },
      { title: "Final merit", text: "Written and SSB marks added: 1800 in all." },
    ],
    sections: [
      {
        id: "eligibility",
        title: "Who can apply",
        rows: [
          { label: "Nationality", value: "An Indian citizen, or a subject of Nepal or Bhutan, or a Tibetan refugee who settled in India before 1 January 1962, or a person of Indian origin who migrated from Pakistan, Burma, Sri Lanka or an East African country to settle in India." },
          { label: "Gender", value: "Unmarried men and women can both apply." },
          { label: "Education: Army wing", value: "Class 12 (10+2) pass in any stream from a recognised board or university." },
          { label: "Education: Air Force and Naval wings, and the Naval Academy 10+2 Cadet Entry", value: "Class 12 pass with Physics and Mathematics." },
          { label: "Class 12 students", value: "You can apply while appearing in Class 12, but you must show your pass proof when the board asks for it." },
          { label: "Marital status", value: "Unmarried. A cadet who marries during training is removed from the Academy." },
          { label: "Attempts", value: "There is no fixed limit, as long as you stay within the age window." },
        ],
      },
      {
        id: "age",
        title: "Age limit",
        rows: [
          { label: "Age at joining", value: "16.5 to 19.5 years." },
          { label: "Birth-date window", value: "Printed in each year's UPSC notice as two exact dates. Check it before you apply: one day outside it makes you ineligible." },
          { label: "Relaxation", value: "None for any category. The limit is the same for men and women." },
        ],
      },
      {
        id: "physical",
        title: "Physical and medical standards",
        intro: "The medical board checks these after the SSB. Standards differ by wing, and the Air Force is the strictest.",
        rows: [
          { label: "Minimum height", value: "Army and Navy 157 cm. Air Force 162.5 cm. Women 152 cm. Candidates from Gorkha, Garhwali, Kumaon and hill areas of the North-East get 5 cm relaxation, and Lakshadweep 2 cm." },
          { label: "Weight", value: "Must match the height and age chart in the notice. You can be rejected for being under or overweight." },
          { label: "Air Force body measures", value: "Sitting height 81.5 to 96.0 cm, leg length 99.0 to 120.0 cm, thigh length at most 64.0 cm." },
          { label: "Vision", value: "Corrected vision of 6/6 in one eye and 6/9 in the other is the general rule. Air Force needs colour vision CP-I and does not accept manifest myopia." },
          { label: "General health", value: "Free from any disease or disability that affects duty. A good dental count and no major scars or deformity." },
        ],
      },
      {
        id: "selection",
        title: "How selection works",
        steps: [
          { title: "Apply online", text: "On the UPSC website when the notice opens, twice a year. The fee is small and some groups pay nothing: read the notice." },
          { title: "Written exam", text: "Two papers of objective questions in English and Hindi. Wrong answers lose one third of the marks. You must reach a minimum in each paper separately." },
          { title: "SSB call-up", text: "Candidates are called in merit order for the Services Selection Board." },
          { title: "SSB for five days", text: "Screening, psychology, group tasks, interview and conference. Details are in the next section." },
          { title: "Medical", text: "A full medical at a military hospital for candidates the SSB recommends." },
          { title: "Final merit list", text: "Your written marks and SSB marks are added out of 1800 and vacancies are filled in that order." },
        ],
      },
      {
        id: "ssb",
        title: "SSB day by day",
        intro: "The Services Selection Board tests personality, not only knowledge. It is the same board process across the Army, Navy and Air Force entries.",
        steps: SSB_DAYS,
      },
      {
        id: "tips",
        title: "Good to know",
        bullets: [
          "Paper I is of Class 11 and 12 Mathematics level. Paper II covers English, Physics, Chemistry, General Science, History, Civics, Geography and current events.",
          "Maths carries 300 marks and the General Knowledge part 400, so both matter. Neglecting either puts you at risk of missing the sectional cut-off.",
          "The SSB carries as many marks as the whole written exam, so start preparing for it early.",
          "Syllabus, pattern and dates can change. The official notice always wins over any summary.",
        ],
      },
    ],
  },

  cds: {
    officialSite: UPSC,
    stages: [
      { title: "Written exam", text: "300 marks for IMA, INA and AFA. 200 marks for OTA." },
      { title: "SSB", text: "300 marks for IMA, INA and AFA. 200 marks for OTA." },
      { title: "Medical", text: "For recommended candidates." },
      { title: "Final merit", text: "600 marks in all for IMA, INA and AFA, and 400 for OTA." },
    ],
    sections: [
      {
        id: "academies",
        title: "The four academies",
        rows: [
          { label: "IMA, Dehradun", value: "Indian Military Academy: officers for the Army. Papers: English, General Knowledge and Elementary Mathematics." },
          { label: "INA, Ezhimala", value: "Indian Naval Academy: officers for the Navy. Needs an engineering degree. Same three papers." },
          { label: "AFA, Hyderabad", value: "Air Force Academy: Flying and Ground Duty officers. Same three papers." },
          { label: "OTA, Chennai", value: "Officers Training Academy: short service commission for men and women. English and General Knowledge only, so no Mathematics paper." },
        ],
      },
      {
        id: "eligibility",
        title: "Who can apply",
        rows: [
          { label: "Nationality", value: "An Indian citizen, or a subject of Nepal or Bhutan, or a Tibetan refugee who settled in India before 1 January 1962, or a person of Indian origin who migrated from Pakistan, Burma, Sri Lanka or an East African country to settle in India." },
          { label: "IMA and OTA", value: "A bachelor's degree in any subject from a recognised university. Final-year students can apply if they can show the degree in time." },
          { label: "Indian Naval Academy", value: "A bachelor's degree in engineering." },
          { label: "Air Force Academy", value: "A bachelor's degree with Physics and Mathematics at Class 12 level, or an engineering degree." },
          { label: "Marital status", value: "IMA, INA and AFA: unmarried. OTA men: may be married or unmarried. OTA women: unmarried, widowed or divorced." },
          { label: "Attempts", value: "No fixed limit within the age window." },
        ],
      },
      {
        id: "age",
        title: "Age limit",
        rows: [
          { label: "IMA and INA", value: "19 to 24 years." },
          { label: "Air Force Academy", value: "20 to 24 years." },
          { label: "OTA, men and women", value: "19 to 25 years." },
          { label: "Birth-date window", value: "Printed in each year's UPSC notice as two exact dates. Check it before applying." },
        ],
      },
      {
        id: "physical",
        title: "Physical and medical standards",
        rows: [
          { label: "Minimum height, men", value: "Army 157.5 cm, Navy 157 cm, Air Force 162.5 cm. Gorkha, Garhwali, Kumaon and North-East hill candidates get 5 cm relaxation, and Lakshadweep 2 cm." },
          { label: "Minimum height, women", value: "152 cm for OTA." },
          { label: "Vision", value: "Corrected vision of 6/6 in the better eye and 6/12 in the worse eye for the Army. Navy and Air Force need clearer vision and have limits on short and long sight." },
          { label: "Teeth", value: "At least 14 dental points." },
          { label: "General health", value: "Free from disease or disability that affects duty, and not overweight for your height and age." },
        ],
      },
      {
        id: "pattern-notes",
        title: "Papers and marking",
        rows: [
          { label: "English", value: "120 questions, 100 marks, 2 hours. In English only." },
          { label: "General Knowledge", value: "120 questions, 100 marks, 2 hours. In English and Hindi." },
          { label: "Elementary Mathematics", value: "100 questions, 100 marks, 2 hours. Class 10 level. Not for OTA." },
          { label: "Wrong answers", value: "One third of that question's marks is deducted for each wrong answer." },
          { label: "Level", value: "English and General Knowledge are of graduate standard. Mathematics is of Matriculation standard." },
        ],
      },
      {
        id: "selection",
        title: "How selection works",
        steps: [
          { title: "Apply online", text: "On the UPSC website when the notice opens, twice a year." },
          { title: "Written exam", text: "Three papers for IMA, INA and AFA, or two papers for OTA. Each paper is 2 hours." },
          { title: "SSB call-up", text: "Candidates are called in merit order. IMA and OTA candidates go to an Army selection centre, INA candidates to a Naval selection board, and AFA candidates to an Air Force Selection Board." },
          { title: "SSB for five days", text: "Screening, psychology, group tasks and interview. Air Force flying candidates also take the Pilot Aptitude Battery Test." },
          { title: "Medical", text: "A full medical for those the board recommends." },
          { title: "Final merit list", text: "Written and SSB marks are added and vacancies are filled in order, academy by academy." },
        ],
      },
      {
        id: "ssb",
        title: "SSB day by day",
        intro: "The same five-day structure runs for every academy. The Air Force board adds flying aptitude tests for pilot candidates.",
        steps: SSB_DAYS,
      },
      {
        id: "tips",
        title: "Good to know",
        bullets: [
          "Elementary Mathematics is only Class 10 level, so it is the easiest place to score full marks. Do not skip it.",
          "OTA candidates do not write Mathematics, so their written exam is worth 200 marks.",
          "Syllabus, pattern, vacancies and dates change. The official notice always wins over any summary.",
        ],
      },
    ],
  },

  afcat: {
    officialSite: { label: "afcat.cdac.in", url: "https://afcat.cdac.in" },
    stages: [
      { title: "Online test", text: "100 questions, 300 marks, 2 hours." },
      { title: "AFSB", text: "Five days at an Air Force Selection Board." },
      { title: "Medical", text: "For those the AFSB recommends." },
      { title: "Merit list", text: "Branch-wise, using your test and AFSB results." },
    ],
    sections: [
      {
        id: "branches",
        title: "Branches you can join",
        rows: [
          { label: "Flying Branch", value: "Pilots. You can apply through AFCAT, or through NCC Special Entry if you hold an NCC Air Wing C certificate." },
          { label: "Ground Duty, Technical", value: "Aeronautical Engineer (Electronics) and Aeronautical Engineer (Mechanical). These candidates also write the Engineering Knowledge Test." },
          { label: "Ground Duty, Non-Technical", value: "Administration, Logistics, Accounts, Education and Meteorology." },
        ],
      },
      {
        id: "eligibility",
        title: "Who can apply",
        rows: [
          { label: "Nationality", value: "An Indian citizen." },
          { label: "Flying Branch", value: "Class 12 with at least 50% in Mathematics and Physics, and a graduate degree (any subject with at least 60%, or a BE or BTech)." },
          { label: "Ground Duty, Technical", value: "Class 12 with at least 50% in Mathematics and Physics, and a four-year engineering degree in the branch the notice asks for." },
          { label: "Ground Duty, Non-Technical", value: "A graduate degree with at least 60%. Accounts needs a Commerce degree. Other branches are listed in the notice." },
          { label: "Final-year students", value: "You can apply with no backlogs and the required marks so far." },
          { label: "Marital status", value: "Candidates below 25 must be unmarried. Those who marry during training are removed and must repay the Air Force's training costs." },
          { label: "Not eligible", value: "Anyone removed from an academy for indiscipline, anyone who failed the pilot aptitude test earlier for the Flying Branch, or anyone debarred by the Ministry of Defence." },
          { label: "Serving government employees", value: "You need a No Objection Certificate and must show it at the AFSB." },
        ],
      },
      {
        id: "age",
        title: "Age limit",
        rows: [
          { label: "Flying Branch", value: "20 to 24 years. A valid DGCA commercial pilot licence raises the upper limit to 26." },
          { label: "Ground Duty, Technical and Non-Technical", value: "20 to 26 years." },
          { label: "Birth-date window", value: "Printed in each notice with exact dates. Check it before applying." },
        ],
      },
      {
        id: "physical",
        title: "Physical and medical standards",
        rows: [
          { label: "Height", value: "Flying Branch pilots 162 cm. Other aircrew 157 cm. Ground Duty men 157 cm and women 152 cm." },
          { label: "Body measures", value: "Sitting height 81.5 to 96.0 cm, leg length 99.0 to 120.0 cm, thigh length at most 64.0 cm." },
          { label: "Vision for Flying", value: "6/6 in one eye and 6/9 in the other, correctable to 6/6 for long sight. Colour vision CP-I. No manifest myopia." },
          { label: "Vision for Ground Duty", value: "Wider limits that depend on the branch. Colour vision CP-II for most, CP-III for Accounts, Logistics and Education." },
        ],
      },
      {
        id: "pattern-notes",
        title: "Papers and marking",
        rows: [
          { label: "Verbal Ability in English", value: "About 25 to 30 questions." },
          { label: "General Awareness", value: "About 25 questions." },
          { label: "Numerical Ability", value: "About 20 to 25 questions." },
          { label: "Reasoning and Military Aptitude", value: "About 25 to 30 questions." },
          { label: "Marking", value: "+3 for a right answer and -1 for a wrong answer. The test is online and in English." },
          { label: "Engineering Knowledge Test", value: "Technical branch only. 50 questions, 150 marks, 45 minutes." },
        ],
      },
      {
        id: "selection",
        title: "How selection works",
        steps: [
          { title: "Apply online", text: "On the IAF website when the notice opens, twice a year. The fee is in the notice." },
          { title: "Online test", text: "A computer-based test with four sections and negative marking." },
          { title: "AFSB call-up", text: "Qualified candidates get a call-up for an Air Force Selection Board." },
          { title: "AFSB for five days", text: "Stage I screening, then Stage II psychology, group tasks and interview. Flying candidates also take the Pilot Aptitude Battery Test." },
          { title: "Medical", text: "A full Air Force medical for recommended candidates." },
          { title: "Merit list", text: "Candidates are ranked branch by branch and join the Air Force Academy." },
        ],
      },
      {
        id: "ssb",
        title: "AFSB day by day",
        intro: "The Air Force board uses the same five-day format as other services, with extra aptitude testing for pilots.",
        steps: SSB_DAYS,
      },
      {
        id: "tips",
        title: "Good to know",
        bullets: [
          "A right answer earns 3 marks and a wrong one costs 1, so guess only when you can rule out at least one option.",
          "The marks and branch you want decide which medical standards apply to you. Read the branch rows carefully.",
          "Syllabus, pattern, vacancies and dates change. The official notice always wins over any summary.",
        ],
      },
    ],
  },
};
