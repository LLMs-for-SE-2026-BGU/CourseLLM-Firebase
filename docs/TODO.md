A feature must include:

- The PRD for the feature (use story, data model, acceptance criteria for the feature, dependency on other features and assumptions)

- Documentation for the design and implementation

- Implementation

- Test (a way to execute the feature in isolation end-to-end, using mock data if needed)

- It must be submitted as a reviewable Pull Request on the main branch of the Github Repo.

To verify that the PR is reviewable, make sure the PR can be reviewed in Github using the "Review in codespace" feature.



We adopt a modular architecture approach - where features are implemented in the form of:
- microservices (independent services managing a coherent set of data resources)

- modular components of the frontend (based on React).

