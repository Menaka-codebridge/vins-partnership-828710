import React from "react";
import { render, screen } from "@testing-library/react";

import CaseDocumentsEditDialogComponent from "../CaseDocumentsEditDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders caseDocuments edit dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CaseDocumentsEditDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("caseDocuments-edit-dialog-component"),
  ).toBeInTheDocument();
});
