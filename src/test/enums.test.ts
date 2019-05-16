// tslint:disable: no-unused-expression

import * as vscode from 'vscode';
import { should } from 'chai';

import { Commands, Settings } from '../enums';
import { extensionId, extSuffix } from '../constants';

// Initialize the 'should' prototype on all objects
should();

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

suite('Enum tests', function() {
  suite('Commands should exist in package.json', function() {
    let extension: vscode.Extension<any>;
    suiteSetup(function() {
      const ext = vscode.extensions.getExtension(extensionId);
      if (!ext) {
        throw new Error('Extension was not found.');
      }
      if (ext) { extension = ext; }
    });
    for (let command in Commands) {
      test(`${command} should be in package.json contributes/commands section`, function() {
        const contribCommands = extension.packageJSON.contributes.commands;
        const result = contribCommands.some((c: ICommand) => c.command === Commands[command]);
        result.should.be.true;
      });
    }
  });
  suite('Settings should exist in package.json', function() {
    let extension: vscode.Extension<any>;
    suiteSetup(function() {
      const ext = vscode.extensions.getExtension(extensionId);
      if (!ext) {
        throw new Error('Extension was not found.');
      }
      if (ext) { extension = ext; }
    });
    for (let setting in Settings) {
      test(`${setting} should be in package.json contributes/configuration/properties section`, function() {
        const contribConfig: IConfiguration = extension.packageJSON.contributes.configuration;
        const properties = Object.keys(contribConfig.properties);
        const result = properties.some((property: string) => property === `${extSuffix}.${Settings[setting]}`);
        result.should.be.true;
      });
    }
  });
});
