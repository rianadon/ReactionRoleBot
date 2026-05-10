/*******************************************************************************
 * This file is part of No BS Role Reacts, a role-assigning Discord bot.
 * Copyright (C) 2020 Mimickal (Mia Moretti).
 *
 * No BS Role Reacts is free software under the GNU Affero General Public
 * License v3.0. See LICENSE or <https://www.gnu.org/licenses/agpl-3.0.en.html>
 * for more information.
 ******************************************************************************/
const config = require('./config/env');

const Client_SQLite3 = require('knex/lib/dialects/better-sqlite3')

class CustomClient extends Client_SQLite3 {
  _driver() {
    return require('bun:sqlite');
  }

  // Get a raw connection from the database, returning a promise with the connection object.
  async acquireRawConnection() {
    const options = this.connectionSettings.options || {};

    // console.log(this.connectionSettings.filename, {
    //   readonly: !!options.readonly,
    // })
    return new this.driver.Database(this.connectionSettings.filename);
  }

  async _query(connection, obj) {
    if (!obj.sql) throw new Error('The query is empty');

    const { method } = obj;
    let callMethod;
    switch (method) {
      case 'insert':
      case 'update':
        callMethod = obj.returning ? 'all' : 'run';
        break;
      case 'counter':
      case 'del':
        callMethod = 'run';
        break;
      default:
        callMethod = 'all';
    }

    if (!connection) {
      throw new Error('No connection provided');
    }

    const statement = connection.prepare(obj.sql);
    const bindings = this._formatBindings(obj.bindings);

    if (callMethod == 'all') {
      const response = await statement.all(bindings);
      obj.response = response;
      return obj;
    }

    const response = await statement.run(bindings);
    obj.response = response;
    obj.context = {
      lastID: response.lastInsertRowid,
      changes: response.changes,
    };

    return obj;
  }
}


const COMMON_CONFIG = {
	client: CustomClient,
	useNullAsDefault: true,
};

module.exports = {
	development: {
		...COMMON_CONFIG,
		connection: {
			filename: config.database_file,
		},
		// Helps us catch hanging transactions in dev by locking up the database
		// if we forget to commit anything.
		pool: {
			min: 1,
			max: 1,
		},
	},

	testing: {
		...COMMON_CONFIG,
		connection: {
			filename: ':memory:',
		},
	},

	prod: {
		...COMMON_CONFIG,
		connection: {
			filename: config.database_file,
		},
	},
};
