import React from "react";
import { render, screen } from "@testing-library/react";

import PromptQueuesCreateDialogComponent from "../PromptQueuesCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders promptQueues create dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <PromptQueuesCreateDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("promptQueues-create-dialog-component"),
  ).toBeInTheDocument();
});
