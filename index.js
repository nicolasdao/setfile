#!/usr/bin/env node

/**
 * Copyright (c) 2017-2019, Cloudless Consulting Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const path = require('path')
const fs = require('fs')
const YAML = require('yamljs')
const JSON2YAML = require('json2yaml')
const { obj:objHelper } = require('./src/utils')

const _printError = msg => console.log(`\x1b[1m\x1b[31mx ${msg}\x1b[0m`)
const _parseYmlToJson = (str, ymlPath) => {
	try {
		return YAML.parse(str)
	} catch(err) {
		_printError(`Invalid YAML syntax in file ${ymlPath}.`)
		process.exit(1)
	}
}

const _parseJsonToJson = (str, jsonPath) => {
	try {
		return JSON.parse(str)
	} catch(err) {
		_printError(`Invalid JSON syntax in file ${jsonPath}.`)
		process.exit(1)
	}
}

const _parseJsonToYaml = obj => {
	try {
		return JSON2YAML.stringify(obj)
	} catch(err) {
		_printError('Failed to parse obj to YAML.')
		process.exit(1)
	}
}

const _getNewProps = args => {
	if (!args)
		return []

	return args.map(arg => {
		const [prop, ...rest] = arg.split('=')
		if (!rest.length) {
			_printError(`Invalid argument ${arg}. A valid argument has an '=' sign.`)
			process.exit(1)		
		}
		const value = rest.join('=')
		return { prop, value }
	})
}

const [,,filePath, ...args] = process.argv

if (!filePath) {
	_printError('Missing required config file path.')
	process.exit(1)
}

const fileAbsPath = path.resolve(filePath)
if (!fs.existsSync(fileAbsPath)) {
	_printError(`File ${fileAbsPath} not found.`)
	process.exit(1)	
}

const ext = (path.extname(fileAbsPath) || '').toLowerCase()
if (ext != '.json' && ext != '.yml' && ext != '.yaml') {
	_printError(`File extension ${ext} not supported.`)
	process.exit(1)	
}

const newProps = _getNewProps(args)

if (newProps.length) {
	const content = fs.readFileSync(fileAbsPath).toString()
	const obj = ext == '.json' ? _parseJsonToJson(content, fileAbsPath) : _parseYmlToJson(content, fileAbsPath)
	newProps.forEach(({ prop, value }) => {
		objHelper.set(obj, prop, value)
	})

	const newContent = ext == '.json' ? JSON.stringify(obj, null, '  ') : _parseJsonToYaml(obj)
	fs.writeFileSync(fileAbsPath, newContent)
}





