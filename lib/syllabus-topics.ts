/**
 * Every unit and topic of the three official syllabus PDFs (NDA, CDS, AFCAT), grouped by subject.
 * `slug` matches a row in the subjects table, so an admin-uploaded subject syllabus PDF can be linked to it.
 */
import type { ExamId } from "./subjects";

export interface TopicGroup {
  title: string | null;
  text: string;
}

export interface TopicUnit {
  title: string | null;
  /** For example "25-30 questions". */
  note: string | null;
  groups: TopicGroup[];
}

export interface SyllabusSubject {
  /** The slug of the matching row in the subjects table. */
  slug: string;
  name: string;
  /** Which paper or section, with marks. */
  tag: string;
  intro?: string;
  units: TopicUnit[];
}

export const SYLLABUS_TOPICS: Record<ExamId, SyllabusSubject[]> = {
  "nda": [
    {
      "slug": "mathematics",
      "name": "Mathematics",
      "tag": "Paper I - 300 marks - 120 questions - 2.5 hours",
      "units": [
        {
          "title": "Algebra",
          "note": "25-30 questions",
          "groups": [
            {
              "title": "Set Theory",
              "text": "Concept of a set, roster & set-builder forms, types of sets, subsets, power set, operations on sets (union, intersection, difference, symmetric difference, complement), Venn diagrams, De Morgan’s Laws, cardinality identities."
            },
            {
              "title": "Relations & Functions",
              "text": "Cartesian product of sets, definition of relation, domain, codomain & range, types of relations (reflexive, symmetric, transitive, equivalence relation)."
            },
            {
              "title": "Number Systems",
              "text": "Representation of real numbers on a number line; Binary system of numbers — conversion of a number from decimal system to binary system and vice-versa, binary arithmetic."
            },
            {
              "title": "Complex Numbers",
              "text": "Basic algebraic properties, iota (i), conjugate, modulus and principal argument, Argand plane, polar representation, cube roots of unity (1, ω, ω² ) and their properties, square root of a complex number."
            },
            {
              "title": "Sequences & Series",
              "text": "Arithmetic Progression (AP), Geometric Progression (GP), Harmonic Progression (HP), AM, GM, HM and their relation (A ≥ G ≥ H, G² = AH), sum to n terms and infinite GP, special series (sum of n, n² and n³)."
            },
            {
              "title": "Quadratic Equations & Inequations",
              "text": "Quadratic equations with real coefficients, nature of roots, relation between roots and coefficients, formation of equations, common roots, sign/range of quadratic expressions; solution of linear inequations of two variables by graphs."
            },
            {
              "title": "Permutations & Combinations",
              "text": "Fundamental principle of counting, n Pr, n Cr, permutations with repetition, circular permutations, combinations with restrictions, division into groups."
            },
            {
              "title": "Binomial Theorem",
              "text": "Binomial theorem for positive integral index, general & middle terms, independent term, properties of binomial coefficients, applications to approximations and divisibility."
            },
            {
              "title": "Logarithms",
              "text": "Definition, laws of logarithms, change of base, logarithmic equations & inequalities, characteristic and mantissa, applications."
            }
          ]
        },
        {
          "title": "Matrices and Determinants",
          "note": "8-10 questions",
          "groups": [
            {
              "title": "Matrices",
              "text": "Concept and order of a matrix, types of matrices (row, column, square, diagonal, scalar, identity, zero, symmetric, skew-symmetric, orthogonal, idempotent, involutory, nilpotent), equality and algebra of matrices (addition, scalar multiplication, matrix multiplication, transpose)."
            },
            {
              "title": "Determinants",
              "text": "Determinant of a square matrix (up to order 3), minors and cofactors, basic properties of determinants (row/column operations, factor theorem)."
            },
            {
              "title": "Adjoint, Inverse & Linear Systems",
              "text": "Adjoint and inverse of a square matrix (A⁻¹ = adj A ÷ |A|), singular vs. non-singular matrices, properties of |adj A| and |kA|; solution of a system of linear equations in two or three unknowns by Cramer’s Rule and by Matrix Method (X = A⁻¹B), consistency conditions."
            }
          ]
        },
        {
          "title": "Trigonometry",
          "note": "15-20 questions",
          "groups": [
            {
              "title": "Angles & Ratios",
              "text": "Angles and their measures in degrees and radians, arc length (l = rθ), trigonometrical ratios and signs in four quadrants (ASTC rule), domain, range and graphs of trigonometric functions."
            },
            {
              "title": "Identities & Formulae",
              "text": "Fundamental trigonometric identities, sum and difference formulae (sin(A ± B), cos(A ± B), tan(A ± B)), transformation formulae (C-D formulae and product-to-sum)."
            },
            {
              "title": "Multiple & Sub-Multiple Angles",
              "text": "Formulae for 2A, 3A, A/2, standard values (15°, 18°, 22.5°, 36°, 75°), maximum and minimum values of a sin θ + b cos θ."
            },
            {
              "title": "Trigonometric Equations & ITF",
              "text": "Principal and general solutions of trigonometric equations; Inverse Trigonometric Functions (sin⁻¹, cos⁻¹, tan⁻¹, cot⁻¹, sec⁻¹, csc⁻¹ ) — principal value branches, properties and identities."
            },
            {
              "title": "Applications",
              "text": "Properties of triangles (Sine rule, Cosine rule, Napier’s analogy, area of triangle, circumradius R, inradius r); Heights and Distances (angles of elevation and depression)."
            }
          ]
        },
        {
          "title": "Analytical Geometry of Two and Three Dimensions",
          "note": "18-22 questions",
          "groups": [
            {
              "title": "2D Coordinate Geometry",
              "text": "Rectangular Cartesian coordinate system, distance formula, section formula (internal/external), area of triangle, collinearity, centroid, incentre, circumcentre, orthocentre, locus."
            },
            {
              "title": "Straight Lines",
              "text": "Slope of a line, equation of a line in various forms (point-slope, slope-intercept, twopoint, intercept, normal, parametric), angle between two lines, parallel & perpendicular lines, distance of a point from a line, distance between parallel lines, concurrency, reflection/image of a point, pair of straight lines."
            },
            {
              "title": "Circles",
              "text": "Equation of a circle in standard and general form, centre and radius, diametric form, intercepts on axes, position of a point, tangent & normal, length of tangent, common tangents, radical axis."
            },
            {
              "title": "Conic Sections",
              "text": "Standard forms of Parabola, Ellipse, and Hyperbola; eccentricity, focus, directrix, vertex, latus rectum, axes of a conic, focal distance, condition of tangency."
            },
            {
              "title": "3D Analytical Geometry",
              "text": "Point in 3D space, distance between two points, section formula, Direction Cosines and Direction Ratios (l² + m² + n² = 1), projection of a segment; equation of a line (Cartesian & vector forms), shortest distance between skew lines, angle between two lines; equation of a plane in various forms, angle between two planes, angle between line and plane, distance of a point from a plane; equation of a sphere (general, central, diametric forms), plane section of a sphere."
            }
          ]
        },
        {
          "title": "Differential Calculus",
          "note": "12-15 questions",
          "groups": [
            {
              "title": "Functions",
              "text": "Concept of a real-valued function — domain, range and graph of standard functions (modulus, greatest integer [x], fractional part, signum, exponential, logarithmic), composite functions, one-one, onto, bijective and inverse functions, even/odd and periodic functions."
            },
            {
              "title": "Limits & Continuity",
              "text": "Notion of limit, LHL and RHL, standard algebraic, trigonometric, exponential and logarithmic limits, 1^∞ form, L’Hôpital’s Rule; continuity of functions at a point and on an interval, types of discontinuities, algebraic operations on continuous functions."
            },
            {
              "title": "Differentiation",
              "text": "Derivative of a function at a point, differentiability vs. continuity, geometrical & physical interpretation of a derivative, Rolle’s Theorem & Lagrange’s Mean Value Theorem; derivatives of sum, product, quotient, composite functions (Chain Rule), implicit functions, logarithmic & parametric differentiation, derivative of a function with respect to another function, second-order derivatives."
            },
            {
              "title": "Applications of Derivatives",
              "text": "Rate of change, tangents and normals, increasing and decreasing functions, maxima and minima (first & second derivative tests, word problems)."
            }
          ]
        },
        {
          "title": "Integral Calculus and Differential Equations",
          "note": "12-15 questions",
          "groups": [
            {
              "title": "Indefinite Integrals",
              "text": "Integration as inverse of differentiation, standard integrals (algebraic, trigonometric, exponential, hyperbolic), integration by substitution, integration by parts (ILATE), partial fractions, special forms such as the integral of e^x [f(x) + f′(x)] dx."
            },
            {
              "title": "Definite Integrals & Areas",
              "text": "Fundamental theorem of calculus, properties of definite integrals (King’s property, odd/even, periodicity), Wallis’ formula, Leibniz rule; determination of areas of plane regions bounded by curves (lines, circles, parabolas, ellipses, trig curves)."
            },
            {
              "title": "Differential Equations",
              "text": "Definition of order and degree, formation of a differential equation by eliminating arbitrary constants, general and particular solutions, first-order first-degree DEs (variable separable, reducible to separable, homogeneous, linear DE with integrating factor), applications to growth and decay problems."
            }
          ]
        },
        {
          "title": "Vector Algebra",
          "note": "5-8 questions",
          "groups": [
            {
              "title": "Vectors and their algebra",
              "text": "Vectors in 2D and 3D, magnitude and direction, types of vectors (unit, null, equal, collinear, coplanar, position vector), addition of vectors, triangle & parallelogram laws, scalar multiplication, section formula."
            },
            {
              "title": "Products and applications",
              "text": "Scalar (Dot) Product and projection of a vector on another; Vector (Cross) Product, area of triangle and parallelogram; scalar triple product (volume of parallelepiped, coplanarity); applications — work done by a force, moment (torque) of a force, geometrical problems."
            }
          ]
        },
        {
          "title": "Statistics and Probability",
          "note": "10-14 questions",
          "groups": [
            {
              "title": "Statistics",
              "text": "Classification of data, frequency & cumulative frequency distributions, graphical representation (Histogram, Pie Chart, Frequency Polygon, Ogives); measures of central tendency (Mean, Median, Mode, empirical relation, GM, HM); measures of dispersion (Range, Mean Deviation, Variance and Standard Deviation, Coefficient of Variation); Correlation and Regression (regression lines & coefficients)."
            },
            {
              "title": "Probability",
              "text": "Random experiment, sample space, events (mutually exclusive, exhaustive, impossible, certain, complementary, elementary, composite), union & intersection; classical and statistical definitions; addition & multiplication theorems, Conditional Probability, independent events, Bayes’ Theorem; random variable as a function on sample space, Binomial Distribution (mean np, variance npq) and examples."
            }
          ]
        }
      ]
    },
    {
      "slug": "english",
      "name": "English",
      "tag": "Paper II Part A - 200 marks - 50 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Grammar & Usage",
              "text": "Parts of speech (Nouns, Pronouns, Adjectives, Adverbs, Prepositions, Conjunctions, Articles), Tenses, Subject-Verb Agreement, Conditionals, Modals, Question Tags, Active & Passive Voice, Direct & Indirect Speech."
            },
            {
              "title": "Spotting Errors",
              "text": "Identifying grammatical, structural, or usage errors in segmented sentences."
            },
            {
              "title": "Sentence Improvement / Correction",
              "text": "Replacing underlined phrases with grammatically accurate and concise alternatives."
            },
            {
              "title": "Vocabulary (Synonyms & Antonyms)",
              "text": "Contextual and direct word meanings, roots, prefixes/suffixes, commonly confused words."
            },
            {
              "title": "Idioms & Phrases",
              "text": "Standard English idioms, phrasal verbs, and figurative expressions in context."
            },
            {
              "title": "Comprehension",
              "text": "Reading passages followed by inference, factual, tone, and vocabulary questions."
            },
            {
              "title": "Selecting Words (Cloze Test / Fill in the Blanks)",
              "text": "Choosing appropriate vocabulary, prepositions, or connectors to complete a coherent paragraph or sentence."
            },
            {
              "title": "Ordering of Words in a Sentence (PQRS) & Para Jumbles",
              "text": "Rearranging jumbled sentence fragments or sentences into a logically and grammatically coherent sequence."
            }
          ]
        }
      ],
      "intro": "Tests understanding of the language and workmanlike use of words."
    },
    {
      "slug": "physics",
      "name": "Physics",
      "tag": "GAT Part B - 100 marks - 25 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Properties of Matter & Mechanics",
              "text": "Physical properties and states of matter; Mass, Weight, Volume, Density and Specific Gravity; Principle of Archimedes, buoyancy; Pressure, Barometer; Motion of objects, Velocity and Acceleration, graphs of motion; Newton’s Laws of Motion, Force and Momentum, Conservation of Momentum; Parallelogram of Forces, Stability and Equilibrium of bodies; Gravitation, Kepler’s laws, acceleration due to gravity (g); Elementary ideas of Work, Power and Energy (KE, PE, conservation)."
            },
            {
              "title": "Heat & Thermodynamics",
              "text": "Effects of heat, Measurement of temperature (Celsius, Fahrenheit, Kelvin) and heat; Thermal expansion; Change of state and Latent Heat; Modes of transference of heat (Conduction, Convection, Radiation), Newton’s law of cooling."
            },
            {
              "title": "Sound & Waves",
              "text": "Sound waves and their properties (pitch, loudness, quality), speed of sound in media, echo, Doppler effect, Simple musical instruments."
            },
            {
              "title": "Light & Optics",
              "text": "Rectilinear propagation of light, Shadows and eclipses; Reflection (plane and spherical mirrors, mirror formula); Refraction (Snell’s law, total internal reflection, prism, dispersion); Spherical lenses (convex, concave, lens formula, power); Human Eye (structure, defects of vision — myopia, hypermetropia, presbyopia, astigmatism and their corrections)."
            },
            {
              "title": "Magnetism",
              "text": "Natural and artificial magnets, Properties of a magnet, Magnetic field lines, Earth as a magnet (declination, dip)."
            },
            {
              "title": "Electricity & Modern Physics",
              "text": "Static and Current Electricity, Conductors and Non-conductors (Insulators), Ohm’s Law, Resistance in series and parallel, Simple electrical circuits; Heating, Lighting and Magnetic effects of current; Measurement of Electrical Power (P = V I = I 2 R) and energy (kWh); Primary and Secondary Cells; Use of X-Rays, elementary radioactivity."
            },
            {
              "title": "General Principles in the Working of Official UPSC Instruments",
              "text": "Simple Pendulum, Simple Pulleys, Siphon, Levers (1st, 2nd, 3rd class), Balloon, Pumps, Hydrometer, Pressure Cooker, Thermos Flask, Gramophone, Telegraphs, Telephone, Periscope, Telescope, Microscope, Mariner’s Compass, Lightning Conductors, Safety Fuses."
            }
          ]
        }
      ]
    },
    {
      "slug": "chemistry",
      "name": "Chemistry",
      "tag": "GAT Part B - 60 marks - 15 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Basic Concepts & Laws",
              "text": "Physical and chemical changes; Elements, Mixtures and Compounds; Symbols, Formulae and Simple Chemical Equations; Laws of Chemical Combination (Conservation of Mass, Definite Proportions, Multiple Proportions — excluding numerical problems)."
            },
            {
              "title": "Atomic Structure & Bonding",
              "text": "Elementary ideas about the structure of the Atom (protons, neutrons, electrons, isotopes, isobars), Atomic, Equivalent and Molecular Weights, Valency, Chemical Bonding (ionic, covalent)."
            },
            {
              "title": "Gases, Air & Water",
              "text": "Properties of Air and Water (hard vs. soft water, heavy water); Preparation and properties of Hydrogen, Oxygen, Nitrogen, and Carbon Dioxide; Oxidation and Reduction (redox concepts)."
            },
            {
              "title": "Acids, Bases, Salts & Carbon",
              "text": "Acids, bases, and salts, pH scale, indicators; Carbon — different forms (allotropes: diamond, graphite, fullerene, coal, charcoal) and carbon compounds."
            },
            {
              "title": "Everyday & Industrial Chemistry",
              "text": "Fertilizers — Natural and Artificial (NPK, urea); Material used in the preparation of substances like Soap, Glass, Ink, Paper, Cement, Paints, Safety Matches, and Gunpowder."
            }
          ]
        }
      ]
    },
    {
      "slug": "general-science",
      "name": "General Science and Biology",
      "tag": "GAT Part B - 40 marks - 10 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Cell Biology & Life Processes",
              "text": "Difference between the living and non-living; Basis of Life — Cells, Protoplasms, and Tissues (plant & animal cells, cell organelles, mitosis/meiosis); Growth and Reproduction in Plants and Animals (asexual & sexual reproduction, pollination, fertilization)."
            },
            {
              "title": "Human Anatomy & Health",
              "text": "Elementary knowledge of the Human Body and its important organs (digestive, respiratory, circulatory, nervous, excretory, endocrine & skeletal systems); Common Epidemics, their causes (bacterial, viral, protozoan, fungal) and prevention, vaccines."
            },
            {
              "title": "Nutrition & Energy",
              "text": "Food — source of energy for man; Constituents of food (carbohydrates, proteins, fats, vitamins, minerals, water, roughage); Balanced Diet and deficiency diseases."
            },
            {
              "title": "Space & Scientific Achievements",
              "text": "The Solar System — Sun, planets, satellites, meteors, comets, asteroids, Solar & Lunar Eclipses; Achievements of Eminent Scientists (Indian & international)."
            }
          ]
        }
      ]
    },
    {
      "slug": "history",
      "name": "History, Freedom Movement and Polity",
      "tag": "GAT Part B - 80 marks - 20 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Indian History & Culture",
              "text": "Broad survey of Indian History with emphasis on Culture and Civilisation — Indus Valley Civilisation, Vedic Age, Buddhism & Jainism, Mauryan & Gupta Empires, Delhi Sultanate, Mughal Empire, Bhakti & Sufi Movements, Art, Architecture & Literature."
            },
            {
              "title": "Indian Freedom Movement (1857–1947)",
              "text": "Revolt of 1857, Socio-Religious Reform Movements, Foundation of INC, Partition of Bengal & Swadeshi, Gandhian Era (Non-Cooperation, Civil Disobedience, Quit India), Revolutionary Movement, Subhas Chandra Bose & INA, Cabinet Mission & Independence."
            },
            {
              "title": "Indian Polity & Administration",
              "text": "Elementary study of Indian Constitution and Administration (Preamble, Fundamental Rights & Duties, DPSP, Parliament, President, Judiciary, Constitutional Amendments); Five-Year Plans of India & NITI Aayog; Panchayati Raj, Co-operatives and Community Development; Bhoodan, Sarvodaya, National Integration and Welfare State; Basic Teachings of Mahatma Gandhi."
            },
            {
              "title": "World History & Internationalism",
              "text": "Forces shaping the modern world — Renaissance, Exploration and Discovery; War of American Independence; French Revolution, Industrial Revolution, and Russian Revolution; Impact of Science and Technology on Society; Concept of One World, United Nations (organs & agencies), Panchsheel, Democracy, Socialism and Communism; Role of India in the present world (NAM, BRICS, G20, etc.)."
            }
          ]
        }
      ]
    },
    {
      "slug": "geography",
      "name": "Geography",
      "tag": "GAT Part B - 80 marks - 20 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Astronomical & Physical Geography",
              "text": "The Earth — shape and size; Latitudes and Longitudes, Concept of Time (GMT, IST), International Date Line; Movements of Earth (rotation & revolution) and their effects (day/night, seasons, solstices, equinoxes); Origin of Earth."
            },
            {
              "title": "Geomorphology & Oceanography",
              "text": "Rocks and their classification (igneous, sedimentary, metamorphic); Weathering — Mechanical and Chemical; Earthquakes and Volcanoes, landforms; Ocean Currents and Tides, salinity & ocean relief."
            },
            {
              "title": "Climatology",
              "text": "Atmosphere and its composition & layers; Temperature and Atmospheric Pressure belts; Planetary Winds (Trade, Westerlies, Polar), local winds, Cyclones and Anti-cyclones; Humidity, Condensation and Precipitation; Types of Climate, Major Natural Regions of the World (Equatorial, Savanna, Desert, Mediterranean, Steppe, Taiga, Tundra)."
            },
            {
              "title": "Indian & Economic Geography",
              "text": "Regional Geography of India — Physiography (Himalayas, Plains, Plateau, Coasts, Islands), Drainage/Rivers, Climate (Monsoon), Natural Vegetation & Soils; Mineral and Power Resources (coal, iron, petroleum, nuclear/solar); Location and distribution of Agricultural and Industrial activities; Important Sea Ports and main sea, land, and air routes of India; Main items of Imports and Exports of India."
            }
          ]
        }
      ]
    },
    {
      "slug": "current-affairs",
      "name": "Current Events",
      "tag": "GAT Part B - 40 marks - 10 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "National & International Affairs",
              "text": "Important recent happenings in India and across the world (last 6–12 months), bilateral & multilateral summits (G20, BRICS, SCO, UN, COP climate summits)."
            },
            {
              "title": "Defence & Security",
              "text": "Joint military exercises & locations, defence deals, indigenous defence platforms (DRDO/ISRO missions, missiles, warships, aircraft), armed forces appointments."
            },
            {
              "title": "Personalities, Culture, Sports & Awards",
              "text": "Prominent Indian and international personalities (including cultural activities & sports), National/International Awards (Padma, Gallantry, Nobel, Booker, Oscars), Major Sports Tournaments, Government Schemes, Important Days & Themes, Books & Authors, Infrastructure landmarks (tunnels, bridges)."
            }
          ]
        }
      ]
    }
  ],
  "cds": [
    {
      "slug": "english",
      "name": "English",
      "tag": "Paper 1 - 100 marks - 120 questions - 2 hours",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Grammar & Usage",
              "text": "Parts of speech (Nouns, Pronouns, Adjectives, Adverbs, Prepositions, Conjunctions, Determiners), Tenses, Subject-Verb Agreement, Conditionals, Active & Passive Voice, Direct & Indirect Speech."
            },
            {
              "title": "Spotting Errors & Sentence Improvement",
              "text": "Identifying grammatical/structural errors in segmented sentences and selecting optimal corrections."
            },
            {
              "title": "Vocabulary",
              "text": "Synonyms, Antonyms, Idioms & Phrases, Phrasal Verbs, One-Word Substitution, Word Usage (homonyms/confusables)."
            },
            {
              "title": "Reading Comprehension",
              "text": "Unseen passages testing main idea, factual accuracy, inference, and author’s tone."
            },
            {
              "title": "Cloze Test & Fill in the Blanks",
              "text": "Selecting contextually and grammatically accurate words/prepositions in passages and sentences."
            },
            {
              "title": "Sentence Sequencing (PQRS & S1–S6)",
              "text": "Ordering of words in a sentence and ordering of sentences in a paragraph."
            }
          ]
        }
      ]
    },
    {
      "slug": "general-science",
      "name": "General Science",
      "tag": "Paper 2 - General Knowledge - 2 hours",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Physics",
              "text": "Units & measurements, Motion & Newton’s laws, Work, Energy & Power, Gravitation, Properties of matter (pressure, buoyancy, Archimedes’ principle), Heat & thermodynamics, Sound waves, Light & optics (mirrors, lenses, TIR, human eye), Electricity & magnetism, Everyday scientific instruments."
            },
            {
              "title": "Chemistry",
              "text": "Physical & chemical changes, Elements, mixtures & compounds, Atomic structure, Periodic table, Acids, bases & salts, Metals & non-metals, Carbon & its allotropes, Oxidation & reduction, Everyday chemistry (polymers, glass, cement, fertilizers, soaps)."
            },
            {
              "title": "Biology",
              "text": "Cell structure & organelles, Plant & animal tissues, Human organ systems (digestive, respiratory, circulatory, nervous, excretory, endocrine), Nutrition, vitamins & deficiency diseases, Communicable diseases (bacterial, viral, protozoan) & vaccines, Plant physiology & reproduction, Ecology & environment."
            }
          ]
        }
      ]
    },
    {
      "slug": "history",
      "name": "Indian History",
      "tag": "Paper 2 - General Knowledge",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Indian History",
              "text": "Indus Valley Civilisation, Vedic Age, Buddhism & Jainism, Mauryan & Gupta Empires, Delhi Sultanate, Mughal Empire, Bhakti & Sufi Movements, Marathas, Advent of Europeans, Revolt of 1857, Socio-religious reforms, Indian Freedom Struggle (1885–1947), Art, Architecture & Culture."
            }
          ]
        }
      ]
    },
    {
      "slug": "polity-economy",
      "name": "Polity and Economy",
      "tag": "Paper 2 - General Knowledge",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Indian Polity & Constitution",
              "text": "Making of Constitution, Preamble, Schedules & Parts, Fundamental Rights & Duties, DPSP, President, PM & Parliament, Judiciary (SC & HC), Federalism, Constitutional Bodies (EC, CAG, UPSC), Panchayati Raj (73rd/74th Amendments), Emergency Provisions."
            },
            {
              "title": "Indian Economy",
              "text": "National Income (GDP/GNP), Five-Year Plans & NITI Aayog, Monetary Policy (RBI, Repo/Reverse Repo), Fiscal Policy & Union Budget, Banking & Financial Markets, Poverty, Unemployment & Government Schemes, WTO/IMF/World Bank."
            }
          ]
        }
      ]
    },
    {
      "slug": "geography",
      "name": "Geography",
      "tag": "Paper 2 - General Knowledge",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Geography",
              "text": "Universe & Solar System, Earth’s motions, Latitudes/Longitudes/Time, Interior of Earth, Rocks, Earthquakes & Volcanoes, Atmosphere, Winds & Cyclones, Ocean Currents & Tides, World Climatic Regions; Indian Physiography, Rivers & Drainage, Monsoon, Soils & Vegetation, Minerals, Agriculture, Transport & National Parks."
            }
          ]
        }
      ]
    },
    {
      "slug": "current-affairs",
      "name": "Current Affairs and Defence Awareness",
      "tag": "Paper 2 - General Knowledge",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Current affairs and defence awareness",
              "text": "National & International events (last 6–8 months), Joint Military Exercises, Defence Deals & DRDO/ISRO Missions, Armed Forces Commands & Ranks, Sports, Awards & Honours, Summits & Conferences, Books & Authors."
            }
          ]
        }
      ]
    },
    {
      "slug": "mathematics",
      "name": "Elementary Mathematics",
      "tag": "Paper 3 - 100 marks - 100 questions - not for OTA",
      "units": [
        {
          "title": "Arithmetic and Elementary Number Theory",
          "note": null,
          "groups": [
            {
              "title": "Number System & Operations",
              "text": "Natural numbers, integers, rational & real numbers; fundamental operations, square roots, decimal fractions, recurring decimals."
            },
            {
              "title": "Commercial & Applied Arithmetic",
              "text": "Unitary method, Time & Distance (trains, boats & streams), Time & Work (pipes & cisterns), Percentages, Simple & Compound Interest, Profit & Loss, Ratio & Proportion, Variation, Mixtures & Alligation, Averages."
            },
            {
              "title": "Elementary Number Theory",
              "text": "Division algorithm, prime & composite numbers, tests of divisibility by 2, 3, 4, 5, 9, and 11, multiples & factors, Factorisation Theorem, HCF & LCM, Euclidean algorithm, unit digit & remainder theorems, Logarithms to base 10, laws of logarithms, and use of log tables."
            }
          ]
        },
        {
          "title": "Algebra",
          "note": null,
          "groups": [
            {
              "title": "Polynomials & Equations",
              "text": "Basic operations, simple factors, Remainder & Factor Theorems, HCF & LCM of polynomials, theory of polynomials, relation between roots & coefficients of quadratic equations (real roots only)."
            },
            {
              "title": "Linear Equations & Inequalities",
              "text": "Simultaneous linear equations in two unknowns (analytical & graphical solutions), simultaneous linear inequations in two variables, word problems leading to linear/quadratic equations."
            },
            {
              "title": "Sets & Identities",
              "text": "Set notation and set language, rational expressions, conditional identities, laws of indices."
            }
          ]
        },
        {
          "title": "Trigonometry",
          "note": null,
          "groups": [
            {
              "title": "Ratios & Identities",
              "text": "sin x, cos x, tan x for 0° ≤ x ≤ 90°; standard values at 0°, 30°, 45°, 60°, 90°; simple trigonometric identities; use of trigonometric tables; maxima/minima of trig expressions."
            },
            {
              "title": "Heights & Distances",
              "text": "Simple cases of angles of elevation and depression."
            }
          ]
        },
        {
          "title": "Geometry",
          "note": null,
          "groups": [
            {
              "title": "Lines, Angles & Polygons",
              "text": "Plane & plane figures, properties of angles at a point, parallel lines & transversals, properties of sides, angles & diagonals of rectangle, parallelogram, rhombus, square, and trapezium; cyclic quadrilaterals."
            },
            {
              "title": "Triangles",
              "text": "Sides & angles of a triangle, triangle inequalities, congruence & similarity theorems, Pythagoras theorem, concurrence of medians (centroid), altitudes (orthocentre), angle bisectors (incentre), perpendicular bisectors (circumcentre)."
            },
            {
              "title": "Circles & Loci",
              "text": "Circles and their properties (chords, arcs, central/inscribed angles, alternate segment theorem), tangents and normals, common tangents, loci."
            }
          ]
        },
        {
          "title": "Mensuration and Statistics",
          "note": null,
          "groups": [
            {
              "title": "2D Mensuration",
              "text": "Areas of parallelograms, squares, rectangles, triangles, trapeziums, and circles/sectors/segments; areas of figures split into standard shapes (Field Book)."
            },
            {
              "title": "3D Mensuration",
              "text": "Lateral/curved surface area, total surface area, and volume of cuboids, cubes, right circular cylinders, right circular cones, spheres, hemispheres, and frustums."
            },
            {
              "title": "Statistics",
              "text": "Collection and tabulation of statistical data, graphical representation (frequency polygons, bar charts, histograms, pie charts), measures of central tendency (Mean, Median, Mode)."
            }
          ]
        }
      ]
    }
  ],
  "afcat": [
    {
      "slug": "english",
      "name": "Verbal Ability in English",
      "tag": "Section 1 - 25 to 30 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Reading Comprehension",
              "text": "Unseen passages testing main theme, inference, factual details, and contextual word meaning."
            },
            {
              "title": "Error Detection & Sentence Completion",
              "text": "Spotting grammatical errors (tenses, subject-verb agreement, prepositions, articles, pronouns, modifiers) and grammar-based fill-in-the-blanks / Cloze test."
            },
            {
              "title": "Vocabulary",
              "text": "Synonyms, Antonyms, One-Word Substitution, Idioms & Phrases, Phrasal Verbs, Analogy-based vocabulary."
            },
            {
              "title": "Sentence Rearrangement",
              "text": "Ordering of jumbled words/phrases into coherent sentences."
            }
          ]
        }
      ]
    },
    {
      "slug": "history",
      "name": "History and Culture",
      "tag": "Section 2 - General Awareness - 25 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "History & Culture",
              "text": "Ancient India (IVC, Vedic, Buddhism/Jainism, Mauryas/Guptas), Medieval India (Sultanate, Mughals, Bhakti/Sufi), Modern India & Freedom Struggle (1857–1947), Classical Dances, Music, Festivals, UNESCO Heritage Sites."
            }
          ]
        }
      ]
    },
    {
      "slug": "geography",
      "name": "Geography and Environment",
      "tag": "Section 2 - General Awareness - 25 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Geography & Environment",
              "text": "Solar System, Earth’s structure, Atmosphere & Winds, Ocean Currents, Indian Rivers, Passes, Mountains, Climate, National Parks & Biosphere Reserves."
            }
          ]
        }
      ]
    },
    {
      "slug": "polity-economy",
      "name": "Civics, Polity and Economy",
      "tag": "Section 2 - General Awareness - 25 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Civics / Indian Polity & Economy",
              "text": "Constitution, Fundamental Rights & Duties, Parliament, President, Judiciary, Constitutional Bodies; Basic Economic terms, Banking, Five-Year Plans, Budget."
            }
          ]
        }
      ]
    },
    {
      "slug": "general-science",
      "name": "Science and Technology",
      "tag": "Section 2 - General Awareness - 25 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Science & Technology",
              "text": "Everyday Physics, Chemistry & Biology facts, Vitamins & Diseases, Space & ISRO Missions, DRDO Missiles & Defence Technology."
            }
          ]
        }
      ]
    },
    {
      "slug": "current-affairs",
      "name": "Static GK and Current Affairs",
      "tag": "Section 2 - General Awareness - 25 questions",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Static GK & Current Affairs",
              "text": "Sports (trophies, terms, venues, winners), National & International Awards, Books & Authors, Capitals & Currencies, International Organizations (UN, NATO, BRICS, SCO), Joint Military Exercises, IAF Aircraft & Commands."
            }
          ]
        }
      ]
    },
    {
      "slug": "mathematics",
      "name": "Numerical Ability",
      "tag": "Section 3 - 20 to 25 questions - Matriculation level",
      "units": [
        {
          "title": null,
          "note": null,
          "groups": [
            {
              "title": "Number System & Simplification",
              "text": "Types of numbers, divisibility rules, HCF & LCM, unit digit, remainders, Decimal Fractions, BODMAS simplification, surds & indices."
            },
            {
              "title": "Percentage, Profit & Loss, Interest",
              "text": "Percentage increase/decrease, successive percentage, Profit, Loss & Discount, dishonest dealer, Simple Interest & Compound Interest (installments, difference between CI & SI)."
            },
            {
              "title": "Ratio, Average & Mixtures",
              "text": "Ratio & Proportion, partnership, simple & weighted Averages, Mixtures & Alligation."
            },
            {
              "title": "Time, Work & Speed",
              "text": "Time & Work, wages, Pipes & Cisterns; Time, Speed & Distance, average speed, relative speed, Trains, Boats & Streams, Races & Circular Tracks."
            },
            {
              "title": "Mensuration, Probability & Clocks",
              "text": "Area & Perimeter of 2D figures (triangles, rectangles, circles, paths), surface area & volume basics, Elementary Probability, Clocks (angle between hands, faulty clocks), Number Series."
            }
          ]
        }
      ]
    },
    {
      "slug": "reasoning",
      "name": "Reasoning and Military Aptitude",
      "tag": "Section 4 - 25 to 30 questions",
      "units": [
        {
          "title": "Verbal Reasoning",
          "note": null,
          "groups": [
            {
              "title": "Analogy & Classification",
              "text": "Semantic, letter, and number analogies; Odd One Out (word/number/letter classification)."
            },
            {
              "title": "Series & Coding-Decoding",
              "text": "Number series, alphabet series, alphanumeric series; letter shifting, symbol/number coding."
            },
            {
              "title": "Logical & Relational",
              "text": "Blood Relations (tree & coded), Direction Sense Test, Logical Venn Diagrams (2- & 3-circle), Order & Ranking, Mathematical Operations (BODMAS symbol substitution), Arithmetical Reasoning, Alphabet & Word Formation tests."
            }
          ]
        },
        {
          "title": "Non-Verbal Reasoning and Spatial Ability",
          "note": null,
          "groups": [
            {
              "title": "Visual Pattern Recognition",
              "text": "Figure Series Completion, Figure Analogy, Figure Classification (Odd Figure Out), Pattern Completion (missing quadrant)."
            },
            {
              "title": "Spatial Transformations",
              "text": "Mirror Images & Water Images, Paper Folding & Paper Cutting, Embedded (Hidden) Figures, Dot Situation Analysis (identifying regions with identical dot conditions)."
            },
            {
              "title": "3D Spatial Visualization",
              "text": "Cubes & Dice (opposite faces, painted cube cutting), Counting of Figures (triangles, squares), 3D rotation & spatial orientation."
            }
          ]
        }
      ]
    }
  ]
};

/** Number of topic groups in a subject. */
export function topicCount(subject: SyllabusSubject): number {
  return subject.units.reduce((n, u) => n + u.groups.length, 0);
}
