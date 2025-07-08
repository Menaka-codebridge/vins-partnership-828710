import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';

import SingleAccidentCasesPage from "../components/app_components/AccidentCasesPage/SingleAccidentCasesPage";
import AccidentCaseProjectLayoutPage from "../components/app_components/AccidentCasesPage/AccidentCaseProjectLayoutPage";
import SingleSectionContentsPage from "../components/app_components/SectionContentsPage/SingleSectionContentsPage";
import SectionContentProjectLayoutPage from "../components/app_components/SectionContentsPage/SectionContentProjectLayoutPage";
import SingleCaseDocumentsPage from "../components/app_components/CaseDocumentsPage/SingleCaseDocumentsPage";
import CaseDocumentProjectLayoutPage from "../components/app_components/CaseDocumentsPage/CaseDocumentProjectLayoutPage";
import SingleHistoriesPage from "../components/app_components/HistoriesPage/SingleHistoriesPage";
import HistoryProjectLayoutPage from "../components/app_components/HistoriesPage/HistoryProjectLayoutPage";
import SingleTextExtractionQueuesPage from "../components/app_components/TextExtractionQueuesPage/SingleTextExtractionQueuesPage";
import TextExtractionQueueProjectLayoutPage from "../components/app_components/TextExtractionQueuesPage/TextExtractionQueueProjectLayoutPage";
import SingleGroundTruthQueuesPage from "../components/app_components/GroundTruthQueuesPage/SingleGroundTruthQueuesPage";
import GroundTruthQueueProjectLayoutPage from "../components/app_components/GroundTruthQueuesPage/GroundTruthQueueProjectLayoutPage";
import SinglePromptQueuesPage from "../components/app_components/PromptQueuesPage/SinglePromptQueuesPage";
import PromptQueueProjectLayoutPage from "../components/app_components/PromptQueuesPage/PromptQueueProjectLayoutPage";
import CaseInteractionPage from "../components/app_components/SectionContentsPage/CaseInteractionPage";
import BackgroundFactsPage from "../components/app_components/CasePage/BackgroundFactsPage";
import DashboardPage from "../components/app_components/CasePage/DashboardPage";
import SingleTokenUsagePage from "../components/app_components/TokenUsagePage/SingleTokenUsagePage";
import TokenUsageProjectLayoutPage from "../components/app_components/TokenUsagePage/TokenUsageProjectLayoutPage";
//  ~cb-add-import~

const AppRouter = (props) => {
    return (
        <Routes>
            {/* ~cb-add-unprotected-route~ */}
{/*            
                <Route path="/accidentCases/:singleAccidentCasesId" exact element={<SingleAccidentCasesPage />} />
                <Route path="/accidentCases" exact element={<AccidentCaseProjectLayoutPage />} />
                <Route path="/sectionContents/:singleSectionContentsId" exact element={<SingleSectionContentsPage />} />
                <Route path="/sectionContents" exact element={<SectionContentProjectLayoutPage />} />
                <Route path="/caseDocuments/:singleCaseDocumentsId" exact element={<SingleCaseDocumentsPage />} />
                <Route path="/caseDocuments" exact element={<CaseDocumentProjectLayoutPage />} />
                <Route path="/histories/:singleHistoriesId" exact element={<SingleHistoriesPage />} />
                <Route path="/histories" exact element={<HistoryProjectLayoutPage />} />
                <Route path="/textExtractionQueues/:singleTextExtractionQueuesId" exact element={<SingleTextExtractionQueuesPage />} />
                <Route path="/textExtractionQueues" exact element={<TextExtractionQueueProjectLayoutPage />} />
                <Route path="/groundTruthQueues/:singleGroundTruthQueuesId" exact element={<SingleGroundTruthQueuesPage />} />
                <Route path="/groundTruthQueues" exact element={<GroundTruthQueueProjectLayoutPage />} />
                <Route path="/promptQueues/:singlePromptQueuesId" exact element={<SinglePromptQueuesPage />} />
                <Route path="/promptQueues" exact element={<PromptQueueProjectLayoutPage />} /> */}
                <Route path="/caseInteraction" exact element={< CaseInteractionPage />} />
                <Route path="/backgroundFacts" exact element={< BackgroundFactsPage />} />
                <Route path="/caseDashboard" exact element={< DashboardPage />} />
                <Route path="/tokenUsage/:singleTokenUsageId" exact element={<SingleTokenUsagePage />} />
                <Route path="/tokenUsage" exact element={<TokenUsageProjectLayoutPage />} />
                {/* ~cb-add-protected-route~ */}

        </Routes>
    );
}

const mapState = (state) => {
    const { isLoggedIn } = state.auth;
    return { isLoggedIn };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data)
});

export default connect(mapState, mapDispatch)(AppRouter);
