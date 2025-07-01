import React from "react";
import { render, screen } from "@testing-library/react";

import CompanyPositionMappingsPage from "../CompanyPositionMappingsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders companyPositionMappings page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CompanyPositionMappingsPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("companyPositionMappings-datatable"),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("companyPositionMappings-add-button"),
  ).toBeInTheDocument();
});
