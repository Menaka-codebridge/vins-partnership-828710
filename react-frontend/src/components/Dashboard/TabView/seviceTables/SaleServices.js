import React from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { connect } from "react-redux";
import CustomerSalesOrdersPage from "../../../app_components/CustomerSalesOrdersPage/CustomerSalesOrdersPage";
import CustomerPurchaseOrdersPage from "../../../app_components/CustomerPurchaseOrdersPage/CustomerPurchaseOrdersPage";
import IrmsQuotationsPage from "../../../app_components/IrmsQuotationsPage/IrmsQuotationsPage";
import IrmsDeliveryOrdersPage from "../../../app_components/IrmsDeliveryOrdersPage/IrmsDeliveryOrdersPage";

const SaleServices = (props) => {
  return (
    <TabView>
      <TabPanel header="Sales Orders">
        <CustomerSalesOrdersPage />
      </TabPanel>

      <TabPanel header="Quotations">
        <IrmsQuotationsPage />
      </TabPanel>

      <TabPanel header="Purchase Orders">
        <CustomerPurchaseOrdersPage />
      </TabPanel>

      <TabPanel header="Delivery Orders">
        <IrmsDeliveryOrdersPage />
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

export default connect(mapState, mapDispatch)(SaleServices);
