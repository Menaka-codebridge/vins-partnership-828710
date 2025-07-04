import React from "react";
import { render, screen } from "@testing-library/react";

import TokenUsageEditDialogComponent from "../TokenUsageEditDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders tokenUsage edit dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <TokenUsageEditDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("tokenUsage-edit-dialog-component"),
  ).toBeInTheDocument();
});
