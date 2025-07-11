import React from "react";
import { render, screen } from "@testing-library/react";

import PromptQueuesEditDialogComponent from "../PromptQueuesEditDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders promptQueues edit dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <PromptQueuesEditDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("promptQueues-edit-dialog-component"),
  ).toBeInTheDocument();
});
