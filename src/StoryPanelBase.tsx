import React from 'react';
import { API, Story, useParameter, useArgs } from '@storybook/api';
import { styled } from '@storybook/theming';
import { Link } from '@storybook/router';
import {
  SyntaxHighlighter,
  SyntaxHighlighterProps,
  SyntaxHighlighterRendererProps,
} from '@storybook/components';

// @ts-expect-error Typedefs don't currently expose `createElement` even though it exists
import { createElement as createSyntaxHighlighterElement } from 'react-syntax-highlighter';

import { SourceBlock, LocationsMap } from '@storybook/source-loader';

const StyledStoryLink = styled(Link)<{ to: string; key: string }>(({ theme }) => ({
  display: 'block',
  textDecoration: 'none',
  borderRadius: theme.appBorderRadius,
  color: 'inherit',

  '&:hover': {
    background: theme.background.hoverable,
  },
}));

const SelectedStoryHighlight = styled.div(({ theme }) => ({
  background: theme.background.hoverable,
  borderRadius: theme.appBorderRadius,
}));

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)<SyntaxHighlighterProps>(({ theme }) => ({
  fontSize: theme.typography.size.s2 - 1,
}));

const areLocationsEqual = (a: SourceBlock, b: SourceBlock): boolean =>
  a.startLoc.line === b.startLoc.line &&
  a.startLoc.col === b.startLoc.col &&
  a.endLoc.line === b.endLoc.line &&
  a.endLoc.col === b.endLoc.col;

interface StoryPanelProps {
  api: API;
}

interface SourceParams {
  source: string;
  locationsMap?: LocationsMap;
}
export const StoryPanel: React.FC<StoryPanelProps> = ({ api }) => {
  const story: Story | undefined = api.getCurrentStoryData() as Story;
  const selectedStoryRef = React.useRef<HTMLDivElement>(null);
  const getAllIndexes = (arr: string, val: string) => { // usar isso pq o resto não funciona zzzz
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
      indexes.push(i);
    }
    return indexes;
  };

  let { source, locationsMap }: SourceParams = useParameter('storySource', {
    source: '\`Loading source...\`',
  });
  const templateIndexes: number[] = getAllIndexes(source, "`");
  const templateVariablesQuotes: number[] = getAllIndexes(source, "\"");
  let templateVariables: string[] = []
  if (templateVariablesQuotes.length % 2 === 0) {
    const templateVariablesQuotesTuples: any[] = templateVariablesQuotes.reduce(function (r, a, i) {
      if (i % 2) {
        r[r.length - 1].push(a);
      } else {
        r.push([a]);
      }
      return r;
    }, []); // [[0, 1], [2, 3], [3, 4]...]
    for (let t = 0; t < templateVariablesQuotesTuples.length; t++) {
      templateVariables.push(source.substring(templateVariablesQuotesTuples[t][0] + 1, templateVariablesQuotesTuples[t][1]))
    }
  }
  source = source.substring(templateIndexes[0] + 1, templateIndexes[1] - 1);

  const storyArgs = useArgs();
  const storyArgKeys = Object.keys(storyArgs).length > 0 ? Object.keys(storyArgs[0]) : [];
  let storyArgsCode = '';
  for (let i = 0; i < storyArgKeys.length; i++) {
    if (templateVariables.length > 0) { // caso tenha variaveis de template, vê as válidas
      if (templateVariables.indexOf(storyArgKeys[i]) > -1) {
        storyArgsCode += `public ${storyArgKeys[i]} = ${JSON.stringify(storyArgs[0][storyArgKeys[i]])};\n`;
      }
    } else { // caso não, inclui qualquer uma que encontrar, até as do construtor
      storyArgsCode += `public ${storyArgKeys[i]} = ${JSON.stringify(storyArgs[0][storyArgKeys[i]])};\n`;
    }
  }

  const currentLocation = locationsMap
    ? locationsMap[
      Object.keys(locationsMap).find((key: string) => {
        const sourceLoaderId = key.split('--');
        return story.id.endsWith(sourceLoaderId[sourceLoaderId.length - 1]);
      })
      ]
    : undefined;
  React.useEffect(() => {
    if (selectedStoryRef.current) {
      selectedStoryRef.current.scrollIntoView();
    }
  }, [selectedStoryRef.current]);

  const createPart = ({ rows, stylesheet, useInlineStyles }: SyntaxHighlighterRendererProps) =>
    rows.map((node, i) =>
      createSyntaxHighlighterElement({
        node,
        stylesheet,
        useInlineStyles,
        key: `code-segment${i}`,
      })
    );

  const createStoryPart = ({
                             rows,
                             stylesheet,
                             useInlineStyles,
                             location,
                             id,
                             refId,
                           }: SyntaxHighlighterRendererProps & { location: SourceBlock; id: string; refId?: string }) => {
    const first = location.startLoc.line - 1;
    const last = location.endLoc.line;

    const storyRows = rows.slice(first, last);
    const storySource = createPart({ rows: storyRows, stylesheet, useInlineStyles });
    const storyKey = `${first}-${last}`;

    if (currentLocation && areLocationsEqual(location, currentLocation)) {
      return (
        <SelectedStoryHighlight key={storyKey} ref={selectedStoryRef}>
          {storySource}
        </SelectedStoryHighlight>
      );
    }
    return (
      <StyledStoryLink to={refId ? `/story/${refId}_${id}` : `/story/${id}`} key={storyKey}>
        {storySource}
      </StyledStoryLink>
    );
  };

  const createParts = ({ rows, stylesheet, useInlineStyles }: SyntaxHighlighterRendererProps) => {
    const parts = [];
    let lastRow = 0;

    Object.keys(locationsMap).forEach((key) => {
      const location = locationsMap[key];
      const first = location.startLoc.line - 1;
      const last = location.endLoc.line;
      const { kind, refId } = story;
      // source loader ids are different from story id
      const sourceIdParts = key.split('--');
      const id = api.storyId(kind, sourceIdParts[sourceIdParts.length - 1]);
      const start = createPart({ rows: rows.slice(lastRow, first), stylesheet, useInlineStyles });
      const storyPart = createStoryPart({ rows, stylesheet, useInlineStyles, location, id, refId });

      parts.push(start);
      parts.push(storyPart);

      lastRow = last;
    });

    const lastPart = createPart({ rows: rows.slice(lastRow), stylesheet, useInlineStyles });

    parts.push(lastPart);

    return parts;
  };

  const lineRenderer = ({
                          rows,
                          stylesheet,
                          useInlineStyles,
                        }: SyntaxHighlighterRendererProps): React.ReactNode => {
    // because of the usage of lineRenderer, all lines will be wrapped in a span
    // these spans will receive all classes on them for some reason
    // which makes colours cascade incorrectly
    // this removed that list of classnames
    const myrows = rows.map(({ properties, ...rest }) => ({
      ...rest,
      properties: { className: [] },
    }));

    if (!locationsMap || !Object.keys(locationsMap).length) {
      return createPart({ rows: myrows, stylesheet, useInlineStyles });
    }

    const parts = createParts({ rows: myrows, stylesheet, useInlineStyles });

    return <span>{parts}</span>;
  };
  return story ? (
    <div>
      <StyledSyntaxHighlighter
        language="html"
        format={true}
        copyable={false}
        padded
      >
        {source}
      </StyledSyntaxHighlighter>
      <div style={{width: '100%', borderBottom: '1px solid rgba(0, 0, 0, 0.1)'}}></div>
      <StyledSyntaxHighlighter
        language="ts"
        format={true}
        copyable={false}
        padded
      >
        {storyArgsCode}
      </StyledSyntaxHighlighter>
    </div>
  ) : null;
};
