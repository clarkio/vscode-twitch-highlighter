export const extSuffix = 'twitchHighlighter';

export enum Settings {
  'channels' = 'channels',
  'username' = 'nickname',
  'highlightColor' = 'highlightColor',
  'highlightBorder' = 'highlightBorder',
  'announceBot' = 'announceBot',
  'joinMessage' = 'joinMessage',
  'leaveMessage' = 'leaveMessage',
}

export enum Commands {
  'highlight' = 'twitchHighlighter.highlight',
  'unhighlightAll' = 'twitchHighlighter.unhighlightAll',
  'unhighlightSpecific' = 'twitchHighlighter.unhighlightSpecific',
  'startChat' = 'twitchHighlighter.startChat',
  'stopChat' = 'twitchHighlighter.stopChat',
  'toggleChat' = 'twitchHighlighter.toggleChat',
  'removeTwitchClientId' = 'twitchHighlighter.removeTwitchClientId',
  'setTwitchPassword' = 'twitchHighlighter.setTwitchPassword',
  'removeTwitchPassword' = 'twitchHighlighter.removeTwitchPassword',
  'refreshTreeView' = 'twitchHighlighter.refreshTreeView',
  'gotoHighlight' = 'twitchHighlighter.gotoHighlight',
  'removeHighlight' = 'twitchHighlighter.removeHighlight',
}
