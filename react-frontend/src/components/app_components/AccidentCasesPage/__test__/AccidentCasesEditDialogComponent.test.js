import React from "react";
import { render, screen } from "@testing-library/react";

import AccidentCasesEditDialogComponent from "../AccidentCasesEditDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders accidentCases edit dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <AccidentCasesEditDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("accidentCases-edit-dialog-component"),
  ).toBeInTheDocument();
});
