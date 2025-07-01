import React from "react";
import { render, screen } from "@testing-library/react";

import TextExtractionQueuesCreateDialogComponent from "../TextExtractionQueuesCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders textExtractionQueues create dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <TextExtractionQueuesCreateDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("textExtractionQueues-create-dialog-component"),
  ).toBeInTheDocument();
});
