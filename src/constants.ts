export const extensionId = 'clarkio.twitch-highlighter';
export const extSuffix = 'twitchHighlighter';

export enum Settings {
  'channels' = 'channels',
  'username' = 'nickname',
  'highlightColor' = 'highlightColor',
  'highlightBorder' = 'highlightBorder',
  'highlightFontColor' = 'highlightFontColor',
  'announceBot' = 'announceBot',
  'joinMessage' = 'joinMessage',
  'leaveMessage' = 'leaveMessage',
  'unhighlightOnDisconnect' = 'unhighlightOnDisconnect',
  'showHighlightsInActivityBar' = 'showHighlightsInActivityBar'
}

export enum Commands {
  'highlight' = 'twitchHighlighter.highlight',
  'unhighlight' = 'twitchHighlighter.unhighlight',
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
  'removeHighlight' = 'twitchHighlighter.removeHighlight'
}

export enum InternalCommands {
  'removeBannedHighlights' = 'twitchHighlighter.removeBannedHighlights'
}
