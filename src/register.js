import React from "react";
import { addons, types } from "@storybook/addons";
import { AddonPanel } from "@storybook/components";
import { useArgs, useParameter, useStorybookState } from "@storybook/api";


const ADDON_ID = "myaddon";
const PANEL_ID = `${ADDON_ID}/panel`;

// give a unique name for the panel
const MyPanel = ({ api }) => {
  //const story = api.getCurrentStoryData();
  //console.log(story);
  const args = useArgs();
  const argKeys = Object.keys(args).length > 0 ? Object.keys(args[0]) : [];
  const argValues = Object.values(args).length > 0 ? Object.values(args[0]) : [];
  // console.log(argKeys);
  // console.log(argValues);
  return (
    <div class="d-flex flex-column">
      <span>
      { argKeys.map(key => {
        return <p>{key}</p>
      })}
      </span>
      <span>
      { argValues.map(val => {
        return <p>{val}</p>
      })}
      </span>
    </div>
  );
};

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "My Addon",
    render: ({ active, key }) => (
      <AddonPanel active={active} key={key} api={api}>
        <MyPanel />
      </AddonPanel>
    )
  });
});
