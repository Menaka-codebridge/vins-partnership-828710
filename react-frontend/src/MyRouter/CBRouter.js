import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';

import SingleUsersPage from "../components/cb_components/UsersPage/SingleUsersPage";
import UserProjectLayoutPage from "../components/cb_components/UsersPage/UserProjectLayoutPage";
import SingleUserChangePasswordPage from "../components/cb_components/UserChangePasswordPage/SingleUserChangePasswordPage";
import ChataiProjectLayoutPage from "../components/cb_components/ChatAiProjectLayout/ChataiProjectLayoutPage";
import PromptsUserLayoutPage from "../components/cb_components/ChatAiPromptsPage/UserLayoutPage";
import SinglePromptsPage from "../components/cb_components/ChatAiPromptsPage/SinglePromptsPage";
import ChatAiUsageLayoutPage from "../components/cb_components/ChatAiUsagePage/ChatAiUsageLayoutPage";

import SingleUserInvitesPage from "../components/cb_components/UserInvitesPage/SingleUserInvitesPage";
import UserInvitesProjectLayoutPage from "../components/cb_components/UserInvitesPage/UserInvitesProjectLayoutPage";
import SingleCompaniesPage from "../components/cb_components/CompaniesPage/SingleCompaniesPage";
import CompanyProjectLayoutPage from "../components/cb_components/CompaniesPage/CompanyProjectLayoutPage";
import SingleBranchesPage from "../components/cb_components/BranchesPage/SingleBranchesPage";
import BranchProjectLayoutPage from "../components/cb_components/BranchesPage/BranchProjectLayoutPage";
import SingleDepartmentsPage from "../components/cb_components/DepartmentsPage/SingleDepartmentsPage";
import DepartmentProjectLayoutPage from "../components/cb_components/DepartmentsPage/DepartmentProjectLayoutPage";
import SingleSectionsPage from "../components/cb_components/SectionsPage/SingleSectionsPage";
import SectionProjectLayoutPage from "../components/cb_components/SectionsPage/SectionProjectLayoutPage";
import SingleRolesPage from "../components/cb_components/RolesPage/SingleRolesPage";
import RoleProjectLayoutPage from "../components/cb_components/RolesPage/RoleProjectLayoutPage";
import SinglePositionsPage from "../components/cb_components/PositionsPage/SinglePositionsPage";
import PositionProjectLayoutPage from "../components/cb_components/PositionsPage/PositionProjectLayoutPage";
import SingleTemplatesPage from "../components/cb_components/TemplatesPage/SingleTemplatesPage";
import TemplateProjectLayoutPage from "../components/cb_components/TemplatesPage/TemplateProjectLayoutPage";
import SingleMailsPage from "../components/cb_components/MailsPage/SingleMailsPage";
import MailProjectLayoutPage from "../components/cb_components/MailsPage/MailProjectLayoutPage";
import SingleUserAddressesPage from "../components/cb_components/UserAddressesPage/SingleUserAddressesPage";
import UserAddressProjectLayoutPage from "../components/cb_components/UserAddressesPage/UserAddressProjectLayoutPage";
import SingleCompanyAddressesPage from "../components/cb_components/CompanyAddressesPage/SingleCompanyAddressesPage";
import CompanyAddressProjectLayoutPage from "../components/cb_components/CompanyAddressesPage/CompanyAddressProjectLayoutPage";
import SingleCompanyPhonesPage from "../components/cb_components/CompanyPhonesPage/SingleCompanyPhonesPage";
import CompanyPhoneProjectLayoutPage from "../components/cb_components/CompanyPhonesPage/CompanyPhoneProjectLayoutPage";
import SingleUserPhonesPage from "../components/cb_components/UserPhonesPage/SingleUserPhonesPage";
import UserPhoneProjectLayoutPage from "../components/cb_components/UserPhonesPage/UserPhoneProjectLayoutPage";
import SingleProfilesPage from "../components/cb_components/ProfilesPage/SingleProfilesPage";
import ProfileProjectLayoutPage from "../components/cb_components/ProfilesPage/ProfileProjectLayoutPage";
import SinglePermissionServicesPage from "../components/cb_components/PermissionServicesPage/SinglePermissionServicesPage";
import PermissionServiceProjectLayoutPage from "../components/cb_components/PermissionServicesPage/PermissionServiceProjectLayoutPage";
import SinglePermissionFieldsPage from "../components/cb_components/PermissionFieldsPage/SinglePermissionFieldsPage";
import PermissionFieldProjectLayoutPage from "../components/cb_components/PermissionFieldsPage/PermissionFieldProjectLayoutPage";
import SingleDynaLoaderPage from "../components/cb_components/DynaLoaderPage/SingleDynaLoaderPage";
import DynaLoaderProjectLayoutPage from "../components/cb_components/DynaLoaderPage/DynaLoaderProjectLayoutPage";
import DynaFieldsProjectLayoutPage from "../components/cb_components/DynaFieldsPage/DynaFieldsProjectLayoutPage";

import JobQueProjectLayoutPage from "../components/cb_components/JobQuesPage/JobQueProjectLayoutPage";
import SingleMailQuesPage from "../components/cb_components/MailQuesPage/SingleMailQuesPage";
import MailQueProjectLayoutPage from "../components/cb_components/MailQuesPage/MailQueProjectLayoutPage";

import SingleInboxPage from "../components/cb_components/InboxPage/SingleInboxPage";
import InboxProjectLayoutPage from "../components/cb_components/InboxPage/InboxProjectLayoutPage";
import SingleInboxAdminPage from "../components/cb_components/InboxAdminPage/SingleInboxPage";
import InboxAdminProjectLayoutPage from "../components/cb_components/InboxAdminPage/InboxProjectLayoutPage";
import SingleNotificationsPage from "../components/cb_components/NotificationsPage/SingleNotificationsPage";
import NotificationProjectLayoutPage from "../components/cb_components/NotificationsPage/NotificationProjectLayoutPage";

import SingleDocumentStoragesPage from "../components/cb_components/DocumentStoragesPage/SingleDocumentStoragesPage";
import DocumentStorageProjectLayoutPage from "../components/cb_components/DocumentStoragesPage/DocumentStorageProjectLayoutPage";
import SingleErrorLogsPage from "../components/cb_components/ErrorLogsPage/SingleErrorLogsPage";
import ErrorLogProjectLayoutPage from "../components/cb_components/ErrorLogsPage/ErrorLogProjectLayoutPage";
import UserChangePasswordProjectLayoutPage from "../components/cb_components/UserChangePasswordPage/UserChangePasswordProjectLayoutPage";
import AssetsProjectLayoutPage from "../components/cb_components/AssetsPage/AssetsProjectLayoutPage";
import SingleAssetsPage from "../components/cb_components/AssetsPage/SingleDocumentStoragesPage";
import MediaProjectLayoutPage from "../components/cb_components/MediaPage/DocumentStorageProjectLayoutPage";
import SingleMediaPage from "../components/cb_components/MediaPage/SingleDocumentStoragesPage";
import SingleAuditsPage from "../components/cb_components/AuditsPage/SingleAuditsPage";
import AuditProjectLayoutPage from "../components/cb_components/AuditsPage/AuditProjectLayoutPage";

const CBRouter = (props) => {
    return (
        <Routes>
            // user details
            <Route path="/users/:singleUsersId" exact element={<SingleUsersPage />} />
            <Route path="/users" exact element={<UserProjectLayoutPage />} />
            <Route path="/userInvites/:singleUserInvitesId" exact element={<SingleUserInvitesPage />} />
            <Route path="/userInvites" exact element={<UserInvitesProjectLayoutPage />} />
            <Route path="/userAddresses/:singleUserAddressesId" exact element={<SingleUserAddressesPage />} />
            <Route path="/userAddresses" exact element={<UserAddressProjectLayoutPage />} />
            <Route path="/userPhones/:singleUserPhonesId" exact element={<SingleUserPhonesPage />} />
            <Route path="/userPhones" exact element={<UserPhoneProjectLayoutPage />} />
            <Route path="/userChangePassword/:singleUserChangePasswordId" exact element={<SingleUserChangePasswordPage />} />
            <Route path="/userChangePassword" exact element={<UserChangePasswordProjectLayoutPage />} />
            // user management
            <Route path="/roles/:singleRolesId" exact element={<SingleRolesPage />} />
            <Route path="/roles" exact element={<RoleProjectLayoutPage />} />
            <Route path="/positions/:singlePositionsId" exact element={<SinglePositionsPage />} />
            <Route path="/positions" exact element={<PositionProjectLayoutPage />} />
            <Route path="/profiles/:singleProfilesId" exact element={<SingleProfilesPage />} />
            <Route path="/profiles" exact element={<ProfileProjectLayoutPage />} />
            // company data
            <Route path="/companies/:singleCompaniesId" exact element={<SingleCompaniesPage />} />
            <Route path="/companies" exact element={<CompanyProjectLayoutPage />} />
            <Route path="/branches/:singleBranchesId" exact element={<SingleBranchesPage />} />
            <Route path="/branches" exact element={<BranchProjectLayoutPage />} />
            <Route path="/departments/:singleDepartmentsId" exact element={<SingleDepartmentsPage />} />
            <Route path="/departments" exact element={<DepartmentProjectLayoutPage />} />
            <Route path="/sections/:singleSectionsId" exact element={<SingleSectionsPage />} />
            <Route path="/sections" exact element={<SectionProjectLayoutPage />} />
            <Route path="/companyAddresses/:singleCompanyAddressesId" exact element={<SingleCompanyAddressesPage />} />
            <Route path="/companyAddresses" exact element={<CompanyAddressProjectLayoutPage />} />
            <Route path="/companyPhones/:singleCompanyPhonesId" exact element={<SingleCompanyPhonesPage />} />
            <Route path="/companyPhones" exact element={<CompanyPhoneProjectLayoutPage />} />
            // admin controls
            <Route path="/audits/:singleAuditsId" exact element={<SingleAuditsPage />} />
            <Route path="/audits" exact element={<AuditProjectLayoutPage />} />
            <Route path="/permissionServices/:singlePermissionServicesId" exact element={<SinglePermissionServicesPage />} />
            <Route path="/permissionServices" exact element={<PermissionServiceProjectLayoutPage />} />
            <Route path="/permissionFields/:singlePermissionFieldsId" exact element={<SinglePermissionFieldsPage />} />
            <Route path="/permissionFields" exact element={<PermissionFieldProjectLayoutPage />} />
            // notifications and messaging
            <Route path="/notifications/:singleNotificationsId" exact element={<SingleNotificationsPage />} />
            <Route path="/notifications" exact element={<NotificationProjectLayoutPage />} />
            <Route path="/inbox/:singleInboxId" exact element={<SingleInboxPage />} />
            <Route path="/inbox" exact element={<InboxProjectLayoutPage />} />
            <Route path="/inboxAdmin/:singleInboxId" exact element={<SingleInboxAdminPage />} />
            <Route path="/inboxAdmin" exact element={<InboxAdminProjectLayoutPage />} />
            <Route path="/templates/:singleTemplatesId" exact element={<SingleTemplatesPage />} />
            <Route path="/templates" exact element={<TemplateProjectLayoutPage />} />
            <Route path="/mails/:singleMailsId" exact element={<SingleMailsPage />} />
            <Route path="/mails" exact element={<MailProjectLayoutPage />} />
            // document storage
            <Route path="/documentStorages/:singleDocumentStoragesId" exact element={<SingleDocumentStoragesPage />} />
            <Route path="/documentStorages" exact element={<DocumentStorageProjectLayoutPage />} />
            <Route path="/assets" exact element={<AssetsProjectLayoutPage />} />
            <Route path="/assets/:singleAssetsId" exact element={<SingleAssetsPage />} />
            <Route path="/media" exact element={<MediaProjectLayoutPage />} />
            <Route path="/media/:singleMediaId" exact element={<SingleMediaPage />} />
            // data loader
            <Route path="/dynaLoader/:singleDynaLoaderId" exact element={<SingleDynaLoaderPage />} />
            <Route path="/dynaLoader" exact element={<DynaLoaderProjectLayoutPage />} />
            <Route path="/dynaFields" exact element={<DynaFieldsProjectLayoutPage />} />
            // jobs and ques
            <Route path="/jobQues" exact element={<JobQueProjectLayoutPage />} />
            <Route path="/mailQues/:singleMailQuesId" exact element={<SingleMailQuesPage />} />
            <Route path="/mailQues" exact element={<MailQueProjectLayoutPage />} />
            // gen ai
            <Route path="/chataiProject" element={<ChataiProjectLayoutPage />} />
            <Route path="/chataiProject/:promptId" element={<ChataiProjectLayoutPage />} />
            <Route path="/prompts" exact element={<PromptsUserLayoutPage />} />
            <Route path="/prompts/:singlePromptsId" exact element={<SinglePromptsPage />} />
            <Route path="/chataiUsage" exact element={<ChatAiUsageLayoutPage />} />
            // bugs and errors
            <Route path="/errorLogs/:singleErrorLogsId" exact element={<SingleErrorLogsPage />} />
            <Route path="/errorLogs" exact element={<ErrorLogProjectLayoutPage />} />
        </Routes>
    );
};

const mapState = (state) => {
    const { isLoggedIn } = state.auth;
    return { isLoggedIn };
  };
  const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
  });
  
  export default connect(mapState, mapDispatch)(CBRouter);
  
