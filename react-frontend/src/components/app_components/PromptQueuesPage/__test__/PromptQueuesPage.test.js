import React from "react";
import { render, screen } from "@testing-library/react";

import PromptQueuesPage from "../PromptQueuesPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders promptQueues page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <PromptQueuesPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("promptQueues-datatable")).toBeInTheDocument();
  expect(screen.getByRole("promptQueues-add-button")).toBeInTheDocument();
});
