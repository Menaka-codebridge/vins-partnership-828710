import React, { useState } from "react";
import { SplitButton } from "primereact/splitbutton";
import _ from "lodash";
import SortIcon from "../assets/media/Sort.png";

const SortMenu = ({ fields, data, setData, initialData }) => {
  const [activeSort, setActiveSort] = useState(null);

  const onMenuSort = (field, order) => {
    let sortedData;
    if (field.includes(".")) {
      sortedData = _.orderBy(
        data,
        [(item) => _.get(item, field, "")],
        [order]
      );
    } else {
      sortedData = _.orderBy(data, [field], [order]);
    }
    setData(sortedData);
    setActiveSort(`${field}-${order}`);
  };

  const sortMenuItems = [
    {
      label: "Sort by",
      template: (item) => (
        <div
          style={{
            fontWeight: "bold",
            padding: "8px 16px",
            backgroundColor: "#f8f9fa",
            fontSize: "14px",
            color: "#333",
          }}
        >
          {item.label}
        </div>
      ),
      command: () => {},
    },
    { separator: true },
    ...fields.flatMap((field) => [
      {
        label: `${field.name} (Ascending)`,
        icon: activeSort === `${field.value}-asc` ? "pi pi-check" : null,
        command: () => onMenuSort(field.value, "asc"),
        template: (item) => (
          <div
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              color: activeSort === `${field.value}-asc` ? "#007bff" : "#333",
              backgroundColor:
                activeSort === `${field.value}-asc` ? "#e6f3ff" : "transparent",
            }}
          >
            {item.icon && (
              <i
                className={item.icon}
                style={{ marginRight: "8px", color: "#007bff" }}
              />
            )}
            {item.label}
          </div>
        ),
      },
      {
        label: `${field.name} (Descending)`,
        icon: activeSort === `${field.value}-desc` ? "pi pi-check" : null,
        command: () => onMenuSort(field.value, "desc"),
        template: (item) => (
          <div
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              color: activeSort === `${field.value}-desc` ? "#007bff" : "#333",
              backgroundColor:
                activeSort === `${field.value}-desc` ? "#e6f3ff" : "transparent",
            }}
          >
            {item.icon && (
              <i
                className={item.icon}
                style={{ marginRight: "8px", color: "#007bff" }}
              />
            )}
            {item.label}
          </div>
        ),
      },
    ]),
    { separator: true },
    {
      label: "Reset",
      icon: "pi pi-refresh",
      command: () => {
        setData(_.cloneDeep(initialData));
        setActiveSort(null);
      },
      template: (item) => (
        <div
          style={{
            color: "#d30000",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            padding: "8px 16px",
            fontSize: "13px",
          }}
        >
          <i className={item.icon} style={{ marginRight: "8px" }} />
          {item.label}
        </div>
      ),
    },
  ];

  return (
    <SplitButton
      model={sortMenuItems.filter(
        (m) => !(m.icon === "pi pi-trash" && data?.length === 0)
      )}
      dropdownIcon={
        <img
          src={SortIcon}
          style={{ marginRight: "8px", width: "1em", height: "1em" }}
        />
      }
      buttonClassName="hidden"
      menuButtonClassName="ml-1 p-button-text"
      menuStyle={{ width: "250px" }}
    />
  );
};

export default SortMenu;