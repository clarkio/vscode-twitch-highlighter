import { cmdSuffix, Commands, Settings } from '../constants';

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

interface ICommand {
  title: string;
  command: string;
  category: string;
}

interface IConfiguration {
  type: string;
  title: string;
  properties: any;
}

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

  let extension: vscode.Extension<any>;

  setup(function (done) {
    const ext = vscode.extensions.getExtension('clarkio.twitch-highlighter');
    if (!ext) {
      throw new Error('Extension was not found.');
    }
    if (ext) { extension = ext; }
    done();
  });

  // Defines a Mocha unit test
  test("Extension loads in VSCode and is active", function () {
    assert.equal(extension.isActive, true);
  });

  test("constants.Commands exist in package.json", function () {
    const commandCollection: ICommand[] = extension.packageJSON.contributes.commands;
    for (let command in Commands) {
      const result = commandCollection.some(c => c.command === Commands[command]);
      assert.ok(result);
    }
  });

  test("constants.Settings exist in package.json", function () {
    const config: IConfiguration = extension.packageJSON.contributes.configuration;
    const properties = Object.keys(config.properties);
    for (let setting in Settings) {
      const result = properties.some(property => property === Settings[setting]);
      assert.ok(result);
    }
  });

  test('package.json commands registered in extension', function (done) {
    const commandStrings: string[] = extension.packageJSON.contributes.commands.map((c: ICommand) => c.command);

    vscode.commands.getCommands(true)
      .then((allCommands: string[]) => {
        const commands: string[] = allCommands.filter(c => c.startsWith(cmdSuffix));
        commands.forEach(command => {
          const result = commandStrings.some(c => c === command);
          assert.ok(result);
        });
        done();
      });
  });

});
