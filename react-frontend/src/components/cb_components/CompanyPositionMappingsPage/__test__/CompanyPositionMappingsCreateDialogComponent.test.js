import React from "react";
import { render, screen } from "@testing-library/react";

import CompanyPositionMappingsCreateDialogComponent from "../CompanyPositionMappingsCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders companyPositionMappings create dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CompanyPositionMappingsCreateDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("companyPositionMappings-create-dialog-component"),
  ).toBeInTheDocument();
});
