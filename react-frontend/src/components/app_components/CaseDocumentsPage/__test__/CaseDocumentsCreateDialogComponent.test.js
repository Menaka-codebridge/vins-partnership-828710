import React from "react";
import { render, screen } from "@testing-library/react";

import CaseDocumentsCreateDialogComponent from "../CaseDocumentsCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders caseDocuments create dialog", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <CaseDocumentsCreateDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("caseDocuments-create-dialog-component")).toBeInTheDocument();
});
