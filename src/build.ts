import fs from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as config from './config'
import { MetadataSchema, PackageSchema } from './schema'
import type { ZodType } from 'zod'

type PackageVersions = {
    [name: string]:
        | string
        | {
              [name: string]: string
          }
}

export default class Builder {
    private static instance: Builder
    private octokit = github.getOctokit(core.getInput('token'))

    static getInstance() {
        if (!Builder.instance) {
            Builder.instance = new Builder()
        }
        return Builder.instance
    }

    async build() {
        const packages = {} as PackageVersions
        const packageConfig = config.getConfig()

        for (const repo of packageConfig.repositories) {
            const rawRepo = typeof repo === 'string' ? repo : repo.repo
            const [owner, repoName] = rawRepo.split('/')
            if (!owner || !repoName) {
                core.warning(`Invalid repository format: ${repo}`)
                continue
            }

            const metadataPath = (typeof repo === 'object' && repo.metadataPath) || 'metadata.json'
            const metadata = await this.getJsonFromRepository(owner, repoName, metadataPath, MetadataSchema)
            if (!metadata) {
                core.warning(`Failed to get metadata from ${rawRepo}`)
                continue
            }

            const packageInfo = await this.getJsonFromRepository(
                owner,
                repoName,
                `Packages/${metadata.name}/package.json`,
                PackageSchema
            )
            if (!packageInfo) {
                core.warning(`Failed to get package.json from ${rawRepo}`)
                continue
            }

            if (metadata.group) {
                if (!(metadata.group in packages)) {
                    packages[metadata.group] = {}
                }

                const group = packages[metadata.group]
                if (typeof group === 'string') {
                    core.warning(`Group "${metadata.group}" is already a string`)
                    continue
                }

                if (packageInfo.name in group) {
                    core.warning(`Duplicate package name in group ${metadata.group}: ${packageInfo.name}`)
                    continue
                }

                group[packageInfo.name] = packageInfo.version
            } else {
                if (packageInfo.name in packages) {
                    core.warning(`Duplicate package name: ${packageInfo.name}`)
                    continue
                }

                packages[packageInfo.name] = packageInfo.version
            }
        }

        const outputFileName = core.getInput('output')
        fs.writeFileSync(outputFileName, JSON.stringify(packages))

        core.info(`Wrote ${Object.keys(packageConfig.repositories).length} package(s) to ${outputFileName}`)
    }

    private async getJsonFromRepository<T extends ZodType>(
        owner: string,
        repo: string,
        path: string,
        schema?: T
    ): Promise<Zod.infer<T> | null> {
        try {
            const meta = await this.octokit.rest.repos.getContent({ owner, repo, path })
            if (meta.status !== 200) {
                throw new Error(`status code ${meta.status}`)
            }

            if (Array.isArray(meta.data) || meta.data.type !== 'file' || !meta.data.content) {
                throw new Error(`Invalid file`)
            }

            const content = JSON.parse(Buffer.from(meta.data.content, 'base64').toString('utf-8'))
            return schema ? schema.parse(content) : content
        } catch (error) {
            core.warning(`Failed to get json from ${owner}/${repo} (path: ${path}): ${error}`)
            return null
        }
    }
}
