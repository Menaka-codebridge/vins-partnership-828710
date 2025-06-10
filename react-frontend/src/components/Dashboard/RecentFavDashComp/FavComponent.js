import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { classNames } from "primereact/utils";
import Drag from "../../../assets/media/Drag.png";
import Ellipsis from "../../../assets/media/Ellipsis Vertical.png";
import PopupCard from "../PopUpComp/popUp";

const PinnedItems = (props) => {
  const { Pinned, pinnedItems = [], isEdit } = props;
  const [showCard, setShowCard] = useState(false);
  const navigate = useNavigate();

  const handlePopUp = () => {
    setShowCard(!showCard);
  };

  const handleItemClick = (url) => {
    if (url) {
      navigate(url);
    }
  };

  return (
    <div
      className="surface-card shadow-2 border-round p-3"
      style={{ height: "10rem", position: "relative" }}
    >
      <div className="flex justify-content-between align-items-center">
        <div className="flex align-items-center">
          <img
            src={Drag}
            alt="Drag Icon"
            className={classNames("mr-2", { hidden: !isEdit })}
            style={{ width: "1rem", height: "1rem" }}
          />
          <span className="block text-900 font-medium mb-1">{Pinned}</span>
        </div>
        <img
          src={Ellipsis}
          alt="Ellipsis"
          className={classNames("mr-2", { hidden: !isEdit })}
          style={{
            height: "1rem",
            cursor: "pointer",
          }}
          onClick={handlePopUp}
        />
      </div>

      {showCard && <PopupCard />}

      <div className="text-600 font-medium mt-3">
        {pinnedItems.map((item, index) => (
          <div
            className="flex items-center text-sm p-1 cursor-pointer"
            key={index}
            style={{
              paddingLeft: "1rem",
              paddingRight: "1rem",
              marginBottom: "0.5rem",
            }}
            onClick={() => handleItemClick(item.url)}
          >
            <div className="flex items-center">
              <i
                className={item.src}
                style={{ fontSize: "1rem", marginRight: "8px" }}
              ></i>

              <span className="text-xs">{item.text}</span>
            </div>
            {item.subtext && (
              <div className="flex items-center ml-2">
                <span className="mx-2">•</span>
                <span className="text-xs text-gray-600">{item.subtext}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedItems;
