import React from "react";
import { render, screen } from "@testing-library/react";

import SectionContentsPage from "../SectionContentsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders sectionContents page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <SectionContentsPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("sectionContents-datatable")).toBeInTheDocument();
  expect(screen.getByRole("sectionContents-add-button")).toBeInTheDocument();
});
