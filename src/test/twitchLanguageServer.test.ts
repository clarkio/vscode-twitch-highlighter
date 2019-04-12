import * as assert from 'assert';
import { IBadges, requiredBadges, parseMessage } from '../twitchLanguageServer';

interface Theory {
  twitchUser: string;
  message: string;
  startLine: number;
  endLine: number;
  fileName?: string;
  comment?: string;
  requireBadges?: string[];
  badges?: IBadges;
  shouldFail?: boolean;
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
      },
      {
        twitchUser: 'moderator',
        message: '!line 5',
        startLine: 5,
        endLine: 5,
        requireBadges: ['moderator'],
        badges: {
          moderator: '1'
        }
      },
      {
        twitchUser: 'nonmoderator',
        message: '!line 5',
        startLine: 5,
        endLine: 5,
        requireBadges: ['moderator'],
        shouldFail: true
      }

    ];

    theories.forEach(({twitchUser, message, startLine, endLine, fileName, comment, requireBadges, badges, shouldFail}) => {
      if (requireBadges) {
        requiredBadges.push(...requireBadges);
      }
      const result = parseMessage('#clarkio', twitchUser, message, badges || {});

      // If the 'shouldFail' flag is true, then the result should be undefined.
      assert.ok(shouldFail ? !result : result);

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
