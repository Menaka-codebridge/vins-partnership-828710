import React from "react";
import { connect } from "react-redux";
import CaseInferencePageLayout from "./CaseInferencePageLayout";

const BackgroundFacts = () => {
  const props = {
    section: "Background and Facts",
  };

  return (
    <CaseInferencePageLayout props={props}>
      <h3>tee</h3>
    </CaseInferencePageLayout>
  );
};

const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  return { user, isLoggedIn };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
  getSchema: (serviceName) => dispatch.db.getSchema(serviceName),
  show: () => dispatch.loading.show(),
  hide: () => dispatch.loading.hide(),
});

export default connect(mapState, mapDispatch)(BackgroundFacts);
