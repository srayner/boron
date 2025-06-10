describe("Tests Milesone CRUD", () => {
  beforeEach(() => {
    cy.login();
  });

  beforeEach(() => {
    cy.setCookie("sidebar_state", "true");
    cy.visit("/dashboard");
  });

  it("adds a milestone", () => {
    const data = { name: "New Milestone" };

    // Navigate to project 'Milestones' tab.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Milestone").click();

    // Click 'Create Milestone'
    cy.contains("a", "Create Milestone").click();
    cy.url().should("match", /\/projects\/[a-z0-9]+\/milestones\/add$/);

    // Enter the details and submit form.
    cy.get('input[name="name"]').clear().type(data.name);
    cy.get('button[type="submit"]').contains("Create").click();

    // Check we redirected to project detail page.
    cy.url().should("match", /\/projects\/[a-z0-9]+\?tab=milestones$/);

    // Check details of the project we added.
    cy.get("table")
      .should("be.visible")
      .contains("td", data.name)
      .should("exist");
  });

  it("edits a milestone", () => {
    // Navigate to milestone detail page.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Milestone").click();
    cy.contains("a", "Manufacturers CRUD").click();
    cy.url().should("match", /\/milestones\/[a-z0-9]+$/);

    // Click Edit button
    cy.contains("button", "Edit").click();
    cy.url().should(
      "match",
      /\/projects\/[a-z0-9]+\/milestones\/[a-z0-9]+\/edit\?returnTo=milestone$/
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

    // Verify changes
  });

  it("deletes a milestone", () => {
    // Navigate to milestone detail page.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Milestone").click();
    cy.contains("a", "Second Milestone").click();
    cy.url().should("match", /\/milestones\/[a-z0-9]+$/);

    // Click Delete button
    cy.contains("button", "Delete").click();

    // Confirm by clicking 'Yes' button
    cy.contains("button", "Yes").click();
  });
});
