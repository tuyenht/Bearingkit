# bk-research · A tool choice gets a sourced recommendation, each claim labelled, with the evidence against it

**Prompt** (en)
> We need request validation in this app. Should we use Zod or Valibot? Look at bundle size, maintenance and how each works with our TypeScript version, and give me a recommendation I can trust.

**Setup**
A TypeScript web application whose stack profile pins TypeScript and the framework to exact majors. Neither library is installed. The repository has no earlier note on validation. Web search and page reads are available.

**Expected**
1. The stack profile is read first and the pinned TypeScript major is named in the question as sharpened, with the decision it serves.
2. A query plan comes before any search: sub-questions for bundle size, maintenance and TypeScript support, each with its claim type and where to look.
3. Facts each library defines (supported TypeScript versions, API shape) are cited from that library's own documentation or release notes; size and maintenance claims rest on independent sources (a bundle-size service, the repository's release history), never on either vendor's comparison page alone.
4. Every claim carries its link, the version or date it describes and a confidence; numbers sit beside the page they came from.
5. The answer takes a position for this project and runs the adoption checklist of `references/answer.md`, with the evidence against the recommended option stated.
6. Nothing is installed; adopting the library is handed to bk-spec as the next step.

**Fails if**
- A size, a download count or a release date appears with no page opened for it.
- A vendor's own comparison page is the only source for a claim about which library is better.
- A package is installed, or a file in the project is changed.
