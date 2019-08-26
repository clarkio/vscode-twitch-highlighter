import * as vscode from 'vscode';

import { HighlighterAPI } from './api';
import { Commands } from './enums';

export class App {
  constructor() {}

  public intialize(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.commands.registerCommand(Commands.requestHighlight, this.requestHighlightHandler, this),
      vscode.commands.registerCommand(Commands.requestUnhighlight, this.requestUnhighlightHandler, this),
      vscode.commands.registerCommand(Commands.requestUnhighlightAll, this.requestUnhighlightAllHandler, this)
    );
  }
  
  public API: HighlighterAPI = {
    requestHighlight(service: string, userName: string, startLine: number, endLine?: number, comments?: string) {
      vscode.commands.executeCommand(Commands.requestHighlight, 
        service,
        userName,
        startLine,
        endLine,
        comments
      );
    },
    requestUnhighlight(service: string, userName: string, lineNumber: number) {
      vscode.commands.executeCommand(Commands.requestUnhighlight,
        service,
        userName,
        lineNumber
      );
    },
    requestUnhighlightAll(service: string) {
      vscode.commands.executeCommand(Commands.requestUnhighlightAll, service);
    }
  };

  private requestHighlightHandler(service: string, userName: string, startLine: number, endLine?: number, comments?: string) {
    // TODO: Highlight the requested lines
  }

  private requestUnhighlightHandler(service: string, userName: string, lineNumber: number) {    
    // TODO: Unhighlight any highlights from this userName which is on lineNumber.
  }

  private requestUnhighlightAllHandler(service: string) {
    // TODO: Unhighlight all highlights created by this service.
  }
}