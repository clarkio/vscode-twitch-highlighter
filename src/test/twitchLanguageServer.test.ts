import * as assert from 'assert';
import { parseMessage } from '../twitchLanguageServer';

interface Theory {
  twitchUser: string;
  message: string;
  startLine: number;
  endLine: number;
  fileName?: string;
  comment?: string;
}

suite('twitchLanguageServer Tests', function() {

  test('Ensure parseMessage returns expected results', () => {

    const theories: Theory[] = [
      {
        twitchUser: 'clarkio',
        message: '!line 5',
        startLine: 5,
        endLine: 5
      },
      {
        twitchUser: 'clarkio',
        message: '!line settings.js 5',
        startLine: 5,
        endLine: 5,
        fileName: 'settings.js'
      },
      {
        twitchUser: 'clarkio',
        message: '!line settings 5',
        startLine: 5,
        endLine: 5,
        fileName: 'settings'
      },
      {
        twitchUser: 'clarkio',
        message: '!line 5 settings.js',
        startLine: 5,
        endLine: 5,
        fileName: 'settings.js'
      },
      {
        twitchUser: 'clarkio',
        message: '!line 5 settings',
        startLine: 5,
        endLine: 5,
        comment: 'settings'
      },
      {
        twitchUser: 'clarkio',
        message: '!line 5-15',
        startLine: 5,
        endLine: 15
      },
      {
        twitchUser: 'clarkio',
        message: '!line 5-15 comment',
        startLine: 5,
        endLine: 15,
        comment: 'comment'
      },
      {
        twitchUser: 'clarkio',
        message: '!line settings.js 5-15 comment',
        startLine: 5,
        endLine: 15,
        fileName: 'settings.js',
        comment: 'comment'
      },
      {
        twitchUser: 'clarkio',
        message: '!line 5-15 settings.js comment',
        startLine: 5,
        endLine: 15,
        fileName: 'settings.js',
        comment: 'comment'
      }
    ];

    theories.forEach(({twitchUser, message, startLine, endLine, fileName, comment}) => {
      const result = parseMessage(twitchUser, message, {});
      assert.ok(result);
      if (result) {
        assert.equal(result.twitchUser, twitchUser);
        assert.equal(result.startLine, startLine);
        assert.equal(result.endLine, endLine);
        assert.equal(result.fileName, fileName);
        assert.equal(result.comment, comment);
      }
    });

  });

});
