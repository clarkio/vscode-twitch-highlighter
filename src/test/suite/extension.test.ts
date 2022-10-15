import { extensionId, extSuffix } from '../../constants';
import { Settings } from "../../enums";
import { Commands } from "../../enums";

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

export type EnumIndexer = {
  [Key: string]: string
};

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

  let extension: vscode.Extension<any>;

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
  test("Extension loads in VSCode and is active", function (done) {
    // Hopefully a 200ms timeout will allow the extension to activate within Windows
    // otherwise we get a false result.
    setTimeout(function () {
      assert.equal(extension.isActive, true);
      done();
    }, 200);
  });

  test("constants.Commands exist in package.json", function () {
    const commandCollection: ICommand[] = extension.packageJSON.contributes.commands;
    for (let command in Commands) {
      const result = commandCollection.some(c => c.command === (Commands as any)[command]);
      assert.ok(result);
    }
  });

  test("constants.Settings exist in package.json", function () {
    const config: IConfiguration = extension.packageJSON.contributes.configuration;
    const properties = Object.keys(config.properties);
    for (let setting in Settings) {
      const result = properties.some(property => property === `${extSuffix}.${(Settings as any)[setting]}`);
      assert.ok(result);
    }
  });

  test('package.json commands registered in extension', function (done) {
    const commandStrings: string[] = extension.packageJSON.contributes.commands.map((c: ICommand) => c.command);

    vscode.commands.getCommands(true)
      .then((allCommands: string[]) => {
        const commands: string[] = allCommands.filter(c => c.startsWith(`${extSuffix}.`));
        commands.forEach(command => {
          const result = commandStrings.some(c => c === command);
          assert.ok(result);
        });
        done();
      });
  });

});
