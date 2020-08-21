export interface ParseMessageResult {
  highlight: boolean;
  startLine: number;
  endLine: number;
  fileName?: string;
  comments?: string;
}

export const parseMessage = (message: string) => {
  /**
   * Regex pattern to verify the command is a highlight command
   * groups the different sections of the command.
   *
   * See `https://regexr.com/48gf0` for my tests on the pattern.
   *
   * Matches:
   *
   * !line 5
   * !line !5
   * !line 5-10
   * !line !5-15
   * !line settings.json 5 | !line 5 settings.json
   * !line settings.json !5 | !line !5 settings.json
   * !line settings.json 5-15 | !line 5-15 settings.json
   * !line settings.json !5-15 | !line !5-15 settings.json
   * !line settings.json 5 including a comment | !line 5 settings.json including a comment
   * !line settings.json 5-15 including a comment | !line 5-15 settings.json including a comment
   * !line settings.json 5 5 needs a comment | !line 5 settings.json 5 needs a comment
   * !line 5 5 needs a comment
   * !line 5-7 6 should be deleted
   * !line settings.json 5-7 6 should be deleted
   * !highlight 5
   *
   */
  const commandPattern = /\!(?:line|highlight) (?:((?:[\w]+)?\.?[\w]*) )?(\!)?(-?\d+)(?:(?:-{1}|\.{2})(-?\d+))?(?: ((?:[\w]+)?\.[\w]{1,}))?(?: (.+))?/i;
  const cmdopts = commandPattern.exec(message);
  if (!cmdopts) {
    return undefined;
  }

  const highlight = cmdopts[2] === undefined;
  const fileName = cmdopts[1] || cmdopts[5];
  const startLine = +cmdopts[3];
  const endLine = cmdopts[4] ? +cmdopts[4] : +cmdopts[3];
  const comments = cmdopts[6];

  const vStartLine = endLine < startLine ? endLine : startLine;
  const vEndLine = endLine < startLine ? startLine : endLine;

  const result: ParseMessageResult = {
    highlight,
    startLine: vStartLine,
    endLine: vEndLine,
    fileName,
    comments: comments
  };

  return result;
};
