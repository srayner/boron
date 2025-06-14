describe("Tests Project CRUD", () => {
  beforeEach(() => {
    cy.login();
    cy.setCookie("sidebar_state", "true");
    cy.visit("/dashboard");
    navigateToProjectTasksTab();
  });

  it("adds a task not completed", () => {
    addTask("New not complete task", false);
    assertNoCompletedAt();
  });

  it("adds a task completed", () => {
    addTask("New complete task", true);
    viewTaskDetail("New complete task");
    assertCompletedToday();
  });

  it("edits a task transitioning to completed", () => {
    viewTaskDetail("Task to be completed");
    editTask("Status", "Completed");
    assertCompletedToday();
  });

  it("edits a task transitioning from completed", () => {
    viewTaskDetail("Task to be un-completed");
    editTask("Status", "In Progress");
    assertNoCompletedAt();
  });

  it("edits a not complete task without changing status", () => {
    viewTaskDetail("In Progress Task");
    editTask("Priority", "Low");
    assertNoCompletedAt();
  });

  it("edits a complete task not changing status", () => {
    viewTaskDetail("Completed Task");
    const previous = readCompletedAtText();
    editTask("Priority", "Low");
    assertCompletedAtUnchanged(previous);
  });
});

function navigateToProjectTasksTab() {
  cy.contains("a", "Argon - Inventory Management").click();
  cy.get('[role="tab"]').contains("Tasks").click();
}

function addTask(name: string, completed: boolean) {
  // Click 'Create Tasks'
  cy.contains("a", "Create Task").click();
  cy.url().should("match", /\/projects\/[a-z0-9]+\/tasks\/add$/);

  // Enter the details
  cy.get('input[name="name"]').clear().type(name);
  if (completed) {
    cy.contains("label", "Status")
      .parent()
      .find('button[role="combobox"]')
      .click();
    cy.get('[role="listbox"]')
      .should("be.visible")
      .contains('[role="option"]', "Completed")
      .click();
  }

  // Submit form
  cy.get('button[type="submit"]').contains("Create").click();

  // Check we redirected to project detail page.
  cy.url().should("match", /\/projects\/[a-z0-9]+\?tab=tasks$/);
}

function viewTaskDetail(taskName: string) {
  cy.contains("a", taskName).click();
  cy.url().should("match", /\/tasks\/[a-z0-9]+$/);
}

function editTask(fieldLabel: string, newValue: string) {
  // Click Edit button
  cy.contains("button", "Edit").click();
  cy.url().should(
    "match",
    /\/projects\/[a-z0-9]+\/tasks\/[a-z0-9]+\/edit\?returnTo=task$/
  );

  // Make change
  cy.contains("label", fieldLabel)
    .parent()
    .find('button[role="combobox"]')
    .click();
  cy.get('[role="listbox"]')
    .should("be.visible")
    .contains('[role="option"]', newValue)
    .click();

  // Submit form
  cy.get('button[type="submit"]').click();

  // Assert redirected back to task detail page (adjust regex as needed)
  cy.url().should("match", /\/tasks\/[a-z0-9]+$/);
}

function readCompletedAtText(): Cypress.Chainable<string> {
  return cy
    .get("dt")
    .contains("Completed at")
    .next("dd")
    .invoke("text")
    .then((text) => text.trim());
}

function assertCompletedToday() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0"); // dd
  const month = now.toLocaleString("en-US", { month: "short" }); // mmm
  const year = now.getFullYear(); // YYYY
  const todayStr = `${day} ${month} ${year}`;

  cy.get("dt")
    .contains("Completed at")
    .next("dd")
    .should("exist")
    .invoke("text")
    .then((dateText) => {
      const datePart = dateText.trim().substring(0, 11); // grab first 11 chars: dd mmm YYYY
      expect(datePart).to.equal(todayStr);
    });
}

function assertNoCompletedAt() {
  cy.contains("dt", "Completed at").should("not.exist");
}

function assertCompletedAtUnchanged(previous: Cypress.Chainable<string>) {
  previous.then((prev) => readCompletedAtText().should("equal", prev));
}
