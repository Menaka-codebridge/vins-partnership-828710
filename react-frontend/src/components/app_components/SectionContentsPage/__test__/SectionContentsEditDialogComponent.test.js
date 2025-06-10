import React from "react";
import { render, screen } from "@testing-library/react";

import SectionContentsEditDialogComponent from "../SectionContentsEditDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders sectionContents edit dialog", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <SectionContentsEditDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("sectionContents-edit-dialog-component")).toBeInTheDocument();
});
