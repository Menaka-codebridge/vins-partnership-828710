import React from "react";
import { render, screen } from "@testing-library/react";

import TokenUsageCreateDialogComponent from "../TokenUsageCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders tokenUsage create dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <TokenUsageCreateDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("tokenUsage-create-dialog-component"),
  ).toBeInTheDocument();
});
