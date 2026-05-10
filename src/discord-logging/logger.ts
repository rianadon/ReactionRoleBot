/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
import * as Winston from 'winston';

export enum Level {
	none = 'none',
	error = 'error',
	warn = 'warn',
	help = 'help',
	data = 'data',
	info = 'info',
	debug = 'debug',
	prompt = 'prompt',
	http = 'http',
	verbose = 'verbose',
	input = 'input',
	silly = 'silly',
}

interface LoggerProps {
	/** Path to the log file.
	 * The log file will be created if it doesn't exist.
	 * If left undefined, logging to file is disabled.
	 */
	filename?: string;
	/** If true, always outputs {@link Level.debug} to the console and log file. */
	debug?: boolean;
	/** The level to log to the console. Defaults to {@link Level.error}. */
	level_console?: Level;
	/** The level to log to the file. Defaults to {@link Level.info}. */
	level_file?: Level;
}

const LOG_FORMAT = Winston.format.combine(
	Winston.format.timestamp(),
	Winston.format.printf( ({ level, message, timestamp, stack, ...extra }) => {
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

/**
 * Creates a Winston logger with opinionated defaults.
 *
 * @see {@link LoggerProps} for more details.
 */
export default function createLogger(props?: LoggerProps): Winston.Logger {
	const {
		filename,
		debug         = (process.env.NODE_ENV !== 'production'),
		level_console = Level.error,
		level_file    = Level.info,
	} = props ?? {};

	const logger = Winston.createLogger();

	if (filename && level_file !== Level.none) {
		logger.add(new Winston.transports.File({
			filename: filename,
			format: LOG_FORMAT,
			level: debug ? 'debug' : level_file,
		}));
	}

	if (level_console !== Level.none) {
		logger.add(new Winston.transports.Console({
			format: Winston.format.combine(
				Winston.format.colorize(),
				LOG_FORMAT,
			),
			level: debug ? 'debug' : level_console,
		}));
	}

	// Rolling our own unhandled exception and Promise rejection handlers,
	// because Winston's built-in ones kind of suck.
	function errStr(err: unknown): string {
		return err instanceof Error
			? (err.stack ?? err.message)
			: `${err}`;
	}
	process.on('uncaughtExceptionMonitor', err => logger.error(errStr(err)));
	process.on('unhandledRejection',
		err => logger.error(`Unhandled Promise rejection: ${errStr(err)}`)
	);

	return logger;
}
