import * as assert from 'assert';

import { parseMessage } from '../../utils';

interface Theory {
  message: string;
  startLine: number;
  endLine: number;
  fileName?: string;
  comment?: string;
}

suite('Utils Tests', function() {

  test('Ensure parseMessage returns expected results', () => {

    const theories: Theory[] = [
      {
        message: '!line 5',
        startLine: 5,
        endLine: 5
      },
      {
        message: '!line settings.js 5',
        startLine: 5,
        endLine: 5,
        fileName: 'settings.js'
      },
      {
        message: '!line settings 5',
        startLine: 5,
        endLine: 5,
        fileName: 'settings'
      },
      {
        message: '!line 5 settings.js',
        startLine: 5,
        endLine: 5,
        fileName: 'settings.js'
      },
      {
        message: '!line 5 settings',
        startLine: 5,
        endLine: 5,
        comment: 'settings'
      },
      {
        message: '!line 5-15',
        startLine: 5,
        endLine: 15
      },
      {
        message: '!line 5-15 comment',
        startLine: 5,
        endLine: 15,
        comment: 'comment'
      },
      {
        message: '!line settings.js 5-15 comment',
        startLine: 5,
        endLine: 15,
        fileName: 'settings.js',
        comment: 'comment'
      },
      {
        message: '!line 5-15 settings.js comment',
        startLine: 5,
        endLine: 15,
        fileName: 'settings.js',
        comment: 'comment'
      }
    ];

    theories.forEach(({message, startLine, endLine, fileName, comment}) => {
      const result = parseMessage(message);
      assert.ok(result);
      if (result) {
        assert.equal(result.startLine, startLine);
        assert.equal(result.endLine, endLine);
        assert.equal(result.fileName, fileName);
        assert.equal(result.comments, comment);
      }
    });

  });

});
