export const cmdSuffix = 'twitchHighlighter.';

export enum Settings {
  'channels' = 'twitchHighlighter.channels',
  'username' = 'twitchHighlighter.nickname',
  'highlightColor' = 'twitchHighlighter.highlightColor',
  'highlightBorder' = 'twitchHighlighter.highlightBorder',
  'announceBot' = 'twitchHighlighter.announceBot',
  'joinMessage' = 'twitchHighlighter.joinMessage',
  'leaveMessage' = 'twitchHighlighter.leaveMessage',
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
