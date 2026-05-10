/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
import { Logger, createLogger, transports, format } from 'winston';


const LOG_FORMAT = format.combine(
	format.timestamp(),
	format.printf( ({ level, message, timestamp, stack, ...extra }) => {
		// Winston appends the error message to the log message by default, even
		// when stack traces are enabled, so we need to manually unappend it.
		// https://github.com/winstonjs/winston/issues/1660?ts=4#issuecomment-569413211
		if (stack) {
			// @ts-ignore This is hax and I don't know how to do it in TS.
			const err = extra[Symbol.for('splat')][0];
			message = message.replace(` ${err.message}`, '') + `\n${stack}`;
		}
		return `${timestamp} [${level}]: ${message}`;
	}),
);

export default class GlobalLogger {
	private static readonly NO_OP_LOGGER: Logger = createLogger({
		transports: [new transports.Console({
				format: format.combine(
					format.colorize(),
					LOG_FORMAT,
				),
			})]
		});
	private static _logger: Logger | undefined;

	static get logger(): Logger {
		return GlobalLogger._logger ?? GlobalLogger.NO_OP_LOGGER;
	}

	static setGlobalLogger(logger: Logger | undefined): void {
		GlobalLogger._logger = logger;
	}
}
