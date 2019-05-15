// tslint:disable: no-unused-expression

import { expect, should } from 'chai';
import * as sinon from 'sinon';

import { TwitchServer } from '../server';
import { Commands, InternalCommands } from '../constants';

// Initialize the 'should' prototype on all objects
should();

interface Theory {
  twitchUser: string;
  message: string;
  startLine?: number;
  endLine?: number;
  fileName?: string;
  comment?: string;
}

interface IChatParams {
  channels: string;
  username: string;
  token: string;
  announce: boolean;
  joinMessage: string;
  leaveMessage: string;
  usageTip: string;
}

suite('twitchServer Tests unit tests', function () {

  const sendNotificationSpy = sinon.spy(function (method: string, params?: any) { });
  let chatParams: IChatParams;

  setup(function () {
    sendNotificationSpy.resetHistory();
    chatParams = {
      channels: 'fakeone,faketwo',
      username: 'fakebot',
      token: 'faketoken',
      announce: true,
      joinMessage: 'fakejoinmessage',
      leaveMessage: 'fakeleavemessage',
      usageTip: 'fakeusagetip',
    };
  });

  test('bot should announce when joining a channel using specified joinMessage', function () {
    const server = new TwitchServer(chatParams, sendNotificationSpy);
    const twitchClientSaySpy = sinon.spy(server.twitchClient, 'say');
    server.twitchClient.emit('join', 'fakechannel', 'fakeuser', true);
    twitchClientSaySpy.calledOnce.should.be.true;
    twitchClientSaySpy.calledWith('fakechannel', chatParams.joinMessage).should.be.true;
  });

  test('bot should NOT announce when joining a channel if announce is false', function () {
    chatParams.announce = false;
    const server = new TwitchServer(chatParams, sendNotificationSpy);
    const twitchClientSaySpy = sinon.spy(server.twitchClient, 'say');
    // server.onTwitchChatUserJoined('fakechannel', 'fakeuser', true);
    twitchClientSaySpy.notCalled.should.be.true;
  });

  test('bot should announce when leaving a channel using a speficied leaveMessage', function (done) {
    const server = new TwitchServer(chatParams, sendNotificationSpy);
    sinon.stub(server.twitchClient, 'getChannels').returns(chatParams.channels.split(','));
    const twitchClientDisconnectStub = sinon.stub(server.twitchClient, 'disconnect').callsFake(() => {
      server.twitchClient.emit('disconnected', '');
      return Promise.resolve(['', 0]);
    });
    const twitchClientSaySpy = sinon.spy(server.twitchClient, 'say');
    const firstChannel = chatParams.channels.split(',')[0];
    server.disconnectAsync()
      .then(() => {
        try {
          twitchClientSaySpy.calledTwice.should.be.true;
          twitchClientSaySpy.firstCall.calledWith(firstChannel, chatParams.leaveMessage).should.be.true;
          twitchClientDisconnectStub.calledOnce.should.be.true;
          done();
        }
        catch (error) {
          done(error);
        }
      });
  });

  test('bot should NOT announce when leaving a channel if announce is false', function(done) {
    chatParams.announce = false;
    const server = new TwitchServer(chatParams, sendNotificationSpy);
    sinon.stub(server.twitchClient, 'getChannels').returns(chatParams.channels.split(','));
    const twitchClientDisconnectStub = sinon.stub(server.twitchClient, 'disconnect').callsFake(() => {
      server.twitchClient.emit('disconnected', '');
      return Promise.resolve(['', 0]);
    });
    const twitchClientSaySpy = sinon.spy(server.twitchClient, 'say');
    server.disconnectAsync()
      .then(() => {
        try {
          twitchClientSaySpy.notCalled.should.be.true;
          twitchClientDisconnectStub.calledOnce.should.be.true;
          done();
        }
        catch (error) {
          done(error);
        }
      });
  });

  test('bot should send a notification to highlight line 5', function () {
    const server = new TwitchServer(chatParams, sendNotificationSpy);
    server.twitchClient.emit('chat', 'fakechannel', { username: 'fakeuser' }, '!line 5', false);
    sendNotificationSpy.calledOnce.should.be.true;
    sendNotificationSpy.calledWith(Commands.highlight, {
      twitchUser: 'fakeuser',
      startLine: 5,
      endLine: 5,
      fileName: undefined,
      comment: undefined
    }).should.be.true;
  });

  test('bot should send a notification to unhighlight line 5', function () {
    const server = new TwitchServer(chatParams, sendNotificationSpy);
    server.twitchClient.emit('chat', 'fakechannel', { username: 'fakeuser' }, '!line !5', false);
    sendNotificationSpy.calledOnce.should.be.true;
    sendNotificationSpy.calledWith(Commands.unhighlight, {
      twitchUser: 'fakeuser',
      startLine: 5,
      endLine: 5,
      fileName: undefined,
      comment: undefined
    }).should.be.true;
  });

  test('bot should send a notification to highlight line 5 with a comment', function () {
    const server = new TwitchServer(chatParams, sendNotificationSpy);
    server.twitchClient.emit('chat', 'fakechannel', { username: 'fakeuser' }, '!line 5 should be highlighted', false);
    sendNotificationSpy.calledOnce.should.be.true;
    sendNotificationSpy.calledWith(Commands.highlight, {
      twitchUser: 'fakeuser',
      startLine: 5,
      endLine: 5,
      fileName: undefined,
      comment: 'should be highlighted'
    }).should.be.true;
  });

  test('bot should send a notification to highlight line 5 in a specific file');

  test('bot should send a notification to unhighlight any highlights by a banned user', function() {
    const server = new TwitchServer(chatParams, sendNotificationSpy);
    server.twitchClient.emit('ban', 'fakechannel', 'fakeuser', 'no reason');
    sendNotificationSpy.calledOnce.should.be.true;
    sendNotificationSpy.calledWith(InternalCommands.removeBannedHighlights, 'fakeuser').should.be.true;
  });

  suite('testing parseMessage theories', function () {
    const chatParams: IChatParams = {
      channels: 'fakeone,faketwo',
      username: 'fakebot',
      token: 'faketoken',
      announce: true,
      joinMessage: 'fakejoinmessage',
      leaveMessage: 'fakeleavemessage',
      usageTip: 'fakeusagetip',
    };
    const theories: Theory[] = [
      {
        twitchUser: 'clarkio',
        message: "!line",
      },
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

    const server = new TwitchServer(chatParams, sendNotificationSpy);
    const twitchClientSaySpy = sinon.spy(server.twitchClient, 'say');

    theories.forEach((theory: Theory) => {
      test(`Should respond to ${theory.message}`, function () {
        twitchClientSaySpy.resetHistory();
        const result = server.parseMessage('fakechannel', theory.twitchUser, theory.message);
        // tslint:disable: no-unused-expression
        if (!result) {
          twitchClientSaySpy.calledOnce.should.be.true;
          twitchClientSaySpy.calledWith('fakechannel', `/me ${chatParams.usageTip}`);
          return;
        }
        expect(result!.twitchUser).to.equal(theory.twitchUser);
        expect(result!.startLine).to.equal(theory.startLine);
        expect(result!.endLine).to.equal(theory.endLine);
        expect(result!.fileName).to.equal(theory.fileName);
        expect(result!.comment).to.equal(theory.comment);
      });
    });
  });
});
