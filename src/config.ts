import fs from 'fs'
import * as core from '@actions/core'
import { ConfigSchema } from './schema'

export function getConfig() {
    const configPath = core.getInput('config')

    if (!fs.existsSync(configPath)) {
        throw new Error(`Config file does not exist: ${configPath}`)
    }

    try {
        return ConfigSchema.parse(JSON.parse(fs.readFileSync(configPath, 'utf8')))
    } catch (error) {
        if (error instanceof Error) {
            core.warning(`Failed to load config file: ${error.message}`)
        }

        throw error
    }
}
