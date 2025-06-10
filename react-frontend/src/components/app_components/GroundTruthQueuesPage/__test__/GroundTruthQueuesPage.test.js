import React from "react";
import { render, screen } from "@testing-library/react";

import GroundTruthQueuesPage from "../GroundTruthQueuesPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders groundTruthQueues page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <GroundTruthQueuesPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("groundTruthQueues-datatable")).toBeInTheDocument();
    expect(screen.getByRole("groundTruthQueues-add-button")).toBeInTheDocument();
});
