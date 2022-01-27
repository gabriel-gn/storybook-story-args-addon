import React from "react";
import { API, Story, useArgs, useParameter } from "@storybook/api";

interface StoryPanelProps {
  api: API;
}

// @ts-ignore
export const StoryPanel: React.FC<StoryPanelProps> = ({ api }) => {
  let storysource: string = '';
  if (!!api) {
    // @ts-ignore
    const story: Story | undefined = api.getCurrentStoryData();
    if (!!story) {
      if (story.hasOwnProperty('parameters')) {
        storysource = story.parameters.storySource.source;
        console.log(story);
        // storysource = `
        //   (args) => ({
        //   props: args,
        //   template: \`
        //           <pm-button
        //             [label]="label"
        //             [type]="type"
        //             [busy]="busy"
        //             [busyText]="busyText"
        //             [iconClass]="iconClass"
        //             [outline]="outline"
        //             [disabled]="disabled"
        //             >
        //             Button Content
        //           </pm-button>
        //             \`
        //   })
        // ` as string;
      }
    }
  }
  const args = useArgs();
  const argKeys = Object.keys(args).length > 0 ? Object.keys(args[0]) : [];
  const argValues = Object.values(args).length > 0 ? Object.values(args[0]) : [];
  return (
    <div className="d-flex flex-column">
      { storysource }
      <span>
        { argKeys.map((arg, index) => {
          return <p key={index}>{arg}: {argValues[index]}</p>
        })}
      </span>
    </div>
  );
};
