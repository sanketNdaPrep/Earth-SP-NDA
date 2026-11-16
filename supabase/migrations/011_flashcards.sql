-- Flashcards: decks and cards, with four starter decks.
-- Run once in Supabase: SQL Editor, New query, paste, Run.
-- Everyone can read. Only approved admins can add, edit or delete (Admin Suite > Flashcards).

create table if not exists public.flashcard_decks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 2 and 80),
  category     text not null default 'General',
  description  text not null default '' check (char_length(description) <= 300),
  created_by   uuid default auth.uid() references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);
create unique index if not exists flashcard_decks_title_key on public.flashcard_decks (lower(title));

create table if not exists public.flashcards (
  id          uuid primary key default gen_random_uuid(),
  deck_id     uuid not null references public.flashcard_decks (id) on delete cascade,
  front       text not null check (char_length(front) between 1 and 500),
  back        text not null check (char_length(back) between 1 and 1000),
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists flashcards_deck_idx on public.flashcards (deck_id, position);

alter table public.flashcard_decks enable row level security;
alter table public.flashcards      enable row level security;

drop policy if exists flashcard_decks_read on public.flashcard_decks;
create policy flashcard_decks_read on public.flashcard_decks for select to anon, authenticated using (true);
drop policy if exists flashcard_decks_admin_write on public.flashcard_decks;
create policy flashcard_decks_admin_write on public.flashcard_decks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists flashcards_read on public.flashcards;
create policy flashcards_read on public.flashcards for select to anon, authenticated using (true);
drop policy if exists flashcards_admin_write on public.flashcards;
create policy flashcards_admin_write on public.flashcards for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Let the audit log record flashcard decks -------------------------------------
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.admin_logs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%entity_type%'
  loop
    execute format('alter table public.admin_logs drop constraint %I', c.conname);
  end loop;
  alter table public.admin_logs
    add constraint admin_logs_entity_type_check
    check (entity_type in ('subject', 'question', 'resource', 'mock_test', 'flashcard_deck'));
end $$;

-- Starter decks (skipped if a deck with the same title already exists) ---------
insert into public.flashcard_decks (title, category, description)
select v.title, v.category, v.description
from (values
  ('Maths formulas: trigonometry, algebra and calculus', 'Maths', 'The formulas that come up again and again in NDA Mathematics.'),
  ('Physics: laws, units and constants', 'Physics', 'Core laws, equations and values for the NDA GAT physics section.'),
  ('Chemistry: symbols, formulas and basics', 'Chemistry', 'Quick recall of common chemical facts for NDA and CDS.'),
  ('Defence awareness: academies and key dates', 'General Awareness', 'Where the academies are and the days every defence aspirant should know.')
) as v(title, category, description)
where not exists (select 1 from public.flashcard_decks d where lower(d.title) = lower(v.title));

insert into public.flashcards (deck_id, front, back, position)
select d.id, c.front, c.back, c.pos
from (values
  ('Maths formulas: trigonometry, algebra and calculus', 1, 'sin²θ + cos²θ = ?', '1'),
  ('Maths formulas: trigonometry, algebra and calculus', 2, '1 + tan²θ = ?', 'sec²θ'),
  ('Maths formulas: trigonometry, algebra and calculus', 3, '1 + cot²θ = ?', 'cosec²θ'),
  ('Maths formulas: trigonometry, algebra and calculus', 4, 'sin 2θ = ?', '2 sinθ cosθ'),
  ('Maths formulas: trigonometry, algebra and calculus', 5, 'cos 2θ = ? (three forms)', 'cos²θ - sin²θ = 2cos²θ - 1 = 1 - 2sin²θ'),
  ('Maths formulas: trigonometry, algebra and calculus', 6, 'Roots of ax² + bx + c = 0', 'x = (-b ± √(b² - 4ac)) / 2a'),
  ('Maths formulas: trigonometry, algebra and calculus', 7, 'Sum and product of the roots of ax² + bx + c = 0', 'Sum = -b/a, product = c/a'),
  ('Maths formulas: trigonometry, algebra and calculus', 8, 'nth term of an AP', 'a + (n - 1)d'),
  ('Maths formulas: trigonometry, algebra and calculus', 9, 'Sum of n terms of an AP', '(n/2) × [2a + (n - 1)d]'),
  ('Maths formulas: trigonometry, algebra and calculus', 10, 'nth term of a GP', 'a × r^(n-1)'),
  ('Maths formulas: trigonometry, algebra and calculus', 11, 'Sum of an infinite GP (|r| < 1)', 'a / (1 - r)'),
  ('Maths formulas: trigonometry, algebra and calculus', 12, 'Distance between (x1, y1) and (x2, y2)', '√((x2 - x1)² + (y2 - y1)²)'),
  ('Maths formulas: trigonometry, algebra and calculus', 13, 'nCr', 'n! / (r! × (n - r)!)'),
  ('Maths formulas: trigonometry, algebra and calculus', 14, 'd/dx of x^n', 'n × x^(n-1)'),
  ('Maths formulas: trigonometry, algebra and calculus', 15, 'Integral of x^n dx (n ≠ -1)', 'x^(n+1) / (n + 1) + C'),

  ('Physics: laws, units and constants', 1, 'Newton''s second law', 'F = ma'),
  ('Physics: laws, units and constants', 2, 'Three equations of motion (constant acceleration)', 'v = u + at;  s = ut + ½at²;  v² = u² + 2as'),
  ('Physics: laws, units and constants', 3, 'Kinetic energy', '½mv²'),
  ('Physics: laws, units and constants', 4, 'Work done by a force F over distance d at angle θ', 'W = F d cosθ'),
  ('Physics: laws, units and constants', 5, 'Momentum', 'p = mv'),
  ('Physics: laws, units and constants', 6, 'Ohm''s law', 'V = IR'),
  ('Physics: laws, units and constants', 7, 'Electrical power', 'P = VI = I²R = V²/R'),
  ('Physics: laws, units and constants', 8, 'Snell''s law', 'n1 sinθ1 = n2 sinθ2'),
  ('Physics: laws, units and constants', 9, 'Lens formula', '1/v - 1/u = 1/f'),
  ('Physics: laws, units and constants', 10, 'SI unit of force, pressure and energy', 'Newton (N), pascal (Pa), joule (J)'),
  ('Physics: laws, units and constants', 11, 'Acceleration due to gravity on Earth (approx.)', '9.8 m/s²'),
  ('Physics: laws, units and constants', 12, 'Speed of light in vacuum (approx.)', '3 × 10^8 m/s'),
  ('Physics: laws, units and constants', 13, 'Escape velocity from Earth (approx.)', '11.2 km/s'),

  ('Chemistry: symbols, formulas and basics', 1, 'Chemical formula of common salt', 'NaCl (sodium chloride)'),
  ('Chemistry: symbols, formulas and basics', 2, 'Chemical formula of baking soda', 'NaHCO3 (sodium bicarbonate)'),
  ('Chemistry: symbols, formulas and basics', 3, 'Chemical formula of water and carbon dioxide', 'H2O and CO2'),
  ('Chemistry: symbols, formulas and basics', 4, 'Symbol for sodium, potassium and iron', 'Na, K, Fe'),
  ('Chemistry: symbols, formulas and basics', 5, 'pH of a neutral solution at 25 °C', '7'),
  ('Chemistry: symbols, formulas and basics', 6, 'Acids have pH ___ 7, bases have pH ___ 7', 'Acids: below 7. Bases: above 7.'),
  ('Chemistry: symbols, formulas and basics', 7, 'Atomic number of hydrogen, carbon and oxygen', '1, 6 and 8'),
  ('Chemistry: symbols, formulas and basics', 8, 'Lightest noble gas', 'Helium (He)'),
  ('Chemistry: symbols, formulas and basics', 9, 'Gas produced when a metal reacts with a dilute acid', 'Hydrogen'),

  ('Defence awareness: academies and key dates', 1, 'Where is the National Defence Academy (NDA)?', 'Khadakwasla, Pune'),
  ('Defence awareness: academies and key dates', 2, 'Where is the Indian Military Academy (IMA)?', 'Dehradun'),
  ('Defence awareness: academies and key dates', 3, 'Where is the Indian Naval Academy?', 'Ezhimala, Kerala'),
  ('Defence awareness: academies and key dates', 4, 'Where is the Air Force Academy?', 'Dundigal, Hyderabad'),
  ('Defence awareness: academies and key dates', 5, 'Where is the Officers Training Academy (OTA)?', 'Chennai'),
  ('Defence awareness: academies and key dates', 6, 'Who is the Supreme Commander of the Indian Armed Forces?', 'The President of India'),
  ('Defence awareness: academies and key dates', 7, 'Army Day, Navy Day and Air Force Day', '15 January, 4 December and 8 October'),
  ('Defence awareness: academies and key dates', 8, 'Highest gallantry award in wartime', 'Param Vir Chakra'),
  ('Defence awareness: academies and key dates', 9, 'Year of the Kargil War', '1999 (Operation Vijay)')
) as c(deck, pos, front, back)
join public.flashcard_decks d on lower(d.title) = lower(c.deck)
where not exists (select 1 from public.flashcards f where f.deck_id = d.id);
