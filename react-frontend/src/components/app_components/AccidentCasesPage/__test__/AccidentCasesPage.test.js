import React from "react";
import { render, screen } from "@testing-library/react";

import AccidentCasesPage from "../AccidentCasesPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders accidentCases page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <AccidentCasesPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("accidentCases-datatable")).toBeInTheDocument();
  expect(screen.getByRole("accidentCases-add-button")).toBeInTheDocument();
});
