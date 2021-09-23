import React from "react";
import { addons, types } from "@storybook/addons";
import { AddonPanel } from "@storybook/components";
import { StoryPanel } from "./StoryPanelBase";


const ADDON_ID = "gabrielgn/source-loader";
const PANEL_ID = `${ADDON_ID}/panel`;


addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "Source",
    render: ({ active, key }) => (
      <AddonPanel active={active} key={key} api={api}>
        <StoryPanel key={key} api={api} />
      </AddonPanel>
    )
  });
});
