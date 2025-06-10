describe("Tests Project CRUD", () => {
  beforeEach(() => {
    cy.login();
    cy.setCookie("sidebar_state", "true");
    cy.visit("/dashboard");
  });

  it("adds a project", () => {
    const data = { name: "New Project" };

    // Navigate to 'Add' page.
    cy.get('a[href="/projects/add"]').should("be.visible").click();
    cy.url().should("include", "/projects/add");

    // Enter the details and submit form.
    cy.get('input[name="name"]').clear().type(data.name);
    cy.contains("button", "Submit").click();

    // Check we redirected to project detail page.
    cy.url().should("match", /\/projects\/[a-z0-9]+$/);

    // Check details of the project we added.
    cy.contains("h1", data.name);
  });

  it("edits a project", () => {
    const newType = "Web Application";

    cy.contains("a", "New Project").first().click();
    cy.contains("button", "Edit").click();

    cy.contains("label", "Type")
      .parent() // or .closest('div') depending on your HTML
      .find('button[role="combobox"]')
      .click();

    cy.get('[role="listbox"]')
      .should("be.visible")
      .contains('[role="option"]', newType)
      .click();

    cy.contains("button", "Submit").click();

    cy.get("dd.text-foreground").contains(newType).should("exist");
  });

  it("deletes a project", () => {
    cy.contains("a", "New Project").first().click();
    cy.contains("button", "Delete").click();
    cy.contains("button", "Yes").click();
  });
});
