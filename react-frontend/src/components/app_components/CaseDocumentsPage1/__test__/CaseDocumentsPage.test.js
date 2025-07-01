import React from "react";
import { render, screen } from "@testing-library/react";

import CaseDocumentsPage from "../CaseDocumentsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders caseDocuments page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CaseDocumentsPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("caseDocuments-datatable")).toBeInTheDocument();
  expect(screen.getByRole("caseDocuments-add-button")).toBeInTheDocument();
});
