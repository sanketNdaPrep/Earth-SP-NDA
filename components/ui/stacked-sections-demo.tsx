import { StackedSection, StackedSections } from "@/components/ui/stacked-sections";

export function StackedSectionsDemo() {
  return (
    <StackedSections>
      <StackedSection heading="Study the syllabus first">
        <p className="max-w-xl text-pretty text-lg text-steel-300">
          Know what NDA, CDS and AFCAT actually ask before you open a single book.
        </p>
      </StackedSection>
      <StackedSection heading="Practise with mock tests" tone="light" roundedTop>
        <p className="max-w-xl text-pretty text-lg text-navy-800">
          Timed papers show where your marks are leaking while there is still time to fix it.
        </p>
      </StackedSection>
      <StackedSection heading="Review every mistake" tone="raised" roundedTop>
        <p className="max-w-xl text-pretty text-lg text-steel-300">
          A wrong answer you understand is worth more than a right answer you guessed.
        </p>
      </StackedSection>
    </StackedSections>
  );
}