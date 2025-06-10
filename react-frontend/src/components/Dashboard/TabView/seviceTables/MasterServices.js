import React from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { connect } from "react-redux";
import MachineMasterPage from "../../../app_components/MachineMasterPage/MachineMasterPage";
import PartsMasterPage from "../../../app_components/PartsMasterPage/PartsMasterPage";
import JobStationsPage from "../../../app_components/JobStationsPage/JobStationsPage";
import VendingMachinesPage from "../../../app_components/VendingMachinesPage/VendingMachinesPage";
// import WarehouseMasterPage from "../../../app_components/WarehouseMasterPage/WarehouseMasterPage";
import MachineMasterRawPage from "../../../app_components/MachineMasterRawPage/MachineMasterRawPage";

const MasterDataServices = (props) => {
  return (
    <TabView>
      <TabPanel header="Machines">
        <MachineMasterPage />
      </TabPanel>

      <TabPanel header="Parts">
        <PartsMasterPage />
      </TabPanel>

      <TabPanel header="Job Stations">
        <JobStationsPage />
      </TabPanel>

      <TabPanel header="Vending Machines">
        <VendingMachinesPage />
      </TabPanel>

      {/* <TabPanel header="Warehouses">
        <WarehouseMasterPage />
      </TabPanel> */}

      <TabPanel header="Machines Raw Data">
        <MachineMasterRawPage />
      </TabPanel>
    </TabView>
  );
};

const mapState = (state) => {
  const { user } = state.auth;
  return { user };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(MasterDataServices);
