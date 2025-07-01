import React from "react";
import { render, screen } from "@testing-library/react";

import HistoriesPage from "../HistoriesPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders histories page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <HistoriesPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("histories-datatable")).toBeInTheDocument();
  expect(screen.getByRole("histories-add-button")).toBeInTheDocument();
});
