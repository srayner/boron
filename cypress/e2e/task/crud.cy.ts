describe("Tests Project CRUD", () => {
  beforeEach(() => {
    cy.login();
    cy.setCookie("sidebar_state", "true");
    cy.visit("/dashboard");
  });

  it("adds a task", () => {
    const data = { name: "New Task" };

    // Navigate to project 'Tasks' tab.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Tasks").click();

    // Click 'Create Tasks'
    cy.contains("a", "Create Task").click();
    cy.url().should("match", /\/projects\/[a-z0-9]+\/tasks\/add$/);

    // Enter the details and submit form.
    cy.get('input[name="name"]').clear().type(data.name);
    cy.get('button[type="submit"]').contains("Create").click();

    // Check we redirected to project detail page.
    cy.url().should("match", /\/projects\/[a-z0-9]+\?tab=tasks$/);

    // Check details of the project we added.
    cy.get("table")
      .should("be.visible")
      .contains("td", data.name)
      .should("exist");
  });

  it("edits a task", () => {
    // Navigate to task detail page.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Tasks").click();
    cy.contains("a", "Create Manufacturer").click();
    cy.url().should("match", /\/tasks\/[a-z0-9]+$/);

    // Click Edit button
    cy.contains("button", "Edit").click();
    cy.url().should(
      "match",
      /\/projects\/[a-z0-9]+\/tasks\/[a-z0-9]+\/edit\?returnTo=task$/
    );

    // Enter updated details
    cy.contains("label", "Status")
      .parent()
      .find('button[role="combobox"]')
      .click();
    cy.get('[role="listbox"]')
      .should("be.visible")
      .contains('[role="option"]', "Completed")
      .click();

    // Click submit
    cy.contains("button", "Save").click();
  });

  it("deletes a task", () => {
    // Navigate to task detail page.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Tasks").click();
    cy.contains("a", "Task to delete").click();
    cy.url().should("match", /\/tasks\/[a-z0-9]+$/);
  });
});
