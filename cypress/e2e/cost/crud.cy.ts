describe("Tests Costs CRUD", () => {
  beforeEach(() => {
    cy.login();
    cy.setCookie("sidebar_state", "true");
    cy.visit("/dashboard");
  });

  it("adds a cost", () => {
    const data = { name: "New Cost", amount: "5.50" };

    // Navigate to project 'Costs' tab.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Costs").click();

    // Click 'Create Cost'
    cy.contains("a", "Create Cost").click();
    cy.url().should("match", /\/projects\/[a-z0-9]+\/costs\/add$/);

    // Enter the details and submit form.
    cy.get('input[name="name"]').clear().type(data.name);
    cy.get('input[name="amount"]').clear().type(data.amount);
    cy.get('button[type="submit"]').contains("Create").click();

    // Check we redirected to project detail page.
    cy.url().should("match", /\/projects\/[a-z0-9]+\?tab=costs$/);

    // Check details of the project we added.
    cy.get("table")
      .should("be.visible")
      .contains("td", data.name)
      .should("exist");
  });

  it("edits a cost", () => {
    const newData = { name: "Updated Cost", amount: "6.59" };

    // Navigate to cost detail page.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Costs").click();
    cy.contains("a", "New Cost").click();
    cy.url().should("match", /\/costs\/[a-z0-9]+$/);

    // Click Edit button
    cy.contains("button", "Edit").click();
    cy.url().should(
      "match",
      /\/projects\/[a-z0-9]+\/costs\/[a-z0-9]+\/edit\?returnTo=cost$/
    );

    // Enter the details and submit form.
    cy.get('input[name="name"]').clear().type(newData.name);
    cy.get('input[name="amount"]').clear().type(newData.amount);
    cy.get('button[type="submit"]').contains("Save").click();

    // Check new details exist
    cy.url().should("match", /\/costs\/[a-z0-9]+$/);
    cy.contains("h1", newData.name);
    cy.get("dd.text-foreground").contains(newData.amount).should("exist");
  });

  it("deletes a cost", () => {
    // Navigate to cost detail page.
    cy.contains("a", "Argon - Inventory Management").click();
    cy.get('[role="tab"]').contains("Costs").click();
    cy.contains("a", "Updated Cost").click();
    cy.url().should("match", /\/costs\/[a-z0-9]+$/);

    // Click Delete button
    cy.contains("button", "Delete").click();

    // Confirm by clicking 'Yes' button
    cy.contains("button", "Yes").click();
  });
});
