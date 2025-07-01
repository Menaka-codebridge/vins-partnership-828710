import React from "react";
import { render, screen } from "@testing-library/react";

import GroundTruthQueuesEditDialogComponent from "../GroundTruthQueuesEditDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders groundTruthQueues edit dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <GroundTruthQueuesEditDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("groundTruthQueues-edit-dialog-component"),
  ).toBeInTheDocument();
});
