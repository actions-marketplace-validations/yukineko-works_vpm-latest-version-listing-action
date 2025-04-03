/**
 * The entrypoint for the action.
 */
import * as core from '@actions/core'
import Builder from './build'

export async function run(): Promise<void> {
    try {
        await Builder.getInstance().build()
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
