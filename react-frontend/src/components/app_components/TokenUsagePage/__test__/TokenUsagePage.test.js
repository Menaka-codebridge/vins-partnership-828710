import React from "react";
import { render, screen } from "@testing-library/react";

import TokenUsagePage from "../TokenUsagePage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders tokenUsage page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <TokenUsagePage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("tokenUsage-datatable")).toBeInTheDocument();
  expect(screen.getByRole("tokenUsage-add-button")).toBeInTheDocument();
});
