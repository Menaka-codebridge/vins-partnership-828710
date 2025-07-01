import { useState } from "react";
import { classNames } from "primereact/utils";

import AppMenu from "./AppMenu.js";
import AppFooter from "../AppFooter.js";
import AppSideBarProvider from "./AppSideBarProvider.js";
import Toggle from "../../../assets/icons/Toggle.js";

import Home from "../../../assets/icons/Home.js";
import Data from "../../../assets/icons/Data.js";
import Messaging from "../../../assets/icons/Messaging.js";
import Report from "../../../assets/icons/Report.js";
import GenAI from "../../../assets/icons/GenAI.js";
import StaffInfo from "../../../assets/icons/StaffInfo.js";
import Stack from "../../../assets/icons/Stack.js";
import DynaLoader from "../../../assets/icons/DynaLoader.js";
import Server from "../../../assets/icons/Server.js";
import Email from "../../../assets/icons/Email.js";
import MailSent from "../../../assets/icons/MailSent.js";
import Load from "../../../assets/icons/Load.js";
import Chat from "../../../assets/icons/Chat.js";
import Terminal from "../../../assets/icons/Terminal.js";
import Documents from "../../../assets/icons/Documents.js";
import Admin from "../../../assets/icons/Admin.js";
import Users from "../../../assets/icons/Users.js";

import Building from "../../../assets/icons/Building.js";
import Profile from "../../../assets/icons/Profile.js";
import Profiles from "../../../assets/icons/Profiles.js";
import Employees from "../../../assets/icons/Employees.js";
import UserLogin from "../../../assets/icons/UserLogin.js";
import Superiors from "../../../assets/icons/Superiors.js";
import Roles from "../../../assets/icons/Roles.js";
import Positions from "../../../assets/icons/Positions.js";
import Addresses from "../../../assets/icons/Addresses.js";
import Phones from "../../../assets/icons/Phones.js";
import Companies from "../../../assets/icons/Companies.js";
import Branches from "../../../assets/icons/Branches.js";
import Sections from "../../../assets/icons/Sections.js";
import Permissions from "../../../assets/icons/Permissions.js";
import HeadOfSection from "../../../assets/icons/HeadOfSection.js";
import HeadOfDept from "../../../assets/icons/HeadOfDept.js";
import DepartmentAdmin from "../../../assets/icons/DepartmentAdmin.js";
import Files from "../../../assets/icons/Files.js";
import Tests from "../../../assets/icons/Tests.js";
import Errors from "../../../assets/icons/Errors.js";
// ~cb-add-import~

const AppSideBar = (props) => {
  const { activeKey: initialActiveKey, activeDropdown: initialActiveDropdown } =
    props;
  const [activeKey, setActiveKey] = useState(initialActiveKey);
  const [activeDropdown, setActiveDropdown] = useState(initialActiveDropdown);
  const [open, setOpen] = useState(true);
  return (
    <>
      <div
        className={classNames(
          "duration-300 flex-shrink-0",
          open ? "w-[280px]" : "w-[calc(3rem+20px)]",
        )}
      ></div>
      <AppSideBarProvider
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        open={open}
        setOpen={setOpen}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
      >
        <div
          className={classNames(
            "fixed z-[100] flex flex-col top-20 left-0 h-[calc(100vh-5rem)] overflow-y-hidden overflow-x-hidden  flex-shrink-0 shadow bg-[#F8F9FA] border-r border-[#DEE2E6] border-solid duration-300",
            open ? "w-[280px]" : "w-[calc(3rem+20px)]",
          )}
        >
          <div className="flex-grow gap-1 p-2 overflow-x-hidden overflow-y-auto no-scrollbar">
            <div className="flex gap-3 px-3 py-[10px]">
              <span className="cursor-pointer" onClick={() => setOpen(!open)}>
                <Toggle />
              </span>
            </div>
            {/* <AppMenu
              // icon={<Home />}
              label="+ Add Case"
              menuKey="Case"
              to="/caseDashboard"
            /> */}
            <AppMenu
              icon={<Home />}
              label="My Cases"
              menuKey="dashboard"
              // to="/caseDashboard"
              menus={[
                {
                  icon: <Home />,
                  label: "Accident Cases",
                  menuKey: "accidentCases",
                  to: "/accidentCases",
                },
                {
                  icon: <Home />,
                  label: "Section Contents",
                  menuKey: "sectionContents",
                  to: "/sectionContents",
                },
                {
                  icon: <Home />,
                  label: "Case Documents",
                  menuKey: "caseDocuments",
                  to: "/caseDocuments",
                },
                {
                  icon: <Home />,
                  label: "Histories",
                  menuKey: "histories",
                  to: "/histories",
                },
                // {
                //   icon: <Home />,
                //   label: "Case Interaction",
                //   menuKey: "caseInteraction",
                //   to: "/caseInteraction",
                // },
                {
                  icon: <Home />,
                  label: "Token Usage",
                  menuKey: "tokenUsage",
                  to: "/tokenUsage",
                },
                /* ~cb-add-menu~ */
              ]}
            />
          </div>
          <div
            className={classNames(
              "text-center duration-300",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            <AppFooter />
          </div>
        </div>
      </AppSideBarProvider>
    </>
  );
};

export default AppSideBar;
