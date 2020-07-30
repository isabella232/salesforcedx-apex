/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { LogService } from '@salesforce/apex-node';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { buildDescription, logLevels } from '../../utils';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-apex', 'logGet');

export default class LogGet extends SfdxCommand {
  public static description = buildDescription(
    messages.getMessage('commandDescription'),
    messages.getMessage('longDescription')
  );
  public static longDescription = messages.getMessage('longDescription');
  public static examples = [
    `$ sfdx force:apex:log:get -i <log id>`,
    `$ sfdx force:apex:log:get -i <log id> -u me@my.org`,
    `$ sfdx force:apex:log:get -n 2 -c`
  ];
  protected static supportsUsername = true;
  protected static requiresProject = false;

  protected static flagsConfig = {
    json: flags.boolean({
      description: messages.getMessage('jsonDescription')
    }),
    loglevel: flags.enum({
      description: messages.getMessage('logLevelDescription'),
      longDescription: messages.getMessage('logLevelLongDescription'),
      default: 'warn',
      options: logLevels
    }),
    apiversion: flags.builtin(),
    color: flags.boolean({
      char: 'c',
      description: messages.getMessage('colorDescription')
    }),
    logid: flags.id({
      char: 'i',
      description: messages.getMessage('logIDDescription')
    }),
    number: flags.number({
      char: 'n',
      min: 1,
      max: 25,
      description: messages.getMessage('numberDescription')
    }),
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputDirDescription'),
      longDescription: messages.getMessage('outputDirLongDescription'),
      default: '.'
    })
  };

  public async run(): Promise<AnyJson> {
    try {
      if (!this.org) {
        return Promise.reject(
          new Error(messages.getMessage('missing_auth_error'))
        );
      }
      const conn = this.org.getConnection();

      const logService = new LogService(conn);
      if (!this.flags.logid && !this.flags.number) {
        this.flags.number = 1;
      }
      const logs = await logService.getLogs({
        logId: this.flags.logid,
        numberOfLogs: this.flags.number,
        outputDir: this.flags.outputdir
      });

      if (logs.length === 0) {
        this.ux.log('No results found');
      }
      logs.forEach(log => this.ux.log(log));
      return logs;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}