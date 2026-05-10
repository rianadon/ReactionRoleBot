/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
// Also forward Logger type so callers only need to interact with this library.
import { Logger } from 'winston';

import GlobalLogger from './global';
import createLogger from './logger';

export { createLogger, GlobalLogger, Logger };
export * from './logger';
export * from './utils';
