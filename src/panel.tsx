import React from "react";
import { AddonPanel } from "@storybook/components";
import { RenderOptions } from "@storybook/addons/dist/ts3.9";
import { StoryPanel } from "./StoryPanelBase";

export const Panel: React.FC<RenderOptions> = ({ active, key }) => {
  return (
    <AddonPanel active={active} key={key}>
      <StoryPanel key={key} />
    </AddonPanel>
  );
};
