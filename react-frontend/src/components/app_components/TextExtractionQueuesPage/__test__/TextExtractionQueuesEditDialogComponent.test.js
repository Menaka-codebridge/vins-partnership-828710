import React from "react";
import { render, screen } from "@testing-library/react";

import TextExtractionQueuesEditDialogComponent from "../TextExtractionQueuesEditDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders textExtractionQueues edit dialog", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <TextExtractionQueuesEditDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("textExtractionQueues-edit-dialog-component")).toBeInTheDocument();
});
