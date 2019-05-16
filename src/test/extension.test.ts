// tslint:disable: no-unused-expression

import * as vscode from 'vscode';
import { should } from 'chai';
// import * as sinon from 'sinon';

import { extensionId, extSuffix } from '../constants';

should();

interface ICommand {
  title: string;
  command: string;
  category: string;
}

let extension: vscode.Extension<any>;

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

  setup(function () {
    const ext = vscode.extensions.getExtension(extensionId);
    if (!ext) {
      throw new Error('Extension was not found.');
    }
    if (ext) { extension = ext; }
  });

  /**
   * Because we are waiting on a process to complete in the background
   * we use the `done` function to inform mocha that this test run is
   * complete.
   */
  test("Extension should load and should be active", function (done) {
    // Hopefully a 200ms timeout will allow the extension to activate within Windows
    // otherwise we get a false result.
    setTimeout(function () {
      try {
        extension.isActive.should.be.true;
        done();
      }
      catch (error) {
        done(error);
      }
    }, 200);
  });

  suite('Extension should have package.json commands registered', function () {
    const ext = vscode.extensions.getExtension(extensionId);
    if (!ext) {
      throw new Error('Extension was not found.');
    }
    const commands = ext.packageJSON.contributes.commands.map((c: ICommand) => c.command);
    commands.forEach((command: string) => {
      test(`${command} should be registered`, function(done) {
        vscode.commands.getCommands(true)
          .then((registeredCommands: string[]) => {
            const filteredCommands = registeredCommands.filter(c => c.startsWith(`${extSuffix}`));
            const result = filteredCommands.some(c => c === command);
            try {
              result.should.be.true;
              done();
            }
            catch (error) {
              done(error);
            }
          });
      });
    });
  });

  // test("constants.Commands exist in package.json", function () {
  //   const commandCollection: ICommand[] = extension.packageJSON.contributes.commands;
  //   for (let command in Commands) {
  //     const result = commandCollection.some(c => c.command === Commands[command]);
  //     result.should.be.true;
  //   }
  // });

  // test("constants.Settings exist in package.json", function () {
  //   const config: IConfiguration = extension.packageJSON.contributes.configuration;
  //   const properties = Object.keys(config.properties);
  //   for (let setting in Settings) {
  //     const result = properties.some(property => property === `${extSuffix}.${Settings[setting]}`);
  //     result.should.be.true;
  //   }
  // });

  // test('package.json commands registered in extension', function (done) {
  //   const commandStrings: string[] = extension.packageJSON.contributes.commands.map((c: ICommand) => c.command);

  //   vscode.commands.getCommands(true)
  //     .then((allCommands: string[]) => {
  //       const commands: string[] = allCommands.filter(c => c.startsWith(`${extSuffix}.`));
  //       commands.forEach(command => {
  //         const result = commandStrings.some(c => c === command);
  //         assert.ok(result);
  //       });
  //       done();
  //     });

  // });

});
